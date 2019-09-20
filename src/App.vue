<template>
  <div class="off-canvas off-canvas-sidebar-show" id="app">
    <a class="off-canvas-toggle btn btn-link btn-action" v-on:click="sidebarActive = true">
      <i class="icon icon-menu"></i>
    </a>

    <div id="sidebar" class="off-canvas-sidebar" v-bind:class="{ active: sidebarActive }">
      <div class="logo">
        <img src="./assets/logo.png">
      </div>
      <div class="divider"></div>
      <ul class="nav">
        <router-link class="nav-item" exact-active-class="active" tag="li" to="/"><a>Home</a></router-link>
        <router-link class="nav-item" exact-active-class="active" tag="li" to="/outputs"><a>Outputs</a></router-link>
        <router-link class="nav-item" exact-active-class="active" tag="li" to="/inputs"><a>Inputs</a></router-link>
        <router-link class="nav-item" exact-active-class="active" tag="li" to="/pwms"><a>Pwm's</a></router-link>
        <router-link class="nav-item" exact-active-class="active" tag="li" to="/chains"><a>Chains</a></router-link>
        <router-link class="nav-item" exact-active-class="active" tag="li" to="/actions"><a>Automation</a></router-link>
        <router-link class="nav-item" exact-active-class="active" tag="li" to="/sensors"><a>Sensors</a></router-link>
        <router-link class="nav-item" exact-active-class="active" tag="li" to="/rf"><a>RF Tx/Rx</a></router-link>
        <router-link class="nav-item" exact-active-class="active" tag="li" to="/cmds"><a>Custom commands</a></router-link>
        <div class="divider"></div>
        <router-link v-if="$route.meta.protected && !$cookies.isKey('session')" class="nav-item" active-class="active" tag="li" to="/login"><a>Login</a></router-link>
        <li v-else-if="$route.meta.protected && $cookies.isKey('session')" class="nav-item" v-on:click="$cookies.remove('session');$cookies.remove('encKey');$forceUpdate()"><a href="">Logout</a></li>
      </ul>
    </div>
    <div style="min-width: 200px;" class="hide-lg"></div>
    <a class="off-canvas-overlay" v-on:click="sidebarActive = false"></a>

    <div class="off-canvas-content">
      <router-view></router-view>
      <vue-progress-bar></vue-progress-bar>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import crypt from './mixins/crypt'
import globals from './mixins/globals'
import VueProgressBar from 'vue-progressbar'
import moment from 'vue-moment'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.mixin(crypt)
Vue.mixin(globals)
Vue.use(VueProgressBar, {
  color: 'rgb(143, 255, 199)',
  failedColor: 'red',
  height: '2px'
})
Vue.use(moment)
Vue.use(VueAxios, axios)
export default {
  data () {
    return {
      sidebarActive: false
    }
  }
}
</script>

<style>
#sidebar{
  position: fixed;
}
.tile {
  padding: 5px;
  border-radius: 10px;
  border: rgba(193, 193, 193, 0.3);
  border-style: solid;
  border-width: thin;
}
.d-grid {
  display: grid;
}
.logo {
  padding-top: .4rem;
  padding-left: .4rem;
}
.nav-item{
  color: #5b657a;
  font-size: .8rem;
  font-weight: 600;
  text-transform: uppercase;
}
.panel{
  max-height: 98vh;
  min-height: 98vh;
}
.panel-nav{
  padding: .4rem .8rem;
}
.off-canvas .off-canvas-content{
  padding: .4rem .4rem .4rem .4rem !important;
}
.btn.btn-warning {
    background: #e2c458;
    border-color: #aa952f;
    color: #fff;
}
.btn.btn-code {
    background: #da3f3f;
    border-color: #a50404;
    color: #fff;
}
.btn.btn-warning:hover, .btn.btn-warning:active, .btn.btn-warning:focus {
    background: #c7ad4f;
    border-color: #aa952f;
    color: #fff;
}
.btn.btn-code:hover, .btn.btn-code:active, .btn.btn-code:focus {
    background: #b13737;
    border-color: #a50404;
    color: #fff;
}
#autorefresh {
    width: 75px;
}
.unclickable {
    pointer-events: none;
}
.btn-group{
    margin-right: 10px
}
.filter {
    margin: 10px;
}
.logs{
    word-wrap: break-word;
    word-break: break-all;
    table-layout: fixed;
}
</style>
