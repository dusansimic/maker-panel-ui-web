<template>
  <div>
    <br/>
    <b-card-group columns v-if="devicesList">
      <b-card
        v-for="device in devicesList"
        :key="device"
        :title="device">
        <p class="card-text">
          <b-button variant=success :to="`/device/${applicationId}/${device}`">View device</b-button>
        </p>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
import axios from 'axios'

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
    fetchDevices () {
      (async () => {
        try {
          const {data: devicesList} = await axios.get(`https://maker-panel-backend.herokuapp.com/api/rest/${this.applicationId}/devices`)

          this.devicesList = devicesList
        } catch (e) {
          console.error(e)
        }
      })()
    }
  },
  mounted () {
    this.fetchDevices()
  }
}
</script>
