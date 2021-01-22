<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Global variables</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getVars()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openModal('Add new var',-1,'','',false)"><i class="icon icon-plus centered"></i></button>
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
                                            <label class="form-label" for="val">Value</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input v-if="modalData.type == 'String'" class="form-input" type="text" id="val" placeholder="Default value" v-model="modalData.val">
                                            <input v-else-if="modalData.type == 'Date'" class="form-input" type="datetime-local" id="val" v-model="modalData.val">
                                            <input v-else-if="modalData.type == 'Time'" class="form-input" type="time" id="val" v-model="modalData.val">
                                            <input v-else class="form-input" type="number" id="val" v-model="modalData.val">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="val">Type</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                        <select class="form-select" v-model="modalData.type">
                                            <option value="String">String</option>
                                            <option value="Date">Date</option>
                                            <option value="Time">Time</option>
                                            <option value="Number">Number</option>
                                        </select>
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
                    <div v-if="!vars.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no variables configured</p>
                        <p class="empty-subtitle">Click the button to configure new</p>
                        <div class="empty-action">
                            <button class="btn btn-primary" v-on:click="openModal('Add new global variable',-1,'','',false)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <table class="table table-striped" v-else>
                        <thead>
                            <tr>
                                <th>Edit</th>
                                <th>Name</th>
                                <th>Value</th>
                                <th>Type</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(_var) in vars" :key="_var.id">
                                <td><i class="icon icon-edit c-hand" v-on:click="openModal('Edit: '+_var.name,_var.id,_var.name,_var.val,_var.type)"></i></td>
                                <td>{{ _var.name }}</td>
                                <td>{{ _var.val }}</td>
                                <td>{{ _var.type }}</td>
                                <td>{{ _var.timestamp }}</td>
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
  name: 'GlobalVariables',
  data () {
    return {
      vars: [],
      updateDate: '',
      modalData: {
        active: false,
        id: -1,
        title: 'New global variable',
        name: '',
        val: '',
        type: '',
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
    this.getVars()
  },
  methods: {
    openModal (title, id, name, val, type) {
      this.modalData.active = true
      this.modalData.title = title
      this.modalData.name = name
      this.modalData.val = val
      this.modalData.type = type
      this.modalData.id = id
      this.modalData.errors = []
    },
    modalAction (deleteO) {
      this.modalData.errors = []
      if (!deleteO) {
        if (!this.modalData.name) { this.modalData.errors.push('Name required !') }
        if (!this.modalData.type) { this.modalData.errors.push('Type required !') }
      }
      if (!this.modalData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'DeleteGlobalVar;' + this.modalData.id } else if (this.modalData.id === -1) { postData = 'AddGlobalVar;' + this.modalData.name + ';' + this.modalData.val + ';' + this.modalData.type + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') } 
        else { postData = 'UpdateGlobalVar;' + this.modalData.id + ';' + this.modalData.name + ';' + this.modalData.val + ';' + this.modalData.type + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') }
        this.doPost(postData).then(() => {
          this.getVars()
          this.modalData.active = false
        }).catch(err => {
          this.modalData.errors.push(err.message)
        })
      }
    },
    getVars () {
      this.doPost('GetGlobalVars').then(datalist => {
        this.$route.meta.error = null
        this.vars = []
        for (var j = 2; j < (datalist.length - 1); j = j + 5) {
          this.vars.push({
            id: parseInt(datalist[j]),
            name: datalist[j + 1],
            val: datalist[j + 2],
            type: datalist[j + 3],
            timestamp: this.$moment.utc(datalist[j + 4], 'YYYY-MM-DD HH:mm:ss').local().format('YYYY-MM-DD HH:mm:ss')
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

