<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Custom shell commands</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getCmds()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openModal('Add new cmd',-1,'','',false)"><i class="icon icon-plus centered"></i></button>
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
                                            <label class="form-label" for="name">Name</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="text" id="name" placeholder="Name" v-model="modalData.name">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="cmd">Command</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="text" id="cmd" placeholder="Shell command" v-model="modalData.cmd">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-switch">
                                            <input type="checkbox" v-model="modalData.wait">
                                            <i class="form-icon"></i>Wait for command output
                                        </label>
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
                    <div v-if="!cmds.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no cmds configured</p>
                        <p class="empty-subtitle">Click the button to configure new</p>
                        <div class="empty-action">
                            <button class="btn btn-primary" v-on:click="openModal('Add new cmd',-1,'','',false)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <div v-else class="columns">
                        <div class="column" v-bind:class="[col]" v-for="(cmd,index) in cmds" :key="cmd.id" >
                            <div class="tile tile-centered">
                                <div class="tile-icon">
                                    <button class="btn btn-action btn-lg" v-bind:class="{'btn-warning': cmd.running}" v-on:click="execCmd(index,cmd.id)">
                                        <i class="icon icon-forward centered"></i>
                                    </button>
                                </div>
                                <div class="tile-content">
                                    <div class="tile-title">{{ cmd.name }}</div>
                                    <div class="tile-subtitle text-gray">{{ cmd.cmd }}</div>
                                </div>
                                <div class="tile-action">
                                    <button class="btn btn-link" v-on:click="openModal('Edit: '+cmd.name,cmd.id,cmd.name,cmd.cmd,cmd.wait)">
                                        <i class="icon icon-edit"></i>
                                    </button>
                                </div>
                            </div>
                            <div v-show="cmd.lastOutput" class="toast toast-success">
                                <button class="btn btn-clear float-right" v-on:click="cmd.lastOutput = ''"></button>
                                {{ cmd.lastOutput }}
                            </div>
                        </div>
                    </div>
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
  name: 'CustomCmds',
  data () {
    return {
      cmds: [],
      updateDate: '',
      modalData: {
        active: false,
        id: -1,
        title: 'New cmd',
        name: '',
        cmd: '',
        wait: false,
        errors: []
      }
    }
  },
  props: {
    col: {
      type: String,
      default: 'col-4 col-lg-6 col-sm-12'
    }
  },
  created () {
    this.getCmds()
  },
  methods: {
    openModal (title, id, name, cmd, wait) {
      this.modalData.active = true
      this.modalData.title = title
      this.modalData.name = name
      this.modalData.cmd = cmd
      this.modalData.wait = wait
      this.modalData.id = id
      this.modalData.errors = []
    },
    modalAction (deleteO) {
      this.modalData.errors = []
      if (!deleteO) {
        if (!this.modalData.name) { this.modalData.errors.push('Name required !') }
        if (!this.modalData.cmd) { this.modalData.errors.push('Cmd required !') }
      }
      if (!this.modalData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'DeleteCustomCmd;' + this.modalData.id } else if (this.modalData.id === -1) { postData = 'AddCustomCmd;' + this.modalData.name + ';' + this.modalData.cmd + ';' + (+this.modalData.wait) + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') } else { postData = 'UpdateCustomCmd;' + this.modalData.id + ';' + this.modalData.name + ';' + this.modalData.cmd + ';' + (+this.modalData.wait) + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') }
        this.doPost(postData).then(() => {
          this.getCmds()
          this.modalData.active = false
        }).catch(err => {
          this.modalData.errors.push(err.message)
        })
      }
    },
    getCmds () {
      this.doPost('GetCustomCmds').then(datalist => {
        this.$route.meta.error = null
        this.cmds = []
        for (var j = 2; j < (datalist.length - 1); j = j + 4) {
          this.cmds.push({
            id: parseInt(datalist[j]),
            name: datalist[j + 1],
            cmd: datalist[j + 2],
            wait: Boolean(parseInt(datalist[j + 3])),
            running: false,
            lastOutput: ''
          })
        }
        this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    execCmd (index, id) {
      this.cmds[index].running = true
      this.doPost('ExecCustomCmd;' + id + ';' + (+this.cmds[index].wait)).then(datalist => {
        this.$route.meta.error = null
        this.cmds[index].running = false
        if (this.cmds[index].wait) this.cmds[index].lastOutput = datalist[2]
      }).catch(err => {
        this.cmds[index].running = false
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

