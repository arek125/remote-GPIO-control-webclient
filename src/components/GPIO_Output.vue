<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>GPIO Outputs</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getOutputs()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openModal('Add new output','','',false,0,-1)"><i class="icon icon-plus centered"></i></button>
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
                                            <label class="form-label" for="gpio">GPIO(BCM)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="text" id="gpio" placeholder="Comma separated GPIO BCM numbers" v-model="modalData.gpio">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-switch">
                                            <input type="checkbox" v-model="modalData.reverse">
                                            <i class="form-icon"></i>Reverse
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Act like</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" v-model="modalData.type">
                                                <option value="0">On/Off switch</option>
                                                <option value="1">Pushbutton</option>
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
                    <div v-if="!outputs.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no outputs configured</p>
                        <p class="empty-subtitle">Click the button to configure new</p>
                        <div class="empty-action">
                            <button class="btn btn-primary" v-on:click="openModal('Add new output','','',false,0,-1)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <div v-else class="columns">
                        <div class="tile tile-centered column" v-bind:class="[col]" v-for="(output,index) in outputs" :key="output.id" >
                            <div class="tile-icon">
                                <button v-if="output.type===0" class="btn btn-action btn-lg" v-bind:class="[stateButton(output.state,output.reverse)]" v-on:click="setState(index,output.id,output.gpio,+!output.state,output.reverse)">
                                    <i class="icon icon-shutdown centered"></i>
                                </button>
                                <button v-else-if="output.type===1" class="btn btn-action btn-lg" v-bind:class="[stateButton(output.state,output.reverse)]" v-on:mousedown="output.prevstate = output.state; setState(index,output.id,output.gpio,+!output.state,output.reverse)" v-on:mouseup="setState(index,output.id,output.gpio,output.prevstate,output.reverse)">
                                    <i class="icon icon-shutdown centered"></i>
                                </button>
                            </div>
                            <div class="tile-content">
                                <div class="tile-title">{{ output.name }}</div>
                                <div class="tile-subtitle text-gray">{{ outputDisc(output.gpio,output.reverse,output.type) }}</div>
                            </div>
                            <div class="tile-action">
                                <div class="dropdown dropdown-right">
                                    <a class="btn btn-link dropdown-toggle" tabindex="0">
                                        <i class="icon icon-more-vert"></i>
                                    </a>
                                    <ul class="menu">
                                        <li class="menu-item" v-on:click="setState(index,output.id,output.gpio,+!output.reverse,output.reverse)"><a><i class="icon icon-shutdown"></i> On</a></li>
                                        <li class="menu-item" v-on:click="setState(index,output.id,output.gpio,output.reverse,output.reverse)"><a><i class="icon icon-shutdown"></i> Off</a></li>
                                        <li class="menu-item" v-on:click="openModal('Edit: '+output.name,output.name,output.gpio,!!output.reverse,output.type,output.id)"><a><i class="icon icon-edit"></i> Edit</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="panel-footer">
                <span class="text-secondary">Last update: {{ updateDate }}</span>
                <div class="float-right tooltip tooltip-left" data-tooltip="Auto refresh time (s)">
                    <input class="form-input input-sm" type="number" id="autorefresh" v-model="autoRefreshTime" v-on:change="autoRefresh()">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Error from '@/components/Error.vue'

