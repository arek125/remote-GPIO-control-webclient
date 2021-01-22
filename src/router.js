import Vue from 'vue'
import Router from 'vue-router'
// import Home from './views/Home.vue'
// import Outputs from './views/Outputs.vue'
// import Inputs from './views/Inputs.vue'
// import Actions from './views/ScheduledActions.vue'
// import Login from './views/Login.vue'
// import Pwms from './views/Pwms.vue'
// import Chains from './views/Chains.vue'
// import SensorsView from './views/SensorsView.vue'
// import Rf from './views/Rf.vue'
// import CustomCmds from './views/CustomCmds.vue'
import VueCookies from 'vue-cookies'
import axios from 'axios'

Object.defineProperty(Vue.prototype, '$http', { value: axios })
Vue.use(Router)
Vue.use(VueCookies)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/outputs',
      name: 'outputs',
      meta: { error: null, protected: true },
      //component: Outputs
      component: () => import(/* webpackChunkName: "Outputs" */ './views/Outputs.vue')
    },
    {
      path: '/inputs',
      name: 'inputs',
      meta: { error: null, protected: true },
      //component: Inputs,
      component: () => import(/* webpackChunkName: "Inputs" */ './views/Inputs.vue')
    },
    {
      path: '/pwms',
      name: 'pwms',
      meta: { error: null, protected: true },
      //component: Pwms
      component: () => import(/* webpackChunkName: "Pwms" */ './views/Pwms.vue')
    },
    {
      path: '/chains',
      name: 'chains',
      meta: { error: null, protected: true },
      //component: Chains
      component: () => import(/* webpackChunkName: "Chains" */ './views/Chains.vue')
    },
    {
      path: '/actions',
      name: 'actions',
      meta: { error: null, protected: true },
      //component: Actions
      component: () => import(/* webpackChunkName: "Actions" */ './views/ScheduledActions.vue')
    },
    {
      path: '/sensors',
      name: 'sensors',
      meta: { error: null, protected: true },
      //component: SensorsView
      component: () => import(/* webpackChunkName: "SensorsView" */ './views/SensorsView.vue')
    },
    {
      path: '/rf',
      name: 'rf',
      meta: { error: null, protected: true },
      //component: Rf,
      component: () => import(/* webpackChunkName: "Rf" */ './views/Rf.vue')
    },
    {
      path: '/cmds',
      name: 'customcmds',
      meta: { error: null, protected: true },
      //component: CustomCmds
      component: () => import(/* webpackChunkName: "CustomCmds" */ './views/CustomCmds.vue')
    },
    {
      path: '/',
      name: 'Home',
      meta: { error: null, protected: true },
      //component: Home
      component: () => import(/* webpackChunkName: "Home" */ './views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: { error: null, protected: true },
      //component: Login
      component: () => import(/* webpackChunkName: "Login" */ './views/Login.vue')
    },
    {
      path: '/vars',
      name: 'globalvariables',
      meta: { error: null, protected: true },
      //component: CustomCmds
      component: () => import(/* webpackChunkName: "Vars" */ './views/Variables.vue')
    },
    {
      path: '*',
      meta: { error: 'Specfied route not found !', protected: true },
      component: () => import(/* webpackChunkName: "Home" */ './views/Home.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  // this.$Progress.start()
  axios.post('/', 'authCheck', { headers: {
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
