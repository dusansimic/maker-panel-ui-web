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

export default {
  name: 'ApplicationsList',
  data () {
    return {
      applicationsList: []
    }
  },
  methods: {
    fetchApplications () {
      (async () => {
        try {
          const {data: applicationsList} = await axios.get('https://maker-panel-backend.herokuapp.com/api/rest/applications')

          this.applicationsList = applicationsList
        } catch (e) {
          console.error(e)
        }
      })()
    }
  },
  mounted () {
    this.fetchApplications()
  }
}
</script>
