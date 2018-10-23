<template>
  <div>
    <!-- <LineChart v-if="this.temperature" :chart-data="{labels: this.time, datasets: [{label: 'Temperature Label', backgroundColor: '#3f89ff', data: this.temperature}]}" :options="this.temperatureOptions"/> -->
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
            :options=elementSourceDataOptions
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
import moment from 'moment'
import Dexie from 'dexie'

export default {
  name: 'Device',
  components: {
    LineChart
  },
  data () {
    return {
      time: [],
      db: null,
      newElementData: {
        name: '',
        type: '',
        dataSource: ''
      },
      elementTypeOptions: [
        'Line chart',
        'Bar chart'
      ],
      elementSourceDataOptions: [],
      sourceData: {}
    }
  },
  methods: {
    async fetchData () {
      // Create requrest and get data
      let currentDate = new Date()
      let minimalDate = moment(currentDate).subtract(30, 'minutes').utcOffset('+00:00').toISOString()
      const {data, status, statusText} = await axios.get(`https://maker-panel-backend.herokuapp.com/api/rest/${this.$route.params.applicationId}/device/${this.$route.params.deviceId}?time=${minimalDate}`)
      if (status > 399) {
        return alert(statusText)
      }

      // Get source options
      this.elementSourceDataOptions = Object.keys(data[0].payload_fields)
      // Map data into different arrays
      for (const source of this.elementSourceDataOptions) {
        this.sourceData[source] = data.map(obj => obj.payload_fields[source])
      }
      this.sourceTimes = data.map(obj => obj.metadata.time)
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
