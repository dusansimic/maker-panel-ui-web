import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    app_id: null,
    dev_id: null
  },
  mutations: {

  },
  actions: {
    setAppId ({state}, id) {
      state.app_id = id
    },
    setDevId ({state}, id) {
      state.dev_id = id
    }
  }
})
