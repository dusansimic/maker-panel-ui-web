<template>
  <div class="home">
    <MapView
      v-if="markersList"
      :markersList="markersList"
    ></MapView>
  </div>
</template>

<script>
import MapView from '@/components/Map'
import ky from 'ky'
import config from '@/config'
import Dexie from 'dexie'

export default {
  name: 'home',
  components: {
    MapView
  },
  data () {
    return {
      devicesList: [
        {application: 'sodaq-demo', device: 'sodaq-maker2', location: [45.244991, 19.849913]},
        {application: 'test-novi-sad', device: 'flipclick1', location: [45.2572565, 19.8445192]}
      ],
      markersList: []
    }
  },
  async mounted () {
    try {
      const db = new Dexie('filter_map')

      db.version(1).stores({
        devices: '++id,appid,devid'
      })

      const devicesList = await db.devices.toArray()

      for (const {appid: application, devid: device} of devicesList) {
        const response = await ky.get(`${config.backendUrl}/application/${application}/device/${device}?location=true`)
        const {location} = await response.json()

        this.markersList.push({
          title: device,
          body: `<a href="/application/${application}/device/${device}">Open</a>`,
          location
        })
      }

      console.log(this.markersList)
    } catch (error) {
      console.error(error)
    }
  }
}
</script>
