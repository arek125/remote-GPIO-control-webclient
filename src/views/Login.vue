<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Login</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <!-- navigation components: tabs, breadcrumbs or pagination -->
            </div>
            <div class="panel-body">
                <div v-show="!logged" class="form-group">
                    <label class="form-label" for="psw">Password:</label>
                    <input class="form-input" type="password" id="psw" v-model="passwordI">
                    <label class="form-checkbox"><input type="checkbox" v-model="remember"><i class="form-icon"></i> Remember me</label>
                    <button class="btn btn-lg" v-bind:class="{ loading: loading }" v-show="!logged" v-on:click="login()" :disabled="loading">Login</button>
                </div>
                <div v-show="logged" class="logged">
                    <span>Logged </span>
                    <br/>
                    <button class="btn btn-lg" v-show="logged" v-on:click="logout()" :disabled="this.loading">Logout</button>
                </div>

            </div>
            <!-- <div class="panel-footer">
                <button class="btn btn-lg" v-bind:class="{ loading: loading }" v-show="!logged" v-on:click="login()" :disabled="loading">Login</button>
                <button class="btn btn-lg" v-show="logged" v-on:click="logout()" :disabled="this.loading">Logout</button>
            </div> -->
        </div>
    </div>
</template>
<script>
import Error from '@/components/Error.vue'
import sha256 from 'crypto-js/sha256'
import md5 from 'crypto-js/md5'

export default {
  name: 'login',
  data () {
    return {
      logged: false,
      remember: false,
      passwordI: ''
    }
  },
  mounted () {
    if (this.$cookies.isKey('session')) {
      this.logged = true
    }
  },
  methods: {
    login () {
      this.$Progress.start()
      this.loading = true
      this.$http.post('/', sha256(this.passwordI).toString() + ';' + this.encrypt('version_check', md5(this.passwordI).toString()), { headers: {
        'Content-type': 'raw'
      } }).then(r => {
        this.$route.meta.error = null
        let datalist = r.data.split(';')
        if (Array.isArray(datalist)) {
          if (this.remember) {
            this.$cookies.set('session', sha256(this.passwordI).toString(), -1)
            this.$cookies.set('encKey', md5(this.passwordI).toString(), -1)
          } else {
            this.$cookies.set('session', sha256(this.passwordI).toString(), '0')
            this.$cookies.set('encKey', md5(this.passwordI).toString(), '0')
          }
          this.logged = true
          this.$router.push('/')
        } else { this.$route.meta.error = 'Not an array in response' }
      }).catch(err => {
        this.$route.meta.error = err.message
        this.passwordI = ''
        this.$Progress.fail()
      }).then(() => {
        this.loading = false
      })
    },
    logout () {
      this.$cookies.remove('session')
      this.$cookies.remove('encKey')
      this.logged = false
    }
  },
  components: {
    Error
  }

}
</script>
