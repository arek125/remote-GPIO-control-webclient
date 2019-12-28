<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>GPIO Inputs</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getInputs()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openModal('Add new input','','',false,'inloop',-1,1,0.05)"><i class="icon icon-plus centered"></i></button>
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
                                            <input class="form-input" type="number" id="gpio" placeholder="Single GPIO BCM number" v-model="modalData.gpio">
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
                                            <label class="form-label" for="type">Resistor</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="type" v-model="modalData.resistor">
                                                <option value="1">Pull up</option>
                                                <option value="2">Pull down</option>
                                                <option value="0">None</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Method</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="type" v-model="modalData.method">
                                                <option value="inloop">Loop monitoring</option>
                                                <option value="ined">Edge detection</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label v-if="modalData.method == 'inloop'" class="form-label" for="rr">CPU rest time (s)</label>
                                            <label v-else class="form-label" for="rr">Bounce time (s)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" step="0.01" id="rr" min="0.01" v-model="modalData.time">
                                            <p v-if="modalData.method == 'inloop'" class="text-gray text-italic">The smaller the value, the faster the response, but the greater the CPU demand.</p>
                                            <p v-else class="text-gray text-italic">Software debouncing for switch bounce.</p>
                                        </div>
                                    </div>
                                    <!-- <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Bind type</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" v-model="modalData.bindType">
                                                <option value="0">None (Read only)</option>
                                                <option value="1">Output on/off switch</option>
                                                <option value="2">Output pushbutton</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalData.outputs.length}" v-show="modalData.bindType > 0">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Output to bind</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalData.bindId">
                                                <option v-for="output in modalData.outputs" :key="output.id" :value="output.id">{{ output.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalData.outputs.length && !loading">Add outputs to make them visible here.</p>
                                        </div>
                                    </div> -->
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
                    <div v-if="!inputs.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no inputs configured</p>
                        <p class="empty-subtitle">Click the button to configure new</p>
                        <div class="empty-action">
                            <button class="btn btn-primary" v-on:click="openModal('Add new input','','',false,'inloop',-1,1,0.05)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <div v-else class="columns">
                        <div class="column" v-bind:class="[col]" v-for="input in inputs" :key="input.id" >
                            <div class="tile tile-centered">
                                <div class="tile-icon">
                                    <button class="btn btn-action btn-lg unclickable" v-bind:class="[stateButton(input.state,input.reverse)]">
                                        <i class="icon icon-flag centered"></i>
                                    </button>
                                </div>
                                <div class="tile-content">
                                    <div class="tile-title">{{ input.name }}</div>
                                    <div class="tile-subtitle text-gray">{{ inputDisc(input.gpio,input.reverse,input.method) }}</div>
                                </div>
                                <div class="tile-action">
                                    <button class="btn btn-link" v-on:click="openModal('Edit: '+input.name,input.name,input.gpio,!!input.reverse,input.method,input.id,input.resistor,input.time)">
                                        <i class="icon icon-edit"></i>
                                    </button>
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
  name: 'GPIO_Input',
  data () {
    return {
      inputs: [],
      refreshInterval: '',
      updateDate: '',
      autoRefreshTime: 5,
      modalData: {
        active: false,
        id: -1,
        title: 'New input',
        name: '',
        gpio: '',
        prevsGpios: '',
        reverse: false,
        resistor: "1",
        method: "inloop",
        time: 0.05,
        errors: [],
        allUsedPins: [],
        outputs: []
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
    this.getInputs()
    if (this.$cookies.isKey('in_arTime')) { this.autoRefreshTime = parseInt(this.$cookies.get('in_arTime')) }
    this.autoRefresh()
  },
  beforeDestroy () {
    clearTimeout(this.refreshInterval)
  },
  methods: {
    autoRefresh () {
      this.$cookies.set('in_arTime', this.autoRefreshTime, -1)
      clearTimeout(this.refreshInterval)
      if (this.autoRefreshTime > 0) {
        this.refreshInterval = setTimeout(() => {
          if (!this.modalData.active) { this.getInputs() }
          this.autoRefresh()
        }, (this.autoRefreshTime * 1000))
      }
    },
    openModal (title, name, gpio, reverse, method, id, resistor, time) {
      this.modalData.active = true
      this.modalData.title = title
      this.modalData.name = name
      this.modalData.gpio = gpio
      this.modalData.prevsGpios = gpio
      this.modalData.reverse = reverse
      this.modalData.method = method
      this.modalData.resistor = resistor
      this.modalData.time = time
      this.modalData.id = id
      this.modalData.allUsedPins = []
      this.modalData.errors = []
      this.modalData.outputs = []
      this.doPosts([
        this.doQPost('AllUsedPins_GPIO;in;' + id).then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j++) {
            this.modalData.allUsedPins.push(datalist[j])
          }
        })
        // this.doQPost('GPIO_Oname').then(datalist => {
        //   for (var j = 2; j < (datalist.length - 1); j += 4) {
        //     this.modalData.outputs.push({
        //       id: datalist[j],
        //       name: datalist[j + 1]
        //     })
        //   }
        // })
      ]).catch(err => {
        this.modalData.errors.push(err.message)
      })
    },
    modalAction (deleteO) {
      this.modalData.errors = []
      if (!deleteO) {
        if (!this.modalData.name) { this.modalData.errors.push('Name required !') }
        if (isNaN(this.modalData.gpio) || this.modalData.gpio == '' || this.modalData.gpio == null) { this.modalData.errors.push('GPIO must be a number !') } else {
          let splitedGpio = this.modalData.gpio.toString().split(',')
          var isGpio = this.isGPIOnumber(splitedGpio)
          if (isGpio != -1) { this.modalData.errors.push(isGpio + ' is not a GPIO BCM number !') } else {
            for (let i = 0; i < splitedGpio.length; i++) {
              if (this.modalData.allUsedPins.indexOf(splitedGpio[i]) > -1) { this.modalData.errors.push(splitedGpio[i] + ' allready in use !') }
            }
          }
        }
        // if (this.modalData.bindType > 0 && (isNaN(this.modalData.bindId) || this.modalData.bindId == '' || this.modalData.bindId == null || this.modalData.bindId == -1)) {
        //   this.modalData.errors.push('Binded output is required with this type !')
        // }
      }
      if (!this.modalData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'Delete_GPIO_out;' + this.modalData.id + ';' + this.modalData.gpio + ';' + this.modalData.name+  ';' + this.modalData.method } 
        else if (this.modalData.id === -1) { postData = 'Add_GPIO_in;' + this.modalData.gpio + ';' + this.modalData.name + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') + ';' + (+this.modalData.reverse) + ';' + this.modalData.time + ';' + this.modalData.resistor + ';' + this.modalData.method } 
        else { postData = 'Edit_GPIO_in;' + this.modalData.id + ';' + this.modalData.gpio + ';' + this.modalData.name + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') + ';' + (+this.modalData.reverse) + ';' + this.modalData.time + ';' + this.modalData.resistor + ';' + this.modalData.prevsGpios + ';' + this.modalData.method }
        this.doPost(postData).then(() => {
          this.getInputs()
          this.modalData.active = false
        }).catch(err => {
          this.modalData.errors.push(err.message)
        })
      }
    },
    inputDisc (gpio, reverse, method) {
      let disc = 'GPIO: ' + gpio
      if (method == 'inloop')disc += '(l)'
      else if (method == 'ined')disc += '(e)'
      if (reverse)disc += '(r)'
      return disc
    },
    getInputs () {
      this.doPost('GPIO_Ilist').then(datalist => {
        this.$route.meta.error = null
        this.inputs = []
        for (var j = 2; j < (datalist.length - 1); j = j + 8) {
          this.inputs.push({
            id: parseInt(datalist[j]),
            gpio: parseInt(datalist[j + 1]),
            state: parseInt(datalist[j + 2]),
            name: datalist[j + 3],
            reverse: parseInt(datalist[j + 4]),
            time: parseFloat(datalist[j + 5])/1000,
            resistor: parseInt(datalist[j + 6]),
            method: datalist[j + 7],
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

