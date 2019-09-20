<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Linked pi devices</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getPis()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openModal('Add new linked pi',-1,'','','','UDP',8888)"><i class="icon icon-plus centered"></i></button>
                </div>
            </div>
            <div class="panel-body">
                <div class="modal" v-bind:class="{ active: modalData.active }">
                    <a class="modal-overlay" aria-label="Close" v-on:click="modalData.active = false"></a>
                    <div class="modal-container">
                        <div class="modal-header">
                            <a class="btn btn-clear float-right" aria-label="Close" v-on:click="modalData.active = false"></a>
                            <div class="modal-title h5">{{ modalData.title }}</div>
                            <Error v-if="modalData.errors.length" v-on:close-err="modalData.errors = []" v-bind:error-array="modalData.errors"/>
                        </div>
                        <div class="modal-body">
                            <div class="content">
                                <form class="form-horizontal">
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="mode">Connection mode</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="mode" v-model="modalData.mode">
                                                <option value="UDP">UDP</option>
                                                <option value="HTTP">HTTP</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="name">Name</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="text" id="name" placeholder="Name" v-model="modalData.name">
                                        </div>
                                    </div>
                                    <div class="form-group" v-if="modalData.mode == 'HTTP'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="cmd">Url</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="text" id="cmd" placeholder="HTTP://HOST:PORT" v-model="modalData.url">
                                        </div>
                                    </div>
                                    <div class="form-group" v-else>
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="ip">IP/HOST</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="text" id="ip" v-model="modalData.ip">
                                        </div>
                                    </div>
                                    <div class="form-group" v-show="modalData.mode == 'UDP'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="port">Port</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="port" v-model="modalData.port">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="psw">Password</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="password" id="psw" v-model="modalData.password">
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-code float-left" v-show="modalData.id !== -1" v-on:click="modalAction(true)" :disabled="this.loading"><i class="icon icon-delete"></i> Delete</button>
                            <button class="btn btn-primary" v-on:click="modalAction(false)" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div v-if="!pis.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no linked pis configured</p>
                        <p class="empty-subtitle">Click the button to configure new</p>
                        <div class="empty-action">
                            <button class="btn btn-primary" v-on:click="openModal('Add new linked pi',-1,'','','','UDP',8888)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <table class="table table-striped" v-else>
                        <thead>
                            <tr>
                                <th>Edit</th>
                                <th>Active</th>
                                <th>Name</th>
                                <th>Url/Ip/Host</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(pi) in pis" :key="pi.id">
                                <td><i class="icon icon-edit c-hand" v-on:click="openModal('Edit: '+pi.name,pi.id,pi.name,pi.url,pi.password,pi.mode,pi.port)"></i></td>
                                <td><i class="icon" v-bind:class="{ 'text-success icon-check': pi.codeVersion, 'text-error icon-cross': !pi.codeVersion }"></i></td>
                                <td>{{pi.name}}</td>
                                <td>{{pi.url}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="panel-footer">
                <span class="text-secondary">Last update: {{ updateDate }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import Error from '@/components/Error.vue'

export default {
  name: 'LinkedPis',
  data () {
    return {
      pis: [],
      updateDate: '',
      modalData: {
        active: false,
        id: -1,
        title: 'New linked pi device',
        name: '',
        url: '',
        mode: 'UDP',
        port: 8888,
        password: '',
        errors: []
      }
    }
  },
  created () {
    this.getPis()
  },
  methods: {
    openModal (title, id, name, url, password, mode, port) {
      this.modalData.active = true
      this.modalData.title = title
      this.modalData.name = name
      this.modalData.url = url
      this.modalData.ip = url
      this.modalData.password = password
      this.modalData.mode = mode
      this.modalData.port = port
      this.modalData.id = id
      this.modalData.errors = []
    },
    modalAction (deleteO) {
      this.modalData.errors = []
      if (!deleteO) {
        if (!this.modalData.name) { this.modalData.errors.push('Name required !') }
        if (!this.modalData.url && this.modalData.mode == 'HTTP') { this.modalData.errors.push('Url required !') }
        if ((!this.modalData.ip || !this.modalData.port) && this.modalData.mode == 'UDP') { this.modalData.errors.push('IP and Port required !') }
      }
      if (!this.modalData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'DeleteLinkedPi;' + this.modalData.id } 
        else if (this.modalData.id === -1) { postData = 'AddLinkedPi;' + this.modalData.name + ';' + (this.modalData.mode=='HTTP'?this.modalData.url:this.modalData.ip) + ';' + this.modalData.password + ';' + this.modalData.mode + ';' + this.modalData.port+ ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') } 
        else { postData = 'UpdateLinkedPi;' + this.modalData.id + ';' + this.modalData.name + ';' + (this.modalData.mode=='HTTP'?this.modalData.url:this.modalData.ip) + ';' + this.modalData.password + ';' + this.modalData.mode + ';' + this.modalData.port+ ';' + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') }
        this.doPost(postData).then(() => {
          this.getPis()
          this.modalData.active = false
        }).catch(err => {
          this.modalData.errors.push(err.message)
        })
      }
    },
    getPis () {
      this.doPost('GetLinkedPis;1').then(datalist => {
        this.$route.meta.error = null
        this.pis = []
        for (var j = 2; j < (datalist.length - 1); j = j + 7) {
          this.pis.push({
            id: parseInt(datalist[j]),
            name: datalist[j + 1],
            url: datalist[j + 2],
            password: datalist[j + 3],
            mode: datalist[j + 4],
            port: parseInt(datalist[j + 5]),
            codeVersion: parseInt(datalist[j + 6])
          })
        }
        this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    }
  },
  components: {
    Error
  }
}
</script>

