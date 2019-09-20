<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Radio frequency Transmit/Recive Codes</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getRfCodes()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openModal(-1,'Add new RF code: ','',(rx)?'Recive':'Transmit','',350,1,(tx)?10:'',24)"><i class="icon icon-plus centered"></i></button>
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
                                            <label class="form-label" for="gpio">Type</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" v-model="modalData.type">
                                                <option value="Transmit" :disabled="!tx">Transmit</option>
                                                <option value="Recive" :disabled="!rx">Recive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="code">Code</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="code" placeholder="RF Code" v-model="modalData.code">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="Pulse">Pulse length</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" min="0" type="number" id="Pulse" placeholder="Pulse length" v-model="modalData.pulseLength">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="Protocol">Protocol</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" min="1" max="5" type="number" id="Protocol" placeholder="Protocol" v-model="modalData.protocol" v-on:change="changePulseforProtocol()">
                                        </div>
                                    </div>
                                    <div v-if="modalData.type == 'Transmit'" class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="repeatTransmit">Repeat transmit</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" min="0" type="number" id="repeatTransmit" placeholder="Repeat transmit" v-model="modalData.repeatTransmit">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="bitLength">Bit length</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" min="0" type="number" id="bitLength" placeholder="Bit length" v-model="modalData.bitLength">
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
                    <div v-if="!codes.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no rf codes configured</p>
                        <p class="empty-subtitle">Click the button to configure new</p>
                        <div class="empty-action">
                            <button class="btn btn-primary" v-on:click="openModal(-1,'Add new RF code: ','',(rx)?'Recive':'Transmit','',350,1,(tx)?10:'',24)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <div v-else class="columns">
                        <div class="column" v-bind:class="[col]" v-for="(code,index) in codes" :key="code.id" >
                            <div class="tile tile-centered">
                                <div class="tile-icon">
                                    <button v-if="code.type == 'Recive'" class="btn btn-action btn-lg unclickable">
                                        <i class="icon icon-download centered"></i>
                                    </button>
                                    <button v-else-if="code.type == 'Transmit'" class="btn btn-action btn-lg" v-on:click="sendRfCode(code.id,index)" v-bind:class="{ 'btn-success unclickable': code.transmiting }">
                                        <i class="icon icon-upload centered"></i>
                                    </button>
                                </div>
                                <div class="tile-content">
                                    <div class="tile-title">{{ code.name }}</div>
                                    <div class="tile-subtitle text-gray">{{ code.code }}</div>
                                </div>
                                <div class="tile-action">
                                    <button class="btn btn-link" v-on:click="openModal(code.id,'Edit: '+code.name,code.name,code.type,code.code,code.pulseLength,code.protocol,code.repeatTransmit,code.bitLength)">
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
  name: 'RfCodes',
  data () {
    return {
      codes: [],
      rx: 0,
      tx: 0,
      refreshInterval: '',
      updateDate: '',
      autoRefreshTime: 5,
      modalData: {
        active: false,
        id: -1,
        title: 'New RF code',
        name: '',
        type: 'Transmit',
        code: '',
        pulseLength: 350,
        protocol: 1,
        repeatTransmit: 10,
        bitLength: 24,
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
    this.doPost('GetRfPins').then(datalist => {
      this.$route.meta.error = null
      this.rx = parseInt(datalist[2])
      this.tx = parseInt(datalist[3])
      if (this.rx || this.tx) {
        this.getRfCodes()
        this.autoRefresh()
      } else {
        this.$route.meta.error = 'RF hardware not configured !'
        this.$forceUpdate()
      }
    }).catch(err => {
      this.$route.meta.error = err.message
      this.$forceUpdate()
    })
    if (this.$cookies.isKey('rf_arTime')) { this.autoRefreshTime = parseInt(this.$cookies.get('rf_arTime')) }
  },
  beforeDestroy () {
    clearTimeout(this.refreshInterval)
  },
  methods: {
    autoRefresh () {
      this.$cookies.set('rf_arTime', this.autoRefreshTime, -1)
      clearTimeout(this.refreshInterval)
      if (this.autoRefreshTime > 0) {
        this.refreshInterval = setTimeout(() => {
          if (!this.modalData.active) { this.getRfCodes() }
          this.autoRefresh()
        }, (this.autoRefreshTime * 1000))
      }
    },
    openModal (id, title, name, type, code, pulseLength, protocol, repeatTransmit, bitLength) {
      this.modalData.active = true
      this.modalData.id = id
      this.modalData.title = title
      this.modalData.name = name
      this.modalData.type = type
      this.modalData.code = code
      this.modalData.pulseLength = pulseLength
      this.modalData.protocol = protocol
      this.modalData.repeatTransmit = repeatTransmit
      this.modalData.bitLength = bitLength
      this.modalData.errors = []
    },
    modalAction (deleteO) {
      this.modalData.errors = []
      if (!deleteO) {
        if (!this.modalData.name || !this.modalData.code) { this.modalData.errors.push('Name and code are required !') }
      }
      if (!this.modalData.errors.length) {
        let postData = ''
        if (deleteO) postData = ['DeleteRfCode', this.modalData.id].join(';')
        else if (this.modalData.id === -1)postData = ['AddRfCode', this.modalData.name, this.modalData.type, this.modalData.code, this.modalData.pulseLength, this.modalData.protocol, this.modalData.repeatTransmit, this.modalData.bitLength].join(';')
        else postData = ['UpdateRfCode', this.modalData.id, this.modalData.name, this.modalData.type, this.modalData.code, this.modalData.pulseLength, this.modalData.protocol, this.modalData.repeatTransmit, this.modalData.bitLength].join(';')
        this.doPost(postData).then(() => {
          this.getRfCodes()
          this.modalData.active = false
        }).catch(err => {
          this.modalData.errors.push(err.message)
        })
      }
    },
    getRfCodes () {
      this.doPost('GetRfCodes').then(datalist => {
        this.$route.meta.error = null
        this.codes = []
        for (var j = 2; j < (datalist.length - 1); j = j + 8) {
          this.codes.push({
            id: parseInt(datalist[j]),
            name: datalist[j + 1],
            type: datalist[j + 2],
            code: datalist[j + 3],
            pulseLength: datalist[j + 4],
            protocol: datalist[j + 5],
            repeatTransmit: datalist[j + 6],
            bitLength: datalist[j + 7],
            transmiting: false
          })
        }
        this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    sendRfCode (id, index) {
      this.codes[index].transmiting = true
      this.doPost('SendRfCode;' + id).then(() => {
        this.$route.meta.error = null
        this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      }).finally(() => {
        this.codes[index].transmiting = false
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    changePulseforProtocol () {
      switch (this.modalData.protocol) {
        case '1': this.modalData.pulseLength = 350; break
        case '2': this.modalData.pulseLength = 650; break
        case '3': this.modalData.pulseLength = 100; break
        case '4': this.modalData.pulseLength = 380; break
        case '5': this.modalData.pulseLength = 500; break
      }
    }
  },
  components: {
    Error
  }
}
</script>
