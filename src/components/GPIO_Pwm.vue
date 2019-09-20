<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>GPIO Pwms</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getPwms()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openModal('Add new pwm','','',false,'','',-1)"><i class="icon icon-plus centered"></i></button>
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
                                            <label class="form-label" for="fr">Frequency(Hz)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="fr" v-model="modalData.fr">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="dc">Dutycycle(%)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="dc" min="0" max="100" v-model="modalData.dc">
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
                    <div v-if="!pwms.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no pwm's configured</p>
                        <p class="empty-subtitle">Click the button to configure new</p>
                        <div class="empty-action">
                            <button class="btn btn-primary" v-on:click="openModal('Add new pwm','','',false,'','',-1)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <div v-else class="columns">
                        <div class="column" v-bind:class="[col]" v-for="(pwm,index) in pwms" :key="pwm.id">
                            <div class="tile">
                                <div class="tile-icon d-grid">
                                    <button class="btn btn-action btn-lg" v-bind:class="[stateButton(pwm.s_s,0)]" v-on:click="setSS(index)">
                                        <i class="icon icon-shutdown centered"></i>
                                    </button>
                                    <button class="btn btn-link float-right" v-on:click="openModal('Edit '+pwm.name, pwm.name,pwm.gpio,!!pwm.reverse,pwm.fr,pwm.dc,pwm.id)">
                                        <i class="icon icon-edit"></i>
                                    </button>
                                </div>
                                <div class="tile-content">
                                    <div class="tile-title"><span>{{pwm.name}}</span>
                                        <div class="float-right tooltip tooltip-left low-width" data-tooltip="Frequency (Hz)">
                                            <input class="form-input input-sm" type="number" v-model="pwm.fr" v-on:change="setDCFR(index)" :disabled="!pwm.s_s">
                                        </div>
                                    </div>
                                    <div class="tile-subtitle text-gray"><span>GPIO:{{pwm.gpio}}</span>
                                        <div class="float-right tooltip tooltip-left low-width" data-tooltip="Dutycycle (%)">
                                            <input class="form-input input-sm" type="number" min="0" max="100" v-model="pwm.dc" v-on:change="setDCFR(index)" :disabled="!pwm.s_s">
                                        </div>
                                    </div>
                                    <div>
                                        <input class="slider" v-bind:class="{ reverse: !!pwm.reverse }" type="range" min="0" max="100" v-model="pwm.dc" v-on:change="setDCFR(index)" :disabled="!pwm.s_s">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="panel-footer">
                <span class="text-secondary">Last update: {{ updateDate }}</span>
                <div class="float-right tooltip tooltip-left" data-tooltip="Auto refresh time (s)">
                    <input class="form-input input-sm low-width" type="number" id="autorefresh" v-model="autoRefreshTime" v-on:change="autoRefresh()"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Error from '@/components/Error.vue'

