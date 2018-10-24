<template>
  <div>
    <b-card v-for="element in elementList" :key="element.name" class="chart-card">
      <p class="card-text">
        <b-dropdown size=sm text="Options" variant=light>
          <b-dropdown-item-button @click="deleteChart(element.name)">Delete</b-dropdown-item-button>
        </b-dropdown>

        <LineChart v-if="element.type === 'Line chart'" :chart-data="{labels: sourceTimes, datasets: [{label: element.name, data: sourceData[element.dataSource], backgroundColor: element.color}]}" :options="chartOptions"></LineChart>
        <BarChart v-if="element.type === 'Bar chart'" :chart-data="{labels: sourceTimes, datasets: [{label: element.name, data: sourceData[element.dataSource], backgroundColor: element.color}]}" :options="chartOptions"></BarChart>
      </p>
    </b-card>
    <b-button variant=secondary class="w-100" v-b-modal.add-element-modal id="add-button">Add element</b-button>

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
import BarChart from '@/components/BarChart'
import axios from 'axios'
import moment from 'moment'
import Dexie from 'dexie'

export default {
  name: 'Device',
  components: {
    LineChart,
    BarChart
  },
  data () {
    return {
      sourceTimes: [],
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
      sourceData: {},
      elementList: [],
      chartOptions: {responsive: true, maintainAspectRatio: false}
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
      this.sourceTimes = data.map(obj => moment(obj.metadata.time).format('hh:mm'))
    },
    getTimeInFormat (time, format) {
      return moment(time).format(format)
    },
    async onModalOk () {
      await this.db.elements.add({
        name: this.newElementData.name,
        appid: this.$route.params.applicationId,
        deviceid: this.$route.params.deviceId,
        type: this.newElementData.type,
        dataSource: this.newElementData.dataSource,
        color: this.randomHEX()
      })

      this.elementList = await this.getElements()

      this.newElementData.name = ''
      this.newElementData.type = ''
      this.newElementData.dataSource = ''
    },
    randomHEX () {
      return `#${(Math.random() * 0xFFFFFF << 0).toString(16)}`
    },
    async deleteChart (name) {
      await this.db.elements.where({
        appid: this.$route.params.applicationId,
        deviceid: this.$route.params.deviceId,
        name
      }).delete()

      this.elementList = await this.getElements()
    },
    async getElements () {
      return this.db.elements.where({
        appid: this.$route.params.applicationId,
        deviceid: this.$route.params.deviceId
      }).toArray()
    }
  },
  async mounted () {
    this.fetchData()

    this.db = new Dexie('device_display')
    this.db.version(1).stores({
      elements: 'name,appid,deviceid,type,dataSource,color'
    })

    this.elementList = await this.db.elements.toArray()
  }
}
</script>

<style>
.chart-card {
  margin-top: 10px;
}
#add-button {
  margin-top: 10px;
}
</style>
