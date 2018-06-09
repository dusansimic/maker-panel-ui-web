<template>
	
</template>

<script>
import LineChart from '@/components/LineChart'
import axios from 'axios'

export default {
	name: 'Device',
	components: {
		LineChart
	},
	methods: {
		fetchData () {
			(async () => {
				// Fetch data about specific device
			})()
		}
	},
	mounted () {
		this.fetchData()
	}
}
</script>
