import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Outputs from './views/Outputs.vue'
import Inputs from './views/Inputs.vue'
import Actions from './views/ScheduledActions.vue'
import Login from './views/Login.vue'
import Pwms from './views/Pwms.vue'
import Chains from './views/Chains.vue'
import SensorsView from './views/SensorsView.vue'
import VueCookies from 'vue-cookies'

Vue.use(Router)
Vue.use(VueCookies)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/outputs',
      name: 'outputs',
      meta: { error: null, protected: true },
      component: Outputs
    },
    {
      path: '/inputs',
      name: 'inputs',
      meta: { error: null, protected: true },
      component: Inputs
    },
    {
      path: '/pwms',
      name: 'pwms',
      meta: { error: null, protected: true },
      component: Pwms
    },
    {
      path: '/chains',
      name: 'chains',
      meta: { error: null, protected: true },
      component: Chains
    },
    {
      path: '/actions',
      name: 'actions',
      meta: { error: null, protected: true },
      component: Actions
    },
    {
      path: '/sensors',
      name: 'sensors',
      meta: { error: null, protected: true },
      component: SensorsView
    },
    {
      path: '/',
      name: 'Home',
      meta: { error: null, protected: true },
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      meta: { error: null, protected: true },
      component: Login
    },
    {
      path: '*',
      meta: { error: 'Specfied route not found !', protected: true },
      component: Home
    }
  ]
})

router.beforeEach((to, from, next) => {
  // this.$Progress.start()
  Vue.axios.post('/', 'authCheck', { headers: {
    'Content-type': 'raw'
  } }).then(r => {
    // this.$Progress.finish()
    if (!r.data) {
      to.meta.protected = false
      next()
    } else if (VueCookies.isKey('session'))next()
    else if (to.path !== '/login')next('/login')
    else next()
  }).catch(err => {
    // this.$Progress.fail()
    to.meta.error = err.message
    next()
  })
})

// router.onError(err => {
//   router.push({
//     path: '/error',
//     name: 'error',
//     component: ErrorV,
//     query: { error: err }
//   })
// })

export default router