export default {
  name: 'GPIO_Output',
  data () {
    return {
      outputs: [],
      refreshInterval: '',
      updateDate: '',
      autoRefreshTime: 5,
      modalData: {
        active: false,
        id: -1,
        title: 'New output',
        name: '',
        gpio: '',
        prevsGpios: '',
        reverse: false,
        type: 0,
        errors: [],
        allUsedPins: []
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
    this.getOutputs()
    if (this.$cookies.isKey('out_arTime')) { this.autoRefreshTime = parseInt(this.$cookies.get('out_arTime')) }
    this.autoRefresh()
  },
  beforeDestroy () {
    clearTimeout(this.refreshInterval)
  },
  methods: {
    autoRefresh () {
      this.$cookies.set('out_arTime', this.autoRefreshTime, -1)
      clearTimeout(this.refreshInterval)
      if (this.autoRefreshTime > 0) {
        this.refreshInterval = setTimeout(() => {
          if (!this.modalData.active) { this.getOutputs() }
          this.autoRefresh()
        }, (this.autoRefreshTime * 1000))
      }
    },
    openModal (title, name, gpio, reverse, type, id) {
      this.modalData.active = true
      this.modalData.title = title
      this.modalData.name = name
      this.modalData.gpio = gpio
      this.modalData.prevsGpios = gpio
      this.modalData.reverse = reverse
      this.modalData.type = type
      this.modalData.id = id
      this.modalData.allUsedPins = []
      this.modalData.errors = []
      this.doPost('AllUsedPins_GPIO;out;' + id).then(datalist => {
        // let datalist = this.parseRes(r.data)
        for (var j = 2; j < (datalist.length - 1); j++) {
          this.modalData.allUsedPins.push(datalist[j])
        }
      }).catch(err => {
        this.modalData.errors.push(err.message)
      })
    },
    modalAction (deleteO) {
      this.modalData.errors = []
      if (!deleteO) {
        if (!this.modalData.name) { this.modalData.errors.push('Name required !') }
        if (!/^[0-9]+(,[0-9]+)*$/g.test(this.modalData.gpio)) { this.modalData.errors.push('GPIO must be a number or comma separated numbers !') } else {
          let splitedGpio = this.modalData.gpio.split(',')
          var isGpio = this.isGPIOnumber(splitedGpio)
          if (isGpio != -1) { this.modalData.errors.push(isGpio + ' is not a GPIO BCM number !') } else {
            for (let i = 0; i < splitedGpio.length; i++) {
              if (this.modalData.allUsedPins.indexOf(splitedGpio[i]) > -1) { this.modalData.errors.push(splitedGpio[i] + ' allready in use !') }
            }
          }
        }
      }
      if (!this.modalData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'Delete_GPIO_out;' + this.modalData.id + ';' + this.modalData.gpio + ';' + this.modalData.name } else if (this.modalData.id === -1) { postData = 'Add_GPIO_out;' + this.modalData.gpio + ';' + this.modalData.name + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') + ';' + (+this.modalData.reverse) + ';' + this.modalData.type } else { postData = 'Edit_GPIO_out;' + this.modalData.id + ';' + this.modalData.gpio + ';' + this.modalData.name + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') + ';' + (+this.modalData.reverse) + ';' + this.modalData.prevsGpios + ';' + this.modalData.type }
        this.doPost(postData).then(datalist => {
          // let datalist = this.parseRes(r.data)
          this.getOutputs()
          this.modalData.active = false
        }).catch(err => {
          this.modalData.errors.push(err.message)
        })
      }
    },
    outputDisc (gpio, reverse, type) {
      let disc = 'GPIO: ' + gpio
      if (type == 0)disc += '(o)'
      else if (type == 1)disc += '(p)'
      if (reverse)disc += '(r)'
      return disc
    },
    getOutputs () {
      this.doPost('GPIO_Olist').then(datalist => {
        this.$route.meta.error = null
        // let datalist = this.parseRes(r.data)
        this.outputs = []
        for (var j = 2; j < (datalist.length - 1); j = j + 6) {
          this.outputs.push({
            id: parseInt(datalist[j]),
            gpio: datalist[j + 1],
            state: parseInt(datalist[j + 2]),
            name: datalist[j + 3],
            reverse: parseInt(datalist[j + 4]),
            type: parseInt(datalist[j + 5])
          })
        }
        this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    setState (index, id, gpio, stateSet, reverse) {
      this.doPost('GPIO_set;' + id + ';' + gpio + ';' + stateSet + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') + ';' + reverse).then(datalist => {
        this.$route.meta.error = null
        this.outputs[index].state = parseInt(datalist[2])
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

<style>
.columns {
    padding-bottom: 120px;
}
#autorefresh {
    width: 75px;
}
</style>
