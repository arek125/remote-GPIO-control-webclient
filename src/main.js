import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'spectre.css/dist/spectre.min.css'
import 'spectre.css/dist/spectre-icons.min.css'
import 'spectre.css/dist/spectre-exp.min.css'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
