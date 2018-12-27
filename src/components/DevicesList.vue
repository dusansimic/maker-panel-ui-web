<template>
  <div>
    <br/>
    <b-card-group columns v-if="devicesList">
      <b-card
        v-for="device in devicesList"
        :key="device.name"
        :title="device.name">
        <div class="card-text">
          <p><i>Last updated {{getTimestamp(device.lastUpdated)}}</i></p>
          <b-button variant=success :to="`/application/${applicationId}/device/${device.name}`">View device</b-button>
        </div>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
import ky from 'ky'
import * as config from '@/config'
import moment from 'moment'

export default {
  name: 'DevicesList',
  props: {
    applicationId: String
  },
  data () {
    return {
      devicesList: []
    }
  },
  methods: {
    async fetchDevices () {
      try {
        const devicesList = await ky.get(`${config.backendUrl}/application/${this.applicationId}/devices`).json()

        this.devicesList = devicesList
      } catch (e) {
        console.error(e)
      }
    },
    getTimestamp (timestamp) {
      return moment(timestamp).fromNow()
    }
  },
  mounted () {
    this.fetchDevices()
  }
}
</script>