export default {
  name: 'GPIO_Pwm',
  data () {
    return {
      pwms: [],
      refreshInterval: '',
      updateDate: '',
      changeDate: null,
      askedChangeDate: null,
      autoRefreshTime: 15,
      modalData: {
        active: false,
        id: -1,
        title: 'New pwm',
        name: '',
        gpio: '',
        prevsGpios: '',
        reverse: false,
        fr: '',
        dc: '',
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
    this.getPwms()
    if (this.$cookies.isKey('pwm_arTime')) { this.autoRefreshTime = parseInt(this.$cookies.get('pwm_arTime')) }
    this.autoRefresh()
  },
  beforeDestroy () {
    clearTimeout(this.refreshInterval)
  },
  methods: {
    autoRefresh () {
      this.$cookies.set('pwm_arTime', this.autoRefreshTime, -1)
      clearTimeout(this.refreshInterval)
      if (this.autoRefreshTime > 0) {
        this.refreshInterval = setTimeout(() => {
          if (!this.modalData.active) { this.checkForChanges() }
          this.autoRefresh()
        }, (this.autoRefreshTime * 1000))
      }
    },
    openModal (title, name, gpio, reverse, fr, dc, id) {
      this.modalData.active = true
      this.modalData.title = title
      this.modalData.name = name
      this.modalData.gpio = gpio
      this.modalData.prevsGpios = gpio
      this.modalData.reverse = reverse
      this.modalData.id = id
      this.modalData.fr = fr
      this.modalData.dc = dc
      this.modalData.allUsedPins = []
      this.modalData.errors = []
      this.doPost('AllUsedPins_GPIO;pwm;' + id).then(datalist => {
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
        if (!this.modalData.fr || !this.modalData.dc) { this.modalData.errors.push('Initial frequency and dutycycle are required !') }
      }
      if (!this.modalData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'Delete_GPIO_pwm;' + this.modalData.id + ';' + this.modalData.gpio + ';' + this.modalData.name } else if (this.modalData.id === -1) { postData = 'Add_GPIO_pwm;' + this.modalData.gpio + ';' + this.modalData.fr + ';' + this.modalData.dc + ';' + this.modalData.name + ';' + (+this.modalData.reverse) + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') } else { postData = 'Edit_GPIO_pwm;' + this.modalData.id + ';' + this.modalData.prevsGpios + ';' + this.modalData.gpio + ';' + this.modalData.fr + ';' + this.modalData.dc + ';' + this.modalData.name + ';' + (+this.modalData.reverse) + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') }
        this.doPost(postData).then(() => {
          this.getPwms()
          this.modalData.active = false
        }).catch(err => {
          this.modalData.errors.push(err.message)
        })
      }
    },
    getPwms () {
      this.doPost('GPIO_Plist').then(datalist => {
        this.$route.meta.error = null
        this.pwms = []
        for (var j = 2; j < (datalist.length - 1); j = j + 7) {
          this.pwms.push({
            id: parseInt(datalist[j]),
            gpio: datalist[j + 1],
            fr: parseInt(datalist[j + 2]),
            dc: parseInt(datalist[j + 3]),
            prevFr: parseInt(datalist[j + 2]),
            prevDc: parseInt(datalist[j + 3]),
            s_s: parseInt(datalist[j + 4]),
            name: datalist[j + 5],
            reverse: parseInt(datalist[j + 6])
          })
        }
        // this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
        this.changeDate = this.$moment.utc().toDate()
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    checkForChanges () {
      if (!this.loading) {
        this.doPost('GPIO_PEtime').then(datalist => {
          this.$route.meta.error = null
          if (datalist[2] !== 'None') {
            this.askedChangeDate = this.$moment.utc(datalist[2], 'YYYY-MM-DD HH:mm:ss.SSS').toDate()
            if (this.changeDate < this.askedChangeDate) {
              this.getPwms()
            }
          }
          this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
        }).catch(err => {
          this.$route.meta.error = err.message
          this.$forceUpdate()
        })
      }
    },
    setDCFR (index) {
      this.doPost('GPIO_PFRDC;' + this.pwms[index].id + ';' + this.pwms[index].gpio + ';' + this.pwms[index].fr + ';' + this.pwms[index].dc + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') + ';' + this.pwms[index].s_s +";1")
        .then(() => {
          this.$route.meta.error = null
          this.changeDate = this.$moment.utc().toDate()
          this.pwms[index].prevFr = this.pwms[index].fr
          this.pwms[index].prevDc = this.pwms[index].dc
        }).catch(err => {
          this.pwms[index].fr = this.pwms[index].prevFr
          this.pwms[index].dc = this.pwms[index].prevDc
          this.$route.meta.error = err.message
          this.$forceUpdate()
        })
    },
    setSS (index) {
      this.doPost('GPIO_PSS;' + this.pwms[index].id + ';' + this.pwms[index].gpio + ';' + this.pwms[index].dc + ';' + this.$moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS') + ';' + (+!this.pwms[index].s_s) + ';' + this.pwms[index].fr)
        .then(datalist => {
          this.$route.meta.error = null
          this.changeDate = this.$moment.utc().toDate()
          this.pwms[index].s_s = parseInt(datalist[4])
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
.low-width {
    width: 75px;
}
.reverse {
    direction: rtl;
}
.tile .tile-subtitle, .tile .tile-title {
    padding-bottom: 5px;
}
</style>
