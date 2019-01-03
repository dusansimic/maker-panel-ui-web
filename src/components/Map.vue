<template>
  <div>
    <Mapbox
      :access-token="config.mapBoxAccessToken"
      :map-options="{
        style: 'mapbox://styles/mapbox/streets-v10',
        center: [19.8475735, 45.2458649],
        zoom: 15
      }"
      :geolocate-control="{show: false}"
      :scale-control="{
        show: true,
        position: 'top-left'
      }"
      :fullscreen-control="{
        show: true,
        position: 'top-left'
      }"
      :markers="markersList"
    ></Mapbox>
  </div>
</template>

<script>
import Mapbox from 'vue2-mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import config from '@/config'

export default {
  name: 'MapView',
  components: {
    Mapbox
  },
  props: {
    markersList: {
      type: Array,
      default: () => {
        return []
      },
      required: false
    }
  },
  computed: {
    config () {
      return config
    }
  }
}
</script>

<style>
#map {
  width: 100%;
  height: 400px;
}
</style>
