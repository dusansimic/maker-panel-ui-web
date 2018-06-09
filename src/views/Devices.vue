<template>
  <div>
    <DevicesList :applicationId="this.$route.params.applicationId"/>
  </div>
</template>

<script>
import DevicesList from '@/components/DevicesList'

export default {
  name: 'Devices',
  components: {
    DevicesList
  },
  data () {
    return {

    }
  },
  methods: {

  },
  mounted () {
  }
}
</script>
