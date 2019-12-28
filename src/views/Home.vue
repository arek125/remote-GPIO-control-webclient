<template>
  <div class="Home">
    <div class="modal" v-bind:class="{ active: countDownModal.active }">
        <a class="modal-overlay"></a>
        <div class="modal-container">
            <div class="modal-body">
                <div class="content">
                    Page will realod in {{countDownModal.currentTime}} seconds.
                </div>
            </div>
        </div>
    </div>
    <div class="modal" v-bind:class="{ active: logsModalActive }">
        <a class="modal-overlay" aria-label="Close" v-on:click="logsModalActive = false"></a>
        <div class="modal-container log-container">
            <div class="modal-header">
                <div class="modal-title h5">Server Logs</div>
                <a class="btn btn-clear float-right" aria-label="Close" v-on:click="logsModalActive = false"></a>
            </div>
            <div class="modal-body">
                <ServerLogs v-if="logsModalActive"/>
            </div>
        </div>
    </div>
    <!-- <div class="modal" v-bind:class="{ active: modalMCL.active }">
        <a class="modal-overlay" aria-label="Close" v-on:click="modalMCL.active = false"></a>
        <div class="modal-container">
            <div class="modal-header">
                <a class="btn btn-clear float-right" aria-label="Close" v-on:click="modalMCL.active = false"></a>
                <div class="modal-title h5">Main command line</div>
                <Error v-if="modalMCL.errors.length" v-on:close-err="modalMCL.errors = []" v-bind:error-array="modalMCL.errors"/>
            </div>
            <div class="modal-body">
                <div class="content">
                    <input class="form-input" type="text" placeholder="Main command line" v-model="modalMCL.cmdLine">
                    <p class="text-gray">-mode 'mode' # wwwOnly or mobileOnly, by default both modes are on</p>
                    <p class="text-gray">-mobileport 'port number' #for tcp/udp mobile connection, default is 8888</p>
                    <p class="text-gray">-wwwwport 'port number' #for http connection, default is 80</p>
                    <p class="text-gray">-password 'password string' #for encryprion,if this parameter is not set encrypted communication is disabled</p>
                    <p class="text-gray">-debug #for debugging purposes</p>
                    <p class="text-gray">-db_path 'database file path string' #to set diffrent database file path</p>
                    <p class="text-gray">-ds18b20 #to enalbe ds18b20 sensors support all connected to 1wire</p>
                    <p class="text-gray">-dht '11 or 22 or AM2302' 'GPIO BCM PIN number' #to enalbe dht* sensor support</p>
                    <p class="text-gray">-tsl2561 'gain from 1-16 or 0 for auto gain' #to enalbe tsl2561 sensor support</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" v-on:click="comAndReload('UpdateMCL;'+modalMCL.cmdLine, 20, 'Update cmd line and restart ?')" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
            </div>
        </div>
    </div> -->
    <div class="modal" v-bind:class="{ active: modalConfig.active }">
        <a class="modal-overlay" aria-label="Close" v-on:click="modalConfig.active = false"></a>
        <div class="modal-container">
            <div class="modal-header">
                <a class="btn btn-clear float-right" aria-label="Close" v-on:click="modalConfig.active = false"></a>
                <div class="modal-title h5">RGC-Config</div>
                <Error v-if="modalConfig.errors.length" v-on:close-err="modalConfig.errors = []" v-bind:error-array="modalConfig.errors"/>
            </div>
            <div class="modal-body">
                <div class="content">
                    <div v-for="section in modalConfig.sections" :key="section.name">
                        <h3>{{section.name}}</h3>
                        <table class="table table-striped table-hover">
                          <tbody>
                            <tr v-for="kv in section.kvs" :key="kv.key">
                              <td>{{kv.key}}</td>
                              <td><input class="form-input" type="text" v-model="kv.val"></td>
                            </tr>
                          </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" v-on:click="setConfigSections()" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
            </div>
        </div>
    </div>
    <div class="container">
      <div class="columns">
        <div class="panel column col-4 col-md-12">
          <div class="panel-header">
            <div class="panel-title"><h3>Home</h3></div>
          </div>
          <div class="panel-nav">
            <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
          </div>
          <div class="panel-body">
            <ul>
              <li>Hostname: {{serverInfo.hostname}}</li>
              <li>Load: {{serverInfo.load}}</li>
              <li>Version: {{serverInfo.version}}</li>
              <li>Up since: {{serverInfo.upSince}}</li>
              <li v-for="ti in timeInfo" :key="ti">{{ti}}</li>
            </ul>
          </div>
          <div class="panel-footer">
            <div class="btn-group btn-group-block">
              <button class="btn" v-on:click="getConfigSections()">Config</button>
              <button class="btn" v-on:click="comAndReload('Server_restart', 20, 'Restart RGC app ?')">Restart RGC app</button>
              <button class="btn" v-on:click="comAndReload('Server_reboot', 60, 'Reboot server ?')">Reboot server</button>
              <button class="btn" v-on:click="logsModalActive = true">Server Logs</button>
              <button class="btn" v-on:click="openLink('https://github.com/arek125/remote-GPIO-control-server/releases')">Change log</button>
              <button class="btn" v-on:click="openLink('https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=arek125%40gmail%2ecom&lc=PL&item_name=RGC%20FAMILY&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHostedGuest')">Donate</button>
              <button class="btn" v-on:click="openLink('https://github.com/arek125/remote-GPIO-control-server/issues')">Issue report</button>
              <button class="btn" v-on:click="comAndReload('ServerUpdateFromGH', 60, 'Perform server update now ?')" v-if="updateAvalible">Update to {{newTagName}} ready !</button>
            </div>
          </div>
        </div>
        <History class="column col-4 col-md-12" category="all"/>
        <LinkedPis class="column col-4 col-md-12"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import ServerLogs from '@/components/ServerLogs.vue'
