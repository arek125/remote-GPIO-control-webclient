<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Execution chains</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getChains()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openChainModal('Add new execution chain','',-1,1,true)"><i class="icon icon-plus centered"></i></button>
                </div>
            </div>
            <div class="panel-body">
                <div class="modal" v-bind:class="{ active: modalChainData.active }">
                    <a class="modal-overlay" aria-label="Close" v-on:click="modalChainData.active = false"></a>
                    <div class="modal-container">
                        <div class="modal-header">
                            <a class="btn btn-clear float-right" aria-label="Close" v-on:click="modalChainData.active = false"></a>
                            <div class="modal-title h5">{{ modalChainData.title }}</div>
                            <Error v-if="modalChainData.errors.length" v-on:close-err="modalChainData.errors = []" v-bind:error-array="modalChainData.errors"/>
                        </div>
                        <div class="modal-body">
                            <div class="content">
                                <form class="form-horizontal">
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="name">Name</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="text" id="name" placeholder="Name" v-model="modalChainData.name">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="countdown">Loop countdown</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="countdown"  v-model="modalChainData.countdown">
                                            <p class="text-gray text-italic">-1 infinite, 0 disabled or any number for loop countdown</p>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-switch">
                                            <input type="checkbox" v-model="modalChainData.keepLogs">
                                            <i class="form-icon"></i>Keep logs
                                        </label>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-code float-left" v-show="modalChainData.id !== -1" v-on:click="modalChainAction(true)" :disabled="this.loading"><i class="icon icon-delete"></i> Delete</button>
                            <button class="btn btn-primary" v-on:click="modalChainAction(false)" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
                        </div>
                    </div>
                </div>
                <div class="modal" v-bind:class="{ active: modalBondData.active }">
                    <a class="modal-overlay" aria-label="Close" v-on:click="modalBondData.active = false"></a>
                    <div class="modal-container">
                        <div class="modal-header">
                            <a class="btn btn-clear float-right" aria-label="Close" v-on:click="modalBondData.active = false"></a>
                            <div class="modal-title h5">{{ modalBondData.title }}</div>
                            <Error v-if="modalBondData.errors.length" v-on:close-err="modalBondData.errors = []" v-bind:error-array="modalBondData.errors"/>
                        </div>
                        <div class="modal-body">
                            <div class="content">
                                <form class="form-horizontal">
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Type</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="type" v-model="modalBondData.type">
                                                <option value="output">Output</option>
                                                <option value="pwm">PWM</option>
                                                <option value="action">Check and run automated action</option>
                                                <option value="rfsend">Transmit RF Code</option>
                                                <option value="cmd">Execute custom command</option>
                                                <option value="chain">Execute or cancel other chain</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="deley">Delay(s)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" min="0" type="number" id="deley" placeholder="Single GPIO BCM number" v-model="modalBondData.deley">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-switch">
                                            <input type="checkbox" v-model="modalBondData.bondLinked" v-on:change="modalBondData.linkId=0;reFetchTargetsData()">
                                            <i class="form-icon"></i>Linked pi execute?
                                        </label>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalBondData.linkedPis.length}" v-if="modalBondData.bondLinked">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">Linked pi device</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalBondData.linkId" v-on:change="reFetchTargetsData()">
                                                <option v-for="link in modalBondData.linkedPis" :key="link.id" :value="link.id">{{ link.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalBondData.linkedPis.length && !loading">Add linked pis devices to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalBondData.outputs.length}" v-if="modalBondData.type == 'output'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Output target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalBondData.outputId">
                                                <option v-for="output in modalBondData.outputs" :key="output.id" :value="output.id">{{ output.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalBondData.outputs.length && !loading">Add outputs to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalBondData.pwms.length}" v-else-if="modalBondData.type == 'pwm'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">PWM target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalBondData.pwmId">
                                                <option v-for="pwm in modalBondData.pwms" :key="pwm.id" :value="pwm.id">{{ pwm.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalBondData.pwms.length && !loading">Add PWM's to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalBondData.actions.length}" v-else-if="modalBondData.type == 'action'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Action target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalBondData.actionId">
                                                <option v-for="action in modalBondData.actions" :key="action.id" :value="action.id">{{ action.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalBondData.actions.length && !loading">Add actions to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalBondData.rfCodes.length}" v-else-if="modalBondData.type == 'rfsend'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">RF transmit target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalBondData.rfId">
                                                <option v-for="rf in modalBondData.rfCodes" :key="rf.id" :value="rf.id">{{ rf.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalBondData.rfCodes.length && !loading">Add RF codes to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalBondData.cmds.length}" v-else-if="modalBondData.type == 'cmd'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Custom command target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalBondData.cmdId">
                                                <option v-for="cmd in modalBondData.cmds" :key="cmd.id" :value="cmd.id">{{ cmd.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalBondData.cmds.length && !loading">Add cmd commands to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalBondData.chains.length}" v-else-if="modalBondData.type == 'chain'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Chain target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalBondData.exeChainId">
                                                <option v-for="chain in modalBondData.chains" :key="chain.id" :value="chain.id">{{ chain.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalBondData.chains.length && !loading">Add chains to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" v-show="modalBondData.type != 'action' && modalBondData.type != 'rfsend' && modalBondData.type != 'cmd'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="state">Set state</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="state" v-model="modalBondData.state">
                                                <option value="0">OFF</option>
                                                <option value="1">ON</option>
                                                <option value="2" v-show="modalBondData.type != 'chain'">OPPOSITE</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group" v-show="modalBondData.type == 'pwm'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="fr">Set frequency(Hz)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="fr" v-model="modalBondData.pwmFr">
                                        </div>
                                    </div>
                                    <div class="form-group" v-show="modalBondData.type == 'pwm'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="dc">Set dutycycle(%)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="dc" min="0" max="100" v-model="modalBondData.pwmDc">
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-code float-left" v-show="modalBondData.id !== -1" v-on:click="modalBondAction(true)" :disabled="this.loading"><i class="icon icon-delete"></i> Delete</button>
                            <button class="btn btn-primary" v-on:click="modalBondAction(false)" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
                        </div>
                    </div>
                </div>
                <div class="modal" v-bind:class="{ active: modalReorderData.active }">
                    <a class="modal-overlay" aria-label="Close" v-on:click="modalReorderData.active = false"></a>
                    <div class="modal-container">
                        <div class="modal-header">
                            <a class="btn btn-clear float-right" aria-label="Close" v-on:click="modalReorderData.active = false"></a>
                            <div class="modal-title h5">Reorder bonds</div>
                            <Error v-if="modalReorderData.errors.length" v-on:close-err="modalReorderData.errors = []" v-bind:error-array="modalReorderData.errors"/>
                        </div>
                        <div class="modal-body">
                            <div class="content">
                                <dl class="list" v-if="modalReorderData.bonds.length">
                                    <dt v-for="(bond,index) in modalReorderData.bonds" :key="bond.id">
                                        <button class="btn btn-link" :disabled="index==0" v-on:click="reorder(true,index)"><i class="icon icon-upward"></i></button>
                                        <button class="btn btn-link" :disabled="index==(modalReorderData.bonds.length-1)" v-on:click="reorder(false,index)"><i class="icon icon-downward"></i></button>
                                        <span v-if="bond.type == 'action'" >{{ bond.lp+'. '+bond.actionName + ' Execute '+ bond.deley+'s'}}</span>
                                        <span v-else-if="bond.type == 'rfsend'" >{{ bond.lp+'. '+bond.rfName + ' Transmit '+ bond.deley+'s'}}</span>
                                        <span v-else-if="bond.type == 'output'" >{{bond.lp+'. '+bond.outputName+" "+outState(bond.outputState)+' '+ bond.deley+'s'}}</span>
                                        <span v-else-if="bond.type == 'pwm'" >{{bond.lp+'. '+bond.pwmName+" "+pwmState(bond.pwmSs,bond.pwmDc,bond.pwmFr)+' '+ bond.deley+'s'}}</span>
                                        <span v-else-if="bond.type == 'cmd'" >{{ bond.lp+'. '+bond.cmdName + ' Execute '+ bond.deley+'s'}}</span>
                                        <span v-else-if="bond.type == 'chain'" >{{(bond.linkId?bond.execChainName:findChain(bond.execChainId).name)+(bond.outputState?' Execute ':' Cancel ')+ bond.deley+'s'}}</span>
                                    </dt>
                                </dl>
                                <div v-else>No bonds added.</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" v-on:click="modalReorderAction()" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div v-if="!chains.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no chains configured</p>
                        <p class="empty-subtitle">Click the button to configure new</p>
                        <div class="empty-action">
                            <button class="btn btn-primary" v-on:click="openChainModal('Add new execution chain','',-1,1, true)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <div v-else class="columns">
                        <div class="column" v-bind:class="[col]" v-for="(chain,index) in chains" :key="chain.id">
                            <div class="tile">
                                <div class="tile-icon d-grid">
                                    <button class="btn btn-action btn-lg" v-on:click="execudeOrCancel(index)" v-bind:class="{'btn-success': !chain.status && chain.bonds.length, 'btn-warning': chain.status, 'btn-code': !chain.status && !chain.bonds.length}" :disabled="!chain.bonds.length">
                                        <i class="icon icon-forward centered" v-bind:class="{'icon-forward': !chain.status, 'icon-stop': chain.status}"></i>
                                    </button>
                                    <button class="btn btn-link" v-on:click="openChainModal('Edit: '+chain.name,chain.name,chain.id,chain.countdown,chain.keepLogs)">
                                        <i class="icon icon-edit"></i>
                                    </button>
                                    <button class="btn btn-link" v-on:click="openBondModal('Add new chain bond',-1,chain.id,'output',1,-1,-1,600,0,0,-1,-1,-1,0,-1)">
                                        <i class="icon icon-plus"></i>
                                    </button>
                                    <button class="btn btn-link" :disabled="chain.bonds.length < 2 || chain.status > 0" v-on:click="openReorderModal(chain.id,index,chain.bonds)">
                                        <i class="icon icon-resize-vert"></i>
                                    </button>
                                </div>
                                <div class="tile-content">
                                    <div class="tile-title">
                                        <span>{{chain.name}}</span>
                                    </div>
                                    <div class="tile-subtitle">
                                        <ol class="list" v-if="chain.bonds.length">
                                            <li v-for="(bond) in chain.bonds" :key="bond.id" v-bind:class="{'text-warning': bond.lp == chain.status}" v-on:click="openBondModal('Edit bond lp. '+bond.lp,bond.id,bond.chainId,bond.type,bond.deley,bond.outputId,bond.pwmId,bond.pwmFr,bond.pwmDc,bond.type=='pwm'?bond.pwmSs:bond.outputState,bond.actionId,bond.rfId,bond.cmdId,bond.linkId,bond.execChainId)">
                                                <button class="btn btn-link" v-if="bond.type == 'action'" >{{ bond.actionName + ' Execute '+ bond.deley+'s'}}</button>
                                                <button class="btn btn-link" v-else-if="bond.type == 'output'" >{{bond.outputName+' '+outState(bond.outputState)+' '+ bond.deley+'s'}}</button>
                                                <button class="btn btn-link" v-else-if="bond.type == 'pwm'" >{{bond.pwmName+' '+pwmState(bond.pwmSs,bond.pwmDc,bond.pwmFr)+' '+ bond.deley+'s'}}</button>
                                                <button class="btn btn-link" v-else-if="bond.type == 'rfsend'" >{{ bond.rfName + ' Transmit '+ bond.deley+'s'}}</button>
                                                <button class="btn btn-link" v-else-if="bond.type == 'cmd'" >{{ bond.cmdName + ' Execute '+ bond.deley+'s'}}</button>
                                                <button class="btn btn-link" v-else-if="bond.type == 'chain'" >{{(bond.linkId?bond.execChainName:findChain(bond.execChainId).name)+(bond.outputState?' Execute ':' Cancel ')+ bond.deley+'s'}}</button>
                                            </li>
                                        </ol>
                                        <div v-else>No bonds added.</div>
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
                    <input class="form-input input-sm" type="number" id="autorefresh" v-model="autoRefreshTime" v-on:change="autoRefresh()">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Error from '@/components/Error.vue'

export default {
  name: 'Chains',
  data () {
    return {
      chains: [],
      refreshInterval: '',
      updateDate: '',
      autoRefreshTime: 5,
      modalChainData: {
        active: false,
        id: -1,
        title: 'New execution chain',
        name: '',
        countdown: 1,
        keepLogs: true,
        errors: []
      },
      modalBondData: {
        active: false,
        id: -1,
        chainId: -1,
        title: 'New chain bond',
        type: '',
        deley: 1,
        bondLinked: false,
        outputs: [],
        outputId: -1,
        pwms: [],
        pwmId: -1,
        pwmFr: 600,
        pwmDc: 0,
        state: 0,
        actions: [],
        actionId: -1,
        rfId: -1,
        rfCodes: [],
        cmdId: -1,
        cmds: [],
        linkId: 0,
        linkedPis: [],
        exeChainId: -1,
        chains: [],
        errors: []
      },
      modalReorderData: {
        active: false,
        chainId: -1,
        chainIndex: -1,
        bonds: [],
        errors: []
      }
    }
  },
  props: {
    col: {
      type: String,
      default: 'col-4 col-xl-6 col-sm-12'
    }
  },
  created () {
    this.getChains()
    if (this.$cookies.isKey('chain_arTime')) { this.autoRefreshTime = parseInt(this.$cookies.get('chain_arTime')) }
    this.autoRefresh()
  },
  beforeDestroy () {
    clearTimeout(this.refreshInterval)
  },
  methods: {
    autoRefresh () {
      this.$cookies.set('chain_arTime', this.autoRefreshTime, -1)
      clearTimeout(this.refreshInterval)
      if (this.autoRefreshTime > 0) {
        this.refreshInterval = setTimeout(() => {
          if (!this.modalChainData.active && !this.modalBondData.active && !this.modalReorderData.active) { this.getChains() }
          this.autoRefresh()
        }, (this.autoRefreshTime * 1000))
      }
    },
    compare (a, b) {
      let comparison = 0
      if (a.lp > b.lp) {
        comparison = 1
      } else if (a.lp < b.lp) {
        comparison = -1
      }
      return comparison
    },
    openChainModal (title, name, id, countdown, keepLogs) {
      this.modalChainData.active = true
      this.modalChainData.title = title
      this.modalChainData.name = name
      this.modalChainData.countdown = countdown
      this.modalChainData.keepLogs = keepLogs
      this.modalChainData.id = id
      this.modalChainData.errors = []
    },
    modalChainAction (deleteO) {
      this.modalChainData.errors = []
      if (!deleteO) {
        if (!this.modalChainData.name) { this.modalChainData.errors.push('Name required !') }
      }
      if (!this.modalChainData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'GPIO_ChainDelete;' + this.modalChainData.id } 
        else if (this.modalChainData.id === -1) { postData = 'GPIO_ChainAdd;' + this.modalChainData.name+";"+this.modalChainData.countdown+";"+(+this.modalChainData.keepLogs) } 
        else { postData = 'GPIO_ChainUpdate;' + this.modalChainData.id + ';' + this.modalChainData.name+";"+this.modalChainData.countdown+";"+(+this.modalChainData.keepLogs) }
        this.doPost(postData).then(() => {
          this.getChains()
          this.modalChainData.active = false
        }).catch(err => {
          this.modalChainData.errors.push(err.message)
        })
      }
    },
    openBondModal (title, id, chainId, type, deley, outputId, pwmId, pwmFr, pwmDc, state, actionId, rfId, cmdId, linkId, exeChainId) {
      this.modalBondData.active = true
      this.modalBondData.title = title
      this.modalBondData.id = id
      this.modalBondData.chainId = chainId
      this.modalBondData.type = type
      this.modalBondData.deley = deley
      this.modalBondData.outputId = outputId
      this.modalBondData.pwmId = pwmId
      this.modalBondData.pwmFr = pwmFr
      this.modalBondData.pwmDc = pwmDc
      this.modalBondData.state = state
      this.modalBondData.actionId = actionId
      this.modalBondData.rfId = rfId
      this.modalBondData.cmdId = cmdId
      this.modalBondData.linkId = linkId
      this.modalBondData.exeChainId = exeChainId
      this.modalBondData.linkedPis = []
      this.modalBondData.errors = []
      if(linkId) this.modalBondData.bondLinked = true
      else this.modalBondData.bondLinked = false
      this.reFetchTargetsData(chainId)
      this.doPost('GetLinkedPis;0').then(datalist => {
        for (var j = 2; j < (datalist.length - 1); j += 6) {
          this.modalBondData.linkedPis.push({
            id: datalist[j],
            name: datalist[j + 1]
          })
        }
      }).catch(err => {
          this.modalBondData.errors.push(err.message)
      })
    },
    modalBondAction (deleteO) {
      this.modalBondData.errors = []
      if (!deleteO) {
        if (!this.modalBondData.deley) { this.modalBondData.errors.push('Deley is required !') }
        if (this.modalBondData.type == 'output' && !this.modalBondData.outputId) { this.modalBondData.errors.push('Output id is required !') } else if (this.modalBondData.type == 'pwm' && !this.modalBondData.pwmId) { this.modalBondData.errors.push('Pwm id is required !') } else if (this.modalBondData.type == 'action' && !this.modalBondData.actionId) { this.modalBondData.errors.push('Action id is required !') } else if (this.modalBondData.type == 'rfsend' && !this.modalBondData.rfId) { this.modalBondData.errors.push('Rf transmit target id is required !') } else if (this.modalBondData.type == 'cmd' && !this.modalBondData.cmdId) { this.modalBondData.errors.push('Custom command target id is required !') }
      }
      if (!this.modalBondData.errors.length) {
        let postData = ''
        let target = null
        let linkName = ''
        if (this.modalBondData.type == 'output') { target = this.modalBondData.outputId; linkName = this.modalBondData.outputs.find(x => x.id == target).name } 
        else if (this.modalBondData.type == 'pwm') { target = this.modalBondData.pwmId; linkName = this.modalBondData.pwms.find(x => x.id == target).name } 
        else if (this.modalBondData.type == 'action') { target = this.modalBondData.actionId; linkName = this.modalBondData.actions.find(x => x.id == target).name } 
        else if (this.modalBondData.type == 'rfsend') { target = this.modalBondData.rfId; linkName = this.modalBondData.rfCodes.find(x => x.id == target).name } 
        else if (this.modalBondData.type == 'cmd') { target = this.modalBondData.cmdId; linkName = this.modalBondData.cmds.find(x => x.id == target).name }
        else if (this.modalBondData.type == 'chain') { target = this.modalBondData.exeChainId; linkName = this.modalBondData.chains.find(x => x.id == target).name }
        if (deleteO) { postData = 'GPIO_ChainBondDelete;' + this.modalBondData.id + ';' + this.modalBondData.chainId } 
        else if (this.modalBondData.id === -1) { postData = 'GPIO_ChainBondAdd;' + this.modalBondData.chainId + ';' + this.modalBondData.type + ';' + this.modalBondData.deley + ';' + target + ';' + this.modalBondData.state + ';' + this.modalBondData.pwmFr + ';' + this.modalBondData.pwmDc + ';' + this.modalBondData.linkId + ';' + linkName } 
        else { postData = 'GPIO_ChainBondUpdate;' + this.modalBondData.chainId + ';' + this.modalBondData.type + ';' + this.modalBondData.deley + ';' + target + ';' + this.modalBondData.state + ';' + this.modalBondData.pwmFr + ';' + this.modalBondData.pwmDc + ';' + this.modalBondData.id + ';' + this.modalBondData.linkId + ';' + linkName }
        this.doPost(postData).then(() => {
          this.getChains()
          this.modalBondData.active = false
        }).catch(err => {
          this.modalBondData.errors.push(err.message)
        })
      }
    },
    openReorderModal (chainId, chainIndex, bonds) {
      this.modalReorderData.active = true
      this.modalReorderData.chainId = chainId
      this.modalReorderData.chainIndex = chainIndex
      this.modalReorderData.bonds = bonds
    },
    reorder (up, index) {
      let temp = this.modalReorderData.bonds[index]
      if (up) {
        this.modalReorderData.bonds[index] = this.modalReorderData.bonds[index - 1]
        this.modalReorderData.bonds[index].lp++
        temp.lp--
        this.modalReorderData.bonds[index - 1] = temp
      } else {
        this.modalReorderData.bonds[index] = this.modalReorderData.bonds[index + 1]
        this.modalReorderData.bonds[index].lp--
        temp.lp++
        this.modalReorderData.bonds[index + 1] = temp
      }
    },
    findChain (id){
      return this.chains.find(chain => {
        return chain.id == id
      })
    },
    modalReorderAction () {
      let lpPlusId = ''
      for (let i = 0; i < this.modalReorderData.bonds.length; i++) {
        lpPlusId += this.modalReorderData.bonds[i].lp + '$' + this.modalReorderData.bonds[i].id
        if (i < (this.modalReorderData.bonds.length - 1))lpPlusId += '$'
      }
      this.doPost('GPIO_ChainBondsOrder;' + this.modalReorderData.chainId + ';' + lpPlusId).then(() => {
        this.chains[this.modalReorderData.chainIndex].bonds = this.modalReorderData.bonds
        this.modalReorderData.active = false
      }).catch(err => {
        this.modalReorderData.errors.push(err.message)
      })
    },
    getChains () {
      this.doPost('GPIO_ChainList').then(datalist => {
        this.$route.meta.error = null
        this.chains = []
        for (var j = 2; j < (datalist.length - 1); j += 7) {
          let bondList = datalist[j + 6].split('$')
          let bonds = []
          for (var i = 0; i < (bondList.length - 1); i += 23) {
            let linked = Boolean(parseInt(bondList[i + 19]))
            let joinedLinkedName = bondList[i + 21] + ':' + bondList[i + 20]
            bonds.push({
              id: parseInt(bondList[i]),
              chainId: parseInt(bondList[i + 1]),
              lp: parseInt(bondList[i + 2]),
              deley: parseFloat(bondList[i + 3]),
              type: bondList[i + 4],
              actionId: parseInt(bondList[i + 5]),
              outputId: parseInt(bondList[i + 6]),
              outputState: parseInt(bondList[i + 7]),
              pwmId: parseInt(bondList[i + 8]),
              pwmFr: parseInt(bondList[i + 9]),
              pwmDc: parseInt(bondList[i + 10]),
              pwmSs: parseInt(bondList[i + 11]),
              outputName: linked?joinedLinkedName:bondList[i + 12],
              pwmName: linked?joinedLinkedName:bondList[i + 13],
              actionName: linked?joinedLinkedName:bondList[i + 14],
              rfId: parseInt(bondList[i + 15]),
              rfName: linked?joinedLinkedName:bondList[i + 16],
              cmdId: parseInt(bondList[i + 17]),
              cmdName: linked?joinedLinkedName:bondList[i + 18],
              linkId: parseInt(bondList[i + 19]),
              linkName: bondList[i + 20],
              linkedDeviceName: bondList[i + 21],
              execChainId: parseInt(bondList[i + 22]),
              execChainName: joinedLinkedName
            })
          }
          bonds = bonds.sort(this.compare)
          this.chains.push({
            id: parseInt(datalist[j]),
            status: parseInt(datalist[j + 1]),
            name: datalist[j + 2],
            countdown: parseInt(datalist[j + 4]),
            keepLogs: !!+datalist[j + 5],
            bonds: bonds
          })
        }
        this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    execudeOrCancel (index) {
      let postData = ''
      if (!this.chains[index].status) { postData = 'GPIO_ChainExecute;' + this.chains[index].id+ ';'+ (+this.chains[index].keepLogs)  } else { postData = 'GPIO_ChainCancel;' + this.chains[index].id }
      this.doPost(postData).then(datalist => {
        this.$route.meta.error = null
        if (datalist[1] == 'GPIO_ChainExecute') { this.chains[index].status = 1 } else if (datalist[1] == 'GPIO_ChainCancel') { this.chains[index].status = 0 }
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    reFetchTargetsData(chainId){
      this.modalBondData.rfCodes = []
      this.modalBondData.actions = []
      this.modalBondData.pwms = []
      this.modalBondData.cmds = []
      this.modalBondData.errors = []
      this.modalBondData.outputs = []
      this.modalBondData.chains = []
      let linkedData = ''
      if(this.modalBondData.linkId&&this.modalBondData.bondLinked)linkedData='CallLinkedPi;' + this.modalBondData.linkId + ';'
      if(!this.modalBondData.bondLinked||this.modalBondData.linkId)
        this.doPosts([
          this.doQPost(linkedData+'GPIO_Oname').then(datalist => {
            for (var j = 2; j < (datalist.length - 1); j += 4) {
              this.modalBondData.outputs.push({
                id: datalist[j],
                name: datalist[j + 1]
              })
            }
          }),
          this.doQPost(linkedData+'GPIO_PWMnames').then(datalist => {
            for (var j = 2; j < (datalist.length - 1); j += 2) {
              this.modalBondData.pwms.push({
                id: datalist[j],
                name: datalist[j + 1]
              })
            }
          }),
          this.doQPost(linkedData+'GPIO_ActionsNames').then(datalist => {
            for (var j = 2; j < (datalist.length - 1); j += 2) {
              this.modalBondData.actions.push({
                id: datalist[j],
                name: datalist[j + 1]
              })
            }
          }),
          this.doQPost(linkedData+'GetRfCodes').then(datalist => {
            for (var j = 2; j < (datalist.length - 1); j += 8) {
              if (datalist[j + 2] == 'Transmit') {
                this.modalBondData.rfCodes.push({
                  id: datalist[j],
                  name: datalist[j + 1]
                })
              }
            }
          }),
          this.doQPost(linkedData+'GetCustomCmds').then(datalist => {
            for (var j = 2; j < (datalist.length - 1); j += 4) {
              this.modalBondData.cmds.push({
                id: datalist[j],
                name: datalist[j + 1]
              })
            }
          }),
          this.doQPost(linkedData+'Chain_names').then(datalist => {
            for (var j = 2; j < (datalist.length - 1); j += 2) {
              if (datalist[j] != chainId)
                this.modalBondData.chains.push({
                  id: datalist[j],
                  name: datalist[j + 1]
                })
            }
          })
        ]).catch(err => {
          this.modalBondData.errors.push(err.message)
        })

    }
  },
  components: {
    Error
  }
}
</script>

