<template>
  <div>
    <h1>{{ title }}</h1>
    <LineChart v-if="this.temperature" :chart-data="{labels: this.time, datasets: [{label: 'Temperature Label', backgroundColor: '#3f89ff', data: this.temperature}]}" :options="this.temperatureOptions"/>
    <b-button variant=secondary class="w-100" v-b-modal.add-element-modal>+</b-button>

    <b-modal id=add-element-modal title="Add element" @ok=onModalOk>
      <b-form>
        <b-form-group
          id=elementNameInputGroup
          label="Name:"
          label-for=elementNameInput>
          <b-form-input
            id=elementNameInput
            type=text
            v-model=newElementData.name
            required
            placeholder="Temperature"></b-form-input>
        </b-form-group>

        <b-form-group
          id=elementTypeSelectGroup
          label="Type:"
          label-for=elementTypeSelect>
          <b-form-select
            id=elementTypeselect
            :options=elementTypeOptions
            required
            v-model=newElementData.type></b-form-select>
        </b-form-group>

        <b-form-group
          id=elementDataSourceSelectGroup
          label="Source:"
          label-for=elementDataSourceSelect>
          <b-form-select
            id=elementDataSourceSelect
            :options="['temp', 'hum', 'presure']"
            required
            v-model=newElementData.dataSource></b-form-select>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import LineChart from '@/components/LineChart'
import axios from 'axios'
import moment from 'vue-moment'
import Dexie from 'dexie'

export default {
  name: 'Device',
  components: {
    LineChart
  },
  data () {
    return {
      title: '',
      temperature: [],
      time: [],
      temperatureOptions: {
        maintainAspectRatio: false
      },
      db: null,
      newElementData: {
        name: '',
        type: '',
        dataSource: ''
      },
      elementTypeOptions: [
        'Line chart',
        'Bar chart'
      ]
    }
  },
  methods: {
    async fetchData () {
      let date = new Date()
      date.setDate(date.getDate() - 0.03)
      const {data} = await axios.get(`https://maker-panel-backend.herokuapp.com/api/rest/${this.$route.params.applicationId}/device/${this.$route.params.deviceId}?time=${date.toISOString()}`)

      for (const payload in data) {
        if (data[payload].payload_fields.name) { // If name exists add it as title to data
          this['title'] = data[payload].payload_fields.name
        }
        console.log(data[payload])
        for (const field in data[payload].payload_fields) {
          if (this[field] == null) { // If null make it an array
            this[field] = []
          }
          if (this['time'] == null) {
            this['time'] = []
          }
          this[field].push(data[payload].payload_fields[field])
          this['time'].push(this.getTimeInFormat(data[payload].metadata.time, 'HH:mm'))
        }
      }
    },
    getTimeInFormat (time, format) {
      return moment(time).format(format)
    },
    async onModalOk () {
      this.db.elements.put({
        name: this.newElementData.name,
        type: this.newElementData.type,
        dataSource: this.newElementData.dataSource
      })
    }
  },
  async mounted () {
    this.fetchData()

    this.db = new Dexie('device_display')
    this.db.version(1).stores({
      elements: 'name,type,dataSource'
    })
  }
}
</script>
