<template>
  <div>
    <br/>
    <b-card-group columns v-if="applicationsList">
      <b-card
        v-for="application in applicationsList"
        :key="application"
        :title="application">
        <p class="card-text">
          <b-button variant=success :to="`/devices/${application}`">View application</b-button>
        </p>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
import axios from 'axios'
import * as config from '@/config'

export default {
  name: 'ApplicationsList',
  data () {
    return {
      applicationsList: []
    }
  },
  methods: {
    async fetchApplications () {
      try {
        const {data: applicationsList} = await axios.get(`${config.backendUrl}/applications`)

        this.applicationsList = applicationsList
      } catch (e) {
        console.error(e)
      }
    }
  },
  mounted () {
    this.fetchApplications()
  }
}
</script>
