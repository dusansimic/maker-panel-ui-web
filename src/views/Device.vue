<template>
  <div>
    <b-card v-for="element in elementList" :key="element.name" class="chart-card">
      <p class="card-text">
        <b-button variant=danger size=sm @click="deleteElement(element.id)" class="float-right">Delete</b-button>

        <LineChart v-if="element.type === 'Line chart'" :chart-data="{labels: sourceTimes, datasets: [{label: element.name, data: sourceData[element.dataSource], backgroundColor: element.color}]}" :options="chartOptions" :height="350"></LineChart>
        <BarChart v-if="element.type === 'Bar chart'" :chart-data="{labels: sourceTimes, datasets: [{label: element.name, data: sourceData[element.dataSource], backgroundColor: element.color}]}" :options="chartOptions" :height="350"></BarChart>
        <PlainValue v-if="element.type === 'Plain value' && sourceData[element.dataSource]" :name="element.name" :value="sourceData[element.dataSource][0]" :unit="element.unit"></PlainValue>
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
          id=elementUnitInputGroup
          label="Unit:"
          label-for=elementUintInput>
          <b-form-input
            id=elementUnitInput
            type=text
            v-model=newElementData.unit
            required
            placeholder="C°"></b-form-input>
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

    <notifications group=custom-template-warning position="top center">
      <template slot=body slot-scope=props>
        <b-alert show dismissible variant=warning @dismissed="props.close">
          <h4>{{ props.item.title }}</h4>
          <p>{{ props.item.text }}</p>
        </b-alert>
      </template>
    </notifications>
    <notifications group=custom-template-danger position="top center">
      <template slot=body slot-scope=props>
        <b-alert show dismissible variant=danger @dismissed="props.close">
          <h4>{{ props.item.title }}</h4>
          <p>{{ props.item.text }}</p>
        </b-alert>
      </template>°
    </notifications>
  </div>
</template>

<script>
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
import PlainValue from '@/components/PlainValue'
import ky from 'ky'
import moment from 'moment'
import Dexie from 'dexie'
import config from '@/config'

export default {
  name: 'Device',
  components: {
    LineChart,
    BarChart,
    PlainValue
  },
  data () {
    return {
      sourceTimes: [],
      db: null,
      newElementData: {
        name: '',
        type: '',
        unit: '',
        dataSource: ''
      },
      elementTypeOptions: [
        'Line chart',
        'Bar chart',
        'Plain value'
      ],
      elementSourceDataOptions: [],
      sourceData: {},
      sourceDataReady: false,
      elementList: [],
      chartOptions: {
        responsive: true
      },
      ids: {
        application: this.$route.params.applicationId,
        device: this.$route.params.deviceId
      }
    }
  },
  methods: {
    async fetchData ({removeLast}) {
      try {
        const response = await ky.get(`${config.backendUrl}/application/${this.ids.application}/device/${this.ids.device}`)
        const data = await response.json()

        // Create requrest and get data
        let currentDate = new Date()
        let minimalDate = moment(currentDate).subtract(30, 'minutes').utcOffset('+00:00').toISOString()

        if (data.length === 0) {
          return this.$notify({
            group: 'custom-template-warning',
            title: 'Warning',
            text: 'No data was provided!'
          })
        }
        if (new Date(data[0].metadata.time) < new Date(minimalDate)) {
          this.$notify({
            group: 'custom-template-warning',
            title: 'Warning',
            text: 'This data might not be up to date!'
          })
        }

        // Get source options
        this.elementSourceDataOptions = Object.keys(data[0].payload_fields)
        // Map data into different arrays
        for (const source of this.elementSourceDataOptions) {
          this.sourceData[source] = data.map(obj => obj.payload_fields[source])
          if (removeLast) {
            this.sourceData[source].splice(0, 1)
          }
        }
        // Get time array
        this.sourceTimes = data.map(obj => moment(obj.metadata.time).format('HH:mm'))
        if (removeLast) {
          this.sourceTimes.splice(0, 1)
        }
        this.sourceDataReady = true
      } catch (error) {
        const {status, statusText} = error

        if (status > 399) {
          return this.$notify({
            group: 'custom-template-danger',
            title: 'Error',
            text: statusText
          })
        }
      }
    },
    getTimeInFormat (time, format) {
      return moment(time).format(format)
    },
    async onModalOk () {
      // Add data to table
      await this.db.elements.add({
        name: this.newElementData.name,
        appid: this.ids.application,
        deviceid: this.ids.device,
        type: this.newElementData.type,
        unit: this.newElementData.unit,
        dataSource: this.newElementData.dataSource,
        color: this.randomHEX()
      })

      // Refresh elements list
      this.elementList = await this.getElements()

      // Clear data input
      this.newElementData.name = ''
      this.newElementData.type = ''
      this.newElementData.dataSource = ''
    },
    randomHEX () {
      return `#${(Math.random() * 0xFFFFFF << 0).toString(16)}`
    },
    async deleteElement (id) {
      // Delete element with specified id
      await this.db.elements.where('id').equals(id).delete()

      // Update element list
      this.elementList = await this.getElements()
    },
    async getElements () {
      // Get elements from table
      // App and device ids need to match current device
      return this.db.elements.where({
        appid: this.ids.application,
        deviceid: this.ids.device
      }).toArray()
    }
  },
  async mounted () {
    this.fetchData({removeLast: false})
    const self = this
    setInterval(() => {
      self.fetchData({removeLast: true})
    }, 60000)

    // Create indexeddb connection
    this.db = new Dexie('device_display')
    // Create table schema
    this.db.version(1).stores({
      elements: '++id,name,appid,deviceid,type,dataSource,color'
    })

    // Get element that are already added to table
    this.elementList = await this.getElements()
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
