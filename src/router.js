import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import Applications from './views/Applications'
import Devices from './views/Devices'
import Device from './views/Device'
import About from './views/About'
import FilterMap from './views/FilterMap'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/apps',
      name: 'apps',
      component: Applications
    },
    {
      path: '/devices/:applicationId',
      name: 'devices',
      component: Devices
    },
    {
      path: '/application/:applicationId/device/:deviceId',
      name: 'device',
      component: Device
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/mapfilter',
      name: 'filtermap',
      component: FilterMap
    }
  ]
})
