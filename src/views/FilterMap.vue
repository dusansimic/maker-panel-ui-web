<template>
  <div id="mapfilter">
    <b-form-group v-if="devicesList">
      <b-list-group>
        <b-list-group-item
          v-for="device in devicesList"
          :key="device.name"
          class="flex-column align-items-start"
        >
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ device.name }}</h5>
            <small style="text-align: right"><strong>{{ device.application }}</strong><br/><i>{{ getTimestamp(device.lastUpdated) }}</i></small>
            <b-button :variant="device.added ? 'danger' : 'primary'" @click="saveDevice(device)" size=sm>{{ device.added ? 'Remove' : 'Add' }}</b-button>
          </div>
        </b-list-group-item>
      </b-list-group>
    </b-form-group>
  </div>
</template>

<script>
import ky from 'ky'
import config from '@/config'
import moment from 'moment'
import Dexie from 'dexie'

export default {
  name: 'FilterMapView',
  data () {
    return {
      db_: null,
      devicesList: []
    }
  },
  methods: {
    getTimestamp (timestamp) {
      return moment(timestamp).fromNow()
    },
    changedCheck (device) {
      device.checked = !device.checked
    },
    async saveDevice (device) {
      const db = this.db_
      device.added = !device.added

      if (device.added) {
        await db.devices.add({
          appid: device.application,
          devid: device.name
        })
      } else {
        await db.devices.where({
          appid: device.application,
          devid: device.name
        }).delete()
      }
    }
  },
  async mounted () {
    try {
      const db = new Dexie('filter_map')

      db.version(1).stores({
        devices: '++id,appid,devid'
      })

      const savedDevicesList = await db.devices.toArray()

      this.db_ = db

      const applicationList = await ky.get(`${config.backendUrl}/applications`).json()

      const devicesList = []

      for (const application of applicationList) {
        const data = await ky.get(`${config.backendUrl}/application/${application}/devices`).json()
        data.map(device => {
          devicesList.push({...device, application, added: false})
        })
      }

      this.devicesList = devicesList.map(device => {
        device.added = savedDevicesList.filter(addedDevice => addedDevice.devid === device.name && addedDevice.appid === device.application).length !== 0
        return device
      })
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<style>
#mapfilter {
  padding-top: 15px;
}
</style>