import History from '@/components/History.vue'
import LinkedPis from '@/components/LinkedPis.vue'

export default {
  name: 'Home',
  mounted () {
    this.getSystemInfo().then(() => {
      return this.doQPost('LastVersion')
    }).then((datalist) => {
      if (parseFloat(datalist[2]) > parseFloat(this.serverInfo.version)) { this.updateAvalible = true }
      this.newTagName = datalist[2]
    })
  },
  beforeDestroy () {},
  data () {
    return {
      countDownModal: {
        active: false,
        currentTime: 0
      },
      // modalMCL: {
      //   active: false,
      //   errors: [],
      //   cmdLine: ''
      // },
      modalConfig: {
        active: false,
        errors: [],
        sections: []
      },
      logsModalActive: false,
      serverInfo: {},
      timeInfo: [],
      updateAvalible: false,
      newTagName: ''
    }
  },
  methods: {
    comAndReload (command, daley, title) {
      if (confirm(title)) {
        this.doPost(command).finally(() => {
          this.countDownModal.currentTime = daley
          this.countDownModal.active = true
          setInterval(() => {
            this.countDownModal.currentTime -= 1
            if (!this.countDownModal.currentTime) { location.reload() }
          }, 1000)
        })
        this.modalMCL.active = false
      }
    },
    getSystemInfo () {
      return this.doPost('Server_info').then(datalist => {
        this.serverInfo = {
          hostname: datalist[2],
          load: datalist[3],
          version: datalist[4],
          upSince: this.$moment.utc(datalist[5], 'YYYY-MM-DD HH:mm:ss.SSS').local().format('YYYY-MM-DD HH:mm:ss')
        }
        this.timeInfo = []
        for (let j = 6; j < (datalist.length - 1); j++) { this.timeInfo.push(datalist[j]) }
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    openLink (link) {
      window.open(link, '_blank')
    },
    // openMCLModal () {
    //   this.modalMCL.active = true
    //   this.modalMCL.errors = []
    //   this.doPost('GetMCL').then(datalist => {
    //     this.modalMCL.cmdLine = datalist[2]
    //   }).catch(err => {
    //     this.modalMCL.errors.push(err.message)
    //   })
    // },
    // updateMCLModal () {
    //   this.modalMCL.errors = []
    //   this.doPost('UpdateMCL;' + this.modalMCL.cmdLine).then(() => {
    //     this.modalMCL.active = false
    //   }).catch(err => {
    //     this.modalMCL.errors.push(err.message)
    //   })
    // },
    getConfigSections (){
      this.modalConfig.active = true
      this.modalConfig.errors = []
      this.doPost('GetConfigSections').then((datalist) => {
        this.modalConfig.sections = []
        for (var j = 2; j < (datalist.length - 1); j = j + 2){
          let kvArr = datalist[j+1].split("$")
          let kvObjArr = []
          for (let i = 0;i<kvArr.length;i=i+2)kvObjArr.push({key: kvArr[i], val: kvArr[i+1]})
          this.modalConfig.sections.push({name: datalist[j], kvs: kvObjArr})
        }
      }).catch(err => {
        this.modalConfig.errors.push(err.message)
      })
    },
    setConfigSections () {
      this.modalConfig.errors = []
      let configArr = []
      for(let i=0;i<this.modalConfig.sections.length;i++){
        let section = this.modalConfig.sections[i]
        for(let j=0;j<section.kvs.length;j++)configArr.push(section.name,section.kvs[j].key,section.kvs[j].val)
      }
      this.doPost('SetConfigSections;'+configArr.join(";")).then(() => {
        this.modalConfig.active = false
        this.comAndReload('Server_restart', 20, 'Restart RGC app now ?')
      }).catch(err => {
        this.modalConfig.errors.push(err.message)
      })
    },
  },
  components: {
    Error,
    ServerLogs,
    History,
    LinkedPis
  }
}
</script>

<style>
.log-container{
  max-width: 95vw !important;
}
</style>
