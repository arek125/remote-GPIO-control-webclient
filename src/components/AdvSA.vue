<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Advenced scheduled actions</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getActions()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openActionModal('Add new action',-1,'','',-1,-1,-1,-1,0,600,0,true)"><i class="icon icon-plus centered"></i></button>
                </div>
            </div>
            <div class="panel-body">
                <div class="modal" v-bind:class="{ active: modalActionData.active }">
                    <a class="modal-overlay" aria-label="Close" v-on:click="modalActionData.active = false"></a>
                    <div class="modal-container">
                        <div class="modal-header">
                            <a class="btn btn-clear float-right" aria-label="Close" v-on:click="modalActionData.active = false"></a>
                            <div class="modal-title h5">{{ modalActionData.title }}</div>
                            <Error v-if="modalActionData.errors.length" v-on:close-err="modalActionData.errors = []" v-bind:error-array="modalActionData.errors"/>
                        </div>
                        <div class="modal-body">
                            <div class="content">
                                <form class="form-horizontal">
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="name">Name</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="text" id="name" placeholder="Name" v-model="modalActionData.name">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Type</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="type" v-model="modalActionData.type">
                                                <option value="output">Output</option>
                                                <option value="pwm">PWM</option>
                                                <option value="chain">Chain</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalActionData.outputs.length}" v-if="modalActionData.type == 'output'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="output">Output target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" id="output" v-model="modalActionData.outputId">
                                                <option v-for="output in modalActionData.outputs" :key="output.id" :value="output.id">{{ output.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalActionData.outputs.length && !loading">Add outputs to make them visible here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalActionData.pwms.length}" v-else-if="modalActionData.type == 'pwm'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="pwm">PWM target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" id="pwm" v-model="modalActionData.pwmId">
                                                <option v-for="pwm in modalActionData.pwms" :key="pwm.id" :value="pwm.id">{{ pwm.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalActionData.pwms.length && !loading">Add PWM's to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalActionData.chains.length}" v-else-if="modalActionData.type == 'chain'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="chain">Chain target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" id="chain" v-model="modalActionData.chainId">
                                                <option v-for="chain in modalActionData.chains" :key="chain.id" :value="chain.id">{{ chain.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalActionData.chains.length && !loading">Add chains to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="noe">Number of executions</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="noe" v-model="modalActionData.noe">
                                            <p class="text-gray text-italic">-1 unlimited, 0 disabled or any number for execution countdown</p>
                                        </div>
                                    </div>
                                    <div class="form-group" v-show="modalActionData.type != 'chain'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="state">Set state</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="state" v-model="modalActionData.state">
                                                <option value="0">OFF</option>
                                                <option value="1">ON</option>
                                                <option value="2">OPPOSITE</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group" v-show="modalActionData.type == 'pwm'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="fr">Frequency(Hz)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="fr" v-model="modalActionData.fr">
                                        </div>
                                    </div>
                                    <div class="form-group" v-show="modalActionData.type == 'pwm'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="dc">Dutycycle(%)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="dc" min="0" max="100" v-model="modalActionData.dc">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-switch">
                                            <input type="checkbox" v-model="modalActionData.keepLogs">
                                            <i class="form-icon"></i>Keep logs
                                        </label>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-code float-left" v-show="modalActionData.id !== -1" v-on:click="modalActionAction(true)" :disabled="this.loading"><i class="icon icon-delete"></i> Delete</button>
                            <button class="btn btn-primary" v-on:click="modalActionAction(false)" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
                        </div>
                    </div>
                </div>
                <div class="modal" v-bind:class="{ active: modalTriggerData.active }">
                    <a class="modal-overlay" aria-label="Close" v-on:click="modalTriggerData.active = false"></a>
                    <div class="modal-container">
                        <div class="modal-header">
                            <a class="btn btn-clear float-right" aria-label="Close" v-on:click="modalTriggerData.active = false"></a>
                            <div class="modal-title h5">{{ modalTriggerData.title }}</div>
                            <Error v-if="modalTriggerData.errors.length" v-on:close-err="modalTriggerData.errors = []" v-bind:error-array="modalTriggerData.errors"/>
                        </div>
                        <div class="modal-body">
                            <div class="content">
                                <form class="form-horizontal">
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Type</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="type" v-model="modalTriggerData.type">
                                                <option value="date">Exact date time</option>
                                                <option value="hour">Time of day</option>
                                                <option value="timer">Timer</option>
                                                <option value="weekday">Week day</option>
                                                <option value="sensor">Sensor value</option>
                                                <option value="i/o">Input/Output state</option>
                                                <option value="pwm state">PWM state</option>
                                                <option value="pwm fr">PWM frequency</option>
                                                <option value="pwm dc">PWM dutycycle</option>
                                                <option value="in chain">Run only in chain</option>
                                                <option value="ping">Ping</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="op">Operator</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="text" id="op" placeholder="== / != / < / > / <= / >=" v-model="modalTriggerData.operator">
                                        </div>
                                    </div>
                                    <div class="form-group" v-if="modalTriggerData.type == 'date'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="date">Date</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="datetime-local" id="date" v-model="modalTriggerData.date">
                                        </div>
                                    </div>
                                    <div class="form-group" v-else-if="modalTriggerData.type == 'hour'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="time">Time</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="time" id="time" v-model="modalTriggerData.hour">
                                        </div>
                                    </div>
                                    <div class="form-group" v-else-if="modalTriggerData.type == 'timer'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">Timer</label>
                                        </div>
                                        <div class="col-3 col-sm-12">
                                            <input class="form-input" type="number" placeholder="h" min="0" max="23" v-model="modalTriggerData.timerh">
                                        </div>
                                        <div class="col-3 col-sm-12">
                                            <input class="form-input" type="number" placeholder="m" min="0" max="59" v-model="modalTriggerData.timerm">
                                        </div>
                                        <div class="col-3 col-sm-12">
                                            <input class="form-input" type="number" placeholder="s" min="0" max="59" v-model="modalTriggerData.timers">
                                        </div>
                                    </div>
                                    <div class="form-group" v-else-if="modalTriggerData.type == 'weekday'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="weekday">Week day</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="weekday" v-model="modalTriggerData.weekday">
                                                <option v-for="(day,index) in dayNames" :key="day" :value="index">{{ day }}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.sensors.length}" v-else-if="modalTriggerData.type == 'sensor'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">Sensor</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.sensorId">
                                                <option v-for="sensor in modalTriggerData.sensors" :key="sensor.id" :value="sensor.id">{{ sensor.name }}({{sensor.unit}})</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <input class="form-input" type="number" placeholder="value"  v-model="modalTriggerData.sensorValue">
                                            <p class="form-input-hint" v-show="!modalTriggerData.sensors.length && !loading">Add sensors to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.ios.length}" v-else-if="modalTriggerData.type == 'i/o'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">Input / Output</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.ioId">
                                                <option v-for="io in modalTriggerData.ios" :key="io.id" :value="io.id">{{ io.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <select class="form-select" v-model="modalTriggerData.ioState">
                                                <option value="0">OFF</option>
                                                <option value="1">ON</option>
                                            </select>
                                            <p class="form-input-hint" v-show="!modalTriggerData.ios.length && !loading">Add sensors to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" v-else-if="modalTriggerData.type == 'in chain'">
                                        <select class="form-select" v-model="modalTriggerData.inChain">
                                            <option value="True">True</option>
                                            <option value="False">False</option>
                                        </select>
                                    </div>
                                    <div class="form-group" v-else-if="modalTriggerData.type == 'ping'">
                                        <select class="form-select" v-model="modalTriggerData.isPinging">
                                            <option value="True">True</option>
                                            <option value="False">False</option>
                                        </select>
                                        <input class="form-input" type="text" placeholder="IP/HOST/DOMAIN"  v-model="modalTriggerData.pingHost">
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.pwms.length}" v-else-if="modalTriggerData.type.indexOf('pwm') !=-1">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">PWM</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.pwmId">
                                                <option v-for="pwm in modalTriggerData.pwms" :key="pwm.id" :value="pwm.id">{{ pwm.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <select class="form-select" v-model="modalTriggerData.pwmState" v-show="modalTriggerData.type == 'pwm state'">
                                                <option value="0">OFF</option>
                                                <option value="1">ON</option>
                                            </select>
                                            <input class="form-input" type="number" v-model="modalTriggerData.pwmFr" placeholder="Frequency" v-show="modalTriggerData.type == 'pwm fr'">
                                            <input class="form-input" type="number" min="0" max="100" v-model="modalTriggerData.pwmDc" placeholder="Dutycycle" v-show="modalTriggerData.type == 'pwm dc'">
                                            <p class="form-input-hint" v-show="!modalTriggerData.ios.length && !loading">Add sensors to make them pickable here.</p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-code float-left" v-show="modalTriggerData.id !== -1" v-on:click="modalTriggerAction(true)" :disabled="this.loading"><i class="icon icon-delete"></i> Delete</button>
                            <button class="btn btn-primary" v-on:click="modalTriggerAction(false)" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
                        </div>
                    </div>
                </div>
                <div class="modal" v-bind:class="{ active: modalPatternData.active }">
                    <a class="modal-overlay" aria-label="Close" v-on:click="modalPatternData.active = false"></a>
                    <div class="modal-container">
                        <div class="modal-header">
                            <a class="btn btn-clear float-right" aria-label="Close" v-on:click="modalPatternData.active = false"></a>
                            <div class="modal-title h5">{{ modalPatternData.title }}</div>
                            <Error v-if="modalPatternData.errors.length" v-on:close-err="modalPatternData.errors = []" v-bind:error-array="modalPatternData.errors"/>
                        </div>
                        <div class="modal-body">
                            <div class="content">
                                <div class="form-group">
                                    <input class="form-input" type="text" id="pattern" placeholder="Pattern" v-model="modalPatternData.pattern">
                                    <span class="text-gray">If this field is empty then default conjunction is '#1# and #2#' etc. which means, that all triggers must be fulfilled for the action to start. You can set your own conjunction here by using: #trigger number# and Python conjunction syntax. For example: '(#1# or #2#) and #3#' means that trigger 1 or 2 and 3 must be fulfilled for the action to start.</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" v-on:click="modalPatternAction()" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div v-if="!actions.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no actions configured</p>
                        <p class="empty-subtitle">Click the button to configure new</p>
                        <div class="empty-action">
                            <button class="btn btn-primary" v-on:click="openActionModal('Add new action',-1,'','',-1,-1,-1,-1,true,-1)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <div v-else class="columns">
                        <div class="column" v-bind:class="[col]" v-for="(action,index) in actions" :key="action.id">
                            <div class="tile">
                                <div class="tile-icon d-grid">
                                    <button class="btn btn-link" v-on:click="openActionModal('Edit '+action.name,action.id,action.name,action.type,action.outputId,action.pwmId,action.chainId,action.noe,action.keepLogs,index)">
                                        <i class="icon icon-edit"></i>
                                    </button>
                                    <button class="btn btn-link" v-on:click="openTriggerModal('Add trigger for '+action.name,-1,action.id,'date','==',null)">
                                        <i class="icon icon-plus"></i>
                                    </button>
                                    <button class="btn btn-link" :disabled="action.triggers.length < 2" v-on:click="openPatternModal('Set conjunction pattern for '+action.name,action.id,action.conjunction,index)">
                                        <i class="icon icon-resize-horiz"></i>
                                    </button>
                                </div>
                                <div class="tile-content">
                                    <div class="tile-title">
                                        <span>{{ action.name }}</span>
                                        <span class="float-right">{{ actionTargetDisc(index) }}</span>
                                    </div>
                                    <div class="tile-subtitle">
                                        <span class="text-gray">
                                            <div v-if="!action.conjunction || action.conjunction == '' || action.conjunction == 'None'">{{conjunctionDefDisc(index)}}</div>
                                            <div v-else>{{ action.conjunction }}</div>
                                        </span>
                                        <ol class="list" v-if="action.triggers.length">
                                            <li v-for="(trigger,j) in action.triggers" :key="trigger.id" >
                                                <button class="btn btn-link" v-on:click="openTriggerModal('Edit trigger '+trigger.lp+' for '+action.name,trigger.id,action.id,trigger.type,trigger.operator,trigger.data,trigger.sourceId)">{{ triggerSourceDisc(index,j) }}</button>
                                            </li>
                                        </ol>
                                        <div v-else>No triggers added.</div>
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
  name: 'SheduledActions',
  data () {
    return {
      actions: [],
      refreshInterval: '',
      updateDate: '',
      autoRefreshTime: 5,
      dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      modalActionData: {
        active: false,
        id: -1,
        title: 'New action',
        name: '',
        type: '',
        outputId: -1,
        chainId: -1,
        pwmId: -1,
        noe: -1,
        state: 0,
        fr: '',
        dc: '',
        keepLogs: true,
        errors: [],
        outputs: [],
        pwms: [],
        chains: []
      },
      modalTriggerData: {
        active: false,
        id: -1,
        title: 'New trigger',
        actionId: -1,
        sourceId: -1,
        type: '',
        operator: '==',
        date: '',
        hour: '',
        weekday: '',
        sensorId: -1,
        sensorValue: '',
        ioId: -1,
        ioState: 0,
        inChain: 'True',
        pwmId: -1,
        pwmState: 0,
        pwmFr: 600,
        pwmDc: 0,
        timerh: '',
        timerm: '',
        timers: '',
        ios: [],
        pwms: [],
        sensors: [],
        errors: [],
        isPinging: 'True',
        pingHost: ''
      },
      modalPatternData: {
        active: false,
        id: -1,
        title: 'Set conjunction pattern',
        actionId: -1,
        pattern: '',
        maxTrigger: 0,
        index: -1,
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
    this.getActions()
    if (this.$cookies.isKey('sa_arTime')) { this.autoRefreshTime = parseInt(this.$cookies.get('sa_arTime')) }
    this.autoRefresh()
  },
  beforeDestroy () {
    clearTimeout(this.refreshInterval)
  },
  methods: {
    autoRefresh () {
      this.$cookies.set('sa_arTime', this.autoRefreshTime, -1)
      clearTimeout(this.refreshInterval)
      if (this.autoRefreshTime > 0) {
        this.refreshInterval = setTimeout(() => {
          if (!this.modalActionData.active && !this.modalTriggerData.active && !this.modalPatternData.active) { this.getActions() }
          this.autoRefresh()
        }, (this.autoRefreshTime * 1000))
      }
    },
    openPatternModal (title, id, pattern, index) {
      this.modalPatternData.active = true
      this.modalPatternData.title = title
      this.modalPatternData.id = id
      this.modalPatternData.pattern = pattern
      this.modalPatternData.errors = []
      this.modalPatternData.index = index
    },
    modalPatternAction () {
      this.modalPatternData.errors = []
      let syntax = this.modalPatternData.pattern.match(/(\(*#|#)[1-9]*(#\)*|#)( and | or |)/g)
      if (syntax == null) { this.modalPatternData.errors.push('Bad syntax !') } else if (syntax.join('').length != this.modalPatternData.pattern.length) { this.modalPatternData.errors.push('Bad syntax !') }
      let numbers = this.modalPatternData.pattern.match(/#[0-9]*#/g)
      for (let hashNumber in numbers) {
        let number = numbers[hashNumber].replace(/#/g, '')
        if (number > this.actions[this.modalPatternData.index].triggers.length) { this.modalPatternData.errors.push('Trigger number ' + number + ' not exist !') }
      }
      let rightBracets = this.modalPatternData.pattern.match(/\(/g)
      let rightBracetsNumber = 0
      for (let bracket in rightBracets) { rightBracetsNumber++ }
      let leftBracets = this.modalPatternData.pattern.match(/\)/g)
      let leftBracetsNumber = 0
      for (let bracket in leftBracets) { leftBracetsNumber++ }
      if (rightBracetsNumber != leftBracetsNumber) { this.modalPatternData.errors.push('Bracket not closed ?!') }
      if (!this.modalPatternData.errors.length) {
        this.doPost('GPIO_ASA_SetConj;' + this.modalPatternData.pattern + ';' + this.modalPatternData.id).then(datalist => {
          this.actions[this.modalPatternData.index].conjunction = this.modalPatternData.pattern
          this.modalPatternData.active = false
        }).catch(err => {
          this.modalPatternData.errors.push(err.message)
        })
      }
    },
    openTriggerModal (title, id, actionId, type, operator, data, sourceId) {
      this.modalTriggerData.active = true
      this.modalTriggerData.title = title
      this.modalTriggerData.id = id
      this.modalTriggerData.actionId = actionId
      this.modalTriggerData.type = type
      this.modalTriggerData.operator = operator
      this.modalTriggerData.pwms = []
      this.modalTriggerData.ios = []
      this.modalTriggerData.sensors = []
      if (data != null) {
        switch (type) {
          case 'date':
            this.modalTriggerData.date = this.$moment.utc(data, 'YYYY-MM-DD HH:mm').local().format('YYYY-MM-DDTHH:mm')
            break
          case 'hour':
            this.modalTriggerData.hour = this.$moment.utc(this.$moment().format('YYYY-MM-DD ') + data, 'YYYY-MM-DD HH:mm').local().format('HH:mm')
            break
          case 'timer':
            let timelist = data.split(',')
            let dateM = this.$moment(parseInt(timelist[0]) * 1000).utc()
            this.modalTriggerData.timerh = dateM.hour()
            this.modalTriggerData.timerm = dateM.minutes()
            this.modalTriggerData.timers = dateM.seconds()
            break
          case 'weekday':
            this.modalTriggerData.weekday = data
            break
          case 'sensor':
            this.modalTriggerData.sensorId = sourceId
            this.modalTriggerData.sensorValue = data
            break
          case 'i/o':
            this.modalTriggerData.ioId = sourceId
            this.modalTriggerData.ioState = data
            break
          case 'in chain':
            this.modalTriggerData.inChain = data
            break
          case 'pwm state':
            this.modalTriggerData.pwmId = sourceId
            this.modalTriggerData.pwmState = data
            break
          case 'pwm fr':
            this.modalTriggerData.pwmId = sourceId
            this.modalTriggerData.pwmFr = data
            break
          case 'pwm dc':
            this.modalTriggerData.pwmId = sourceId
            this.modalTriggerData.pwmDc = data
            break
          case 'ping':
            this.modalTriggerData.pingHost = sourceId
            this.modalTriggerData.isPinging = data
            break
        }
      }
      this.doPosts([
        this.doQPost('GPIO_PWMnames').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 2) {
            this.modalTriggerData.pwms.push({
              id: datalist[j],
              name: datalist[j + 1]
            })
          }
        }),
        this.doQPost('GPIO_OInames').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 2) {
            this.modalTriggerData.ios.push({
              id: datalist[j],
              name: datalist[j + 1]
            })
          }
        }),
        this.doQPost('SENSOR_names').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 3) {
            this.modalTriggerData.sensors.push({
              id: datalist[j],
              name: datalist[j + 1],
              unit: datalist[j + 2]
            })
          }
        })
      ]).catch(err => {
        this.modalTriggerData.errors.push(err.message)
      })
    },
    modalTriggerAction (deleteO) {
      this.modalTriggerData.errors = []
      let data = ''
      let sourceId = ''
      if (!deleteO) {
        if (!/^==|<=|>=|<|>|!=$/g.test(this.modalTriggerData.operator)) { this.modalTriggerData.errors.push('Avalible operators: ==|<=|>=|<|>|!=') }
        switch (this.modalTriggerData.type) {
          case 'date':
            if (!this.modalTriggerData.date) { this.modalTriggerData.errors.push('Date required !') } else { data = this.$moment(this.modalTriggerData.date, 'YYYY-MM-DDTHH:mm').utc().format('YYYY-MM-DD HH:mm') }
            break
          case 'hour':
            if (!this.modalTriggerData.hour) { this.modalTriggerData.errors.push('Time required !') } else { data = this.$moment(this.$moment().utc().format('YYYY-MM-DD ') + this.modalTriggerData.hour, 'YYYY-MM-DD HH:mm').utc().format('HH:mm') }
            break
          case 'timer':
            if (!this.modalTriggerData.timerh || !this.modalTriggerData.timerm || !this.modalTriggerData.timers) { this.modalTriggerData.errors.push('Timer fields are required !') } else {
              data = ((parseInt(this.modalTriggerData.timerh) * 3600) + (parseInt(this.modalTriggerData.timerm) * 60)) + parseInt(this.modalTriggerData.timers)
              data = data + ',' + data + ',' + (new Date().getTime() / 1000)
            }
            break
          case 'weekday':
            data = this.modalTriggerData.weekday
            break
          case 'sensor':
            if (!this.modalTriggerData.sensorValue || !this.modalTriggerData.sensorId) { this.modalTriggerData.errors.push('Sensor fields are required !') } else {
              data = this.modalTriggerData.sensorValue
              sourceId = this.modalTriggerData.sensorId
            }
            break
          case 'i/o':
            if (!this.modalTriggerData.ioId) { this.modalTriggerData.errors.push('I/O fields are required !') } else {
              data = this.modalTriggerData.ioState
              sourceId = this.modalTriggerData.ioId
            }
            break
          case 'in chain':
            data = this.modalTriggerData.inChain
            break
          case 'pwm state':
            if (!this.modalTriggerData.pwmId) { this.modalTriggerData.errors.push('PWM fields are required !') } else {
              data = this.modalTriggerData.pwmState
              sourceId = this.modalTriggerData.pwmId
            }
            break
          case 'pwm fr':
            if (!this.modalTriggerData.pwmFr || !this.modalTriggerData.pwmId) { this.modalTriggerData.errors.push('PWM fields are required !') } else {
              data = this.modalTriggerData.pwmFr
              sourceId = this.modalTriggerData.pwmId
            }
            break
          case 'pwm dc':
            if (!this.modalTriggerData.pwmDc || !this.modalTriggerData.pwmId) { this.modalTriggerData.errors.push('PWM fields are required !') } else {
              data = this.modalTriggerData.pwmDc
              sourceId = this.modalTriggerData.pwmId
            }
            break
        case 'ping':
            if(!this.modalTriggerData.pingHost || !this.modalTriggerData.pingHost){this.modalTriggerData.errors.push('Ping feilds are required !')} else{
                data = this.modalTriggerData.isPinging
                sourceId = this.modalTriggerData.pingHost
            }
            break
        }
      }
      if (!this.modalTriggerData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'GPIO_ASA_DeleteTrigger;' + this.modalTriggerData.id + ';' + this.modalTriggerData.actionId } else if (this.modalTriggerData.id === -1) { postData = 'GPIO_ASA_AddTrigger;' + this.modalTriggerData.actionId + ';' + sourceId + ';' + this.modalTriggerData.type + ';' + this.modalTriggerData.operator + ';' + data } else { postData = 'GPIO_ASA_UpdateTrigger;' + this.modalTriggerData.actionId + ';' + sourceId + ';' + this.modalTriggerData.type + ';' + this.modalTriggerData.operator + ';' + data + ';' + this.modalTriggerData.id }
        this.doPost(postData).then(datalist => {
          this.getActions()
          this.modalTriggerData.active = false
        }).catch(err => {
          this.modalTriggerData.errors.push(err.message)
        })
      }
    },
    openActionModal (title, id, name, type, outputId, pwmId, chainId, noe, keepLogs,index) {
      this.modalActionData.active = true
      this.modalActionData.title = title
      this.modalActionData.name = name
      this.modalActionData.id = id
      this.modalActionData.type = type
      this.modalActionData.outputId = outputId
      this.modalActionData.pwmId = pwmId
      this.modalActionData.chainId = chainId
      this.modalActionData.noe = noe
      if(type == 'output')
        this.modalActionData.state = this.actions[index].outputState
      else if(type == 'pwm')
        this.modalActionData.state = this.actions[index].pwmSs
      this.modalActionData.fr = this.actions[index].pwmFr
      this.modalActionData.dc = this.actions[index].pwmDc
      this.modalActionData.keepLogs = keepLogs
      this.modalActionData.errors = []
      this.modalActionData.outputs = []
      this.modalActionData.pwms = []
      this.modalActionData.chains = []
      this.doPosts([
        this.doQPost('GPIO_Oname').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 4) {
            this.modalActionData.outputs.push({
              id: datalist[j],
              name: datalist[j + 1]
            })
          }
        }),
        this.doQPost('GPIO_PWMnames').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 2) {
            this.modalActionData.pwms.push({
              id: datalist[j],
              name: datalist[j + 1]
            })
          }
        }),
        this.doQPost('Chain_names').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 2) {
            this.modalActionData.chains.push({
              id: datalist[j],
              name: datalist[j + 1]
            })
          }
        })
      ]).catch(err => {
        this.modalActionData.errors.push(err.message)
      })
    },
    modalActionAction (deleteO) {
      this.modalActionData.errors = []
      if (!deleteO) {
        if (!this.modalActionData.name) { this.modalActionData.errors.push('Name required !') }
        if (this.modalActionData.type == 'output' && (isNaN(this.modalActionData.outputId) || this.modalActionData.outputId == '' || this.modalActionData.outputId == null || this.modalActionData.outputId == -1)) {
          this.modalActionData.errors.push('Output selection is required with this type !')
        }
        if (this.modalActionData.type == 'pwm' && (isNaN(this.modalActionData.pwmId) || this.modalActionData.pwmId == '' || this.modalActionData.pwmId == null || this.modalActionData.pwmId == -1)) {
          this.modalActionData.errors.push('PWM selection is required with this type !')
        }
        if (this.modalActionData.type == 'chain' && (isNaN(this.modalActionData.chainId) || this.modalActionData.chainId == '' || this.modalActionData.chainId == null || this.modalActionData.chainId == -1)) {
          this.modalActionData.errors.push('Chain selection is required with this type !')
        }
        if (!this.modalActionData.noe) { this.modalActionData.errors.push('Number of executions is required !') }
      }
      if (!this.modalActionData.errors.length) {
        let targetId = -1
        if (this.modalActionData.type == 'output') { targetId = this.modalActionData.outputId } else if (this.modalActionData.type == 'pwm') { targetId = this.modalActionData.pwmId } else if (this.modalActionData.type == 'chain') { targetId = this.modalActionData.chainId }
        let postData = ''
        if (deleteO) { postData = 'GPIO_ASA_Delete;' + this.modalActionData.id } else if (this.modalActionData.id === -1) { postData = 'GPIO_ASA_Add;' + this.modalActionData.name + ';' + this.modalActionData.type + ';' + targetId + ';' + this.modalActionData.noe + ';' + this.modalActionData.state + ';' + this.modalActionData.fr + ';' + this.modalActionData.dc + ';' + (+this.modalActionData.keepLogs) } else { postData = 'GPIO_ASA_Update;' + this.modalActionData.name + ';' + this.modalActionData.type + ';' + targetId + ';' + this.modalActionData.noe + ';' + this.modalActionData.state + ';' + this.modalActionData.fr + ';' + this.modalActionData.dc + ';' + this.modalActionData.id + ';' + (+this.modalActionData.keepLogs) }
        this.doPost(postData).then(datalist => {
          this.getActions()
          this.modalActionData.active = false
        }).catch(err => {
          this.modalActionData.errors.push(err.message)
        })
      }
    },
    actionTargetDisc (i) {
      if (this.actions[i].type == 'output') { return this.actions[i].outputName + ' ' + this.outState(this.actions[i].outputState) } else if (this.actions[i].type == 'pwm') { return this.actions[i].pwmName + ' ' + this.pwmState(this.actions[i].pwmState, this.actions[i].pwmDc, this.actions[i].pwmFr) } else if (this.actions[i].type == 'chain') { return this.actions[i].chainName + ' Execude' }
    },
    triggerSourceDisc (i, j) {
      let t = this.actions[i].triggers[j]
      let disc = t.type
      if (t.type == 'i/o') { disc += ' ' + t.ioName } else if (t.type.search(/pwm/) != -1) { disc += ' ' + t.pwmName } else if (t.type == 'sensor') { disc += ' ' + t.sensorName } else if (t.type == 'ping') { disc += ' ' + t.sourceId }
      disc += ' ' + t.operator + ' '
      switch (t.type) {
        case 'weekday':
          disc += this.dayOfWeek(parseInt(t.data))
          break
        case 'i/o':
        case 'pwm state':
          disc += this.outState(t.data)
          break
        case 'sensor':
          disc += t.data + t.sensorUnit
          break
        case 'hour':
          disc += this.$moment.utc(this.$moment().utc().format('YYYY-MM-DD ') + t.data, 'YYYY-MM-DD HH:mm').local().format('HH:mm')
          break
        case 'date':
          disc += this.$moment.utc(t.data, 'YYYY-MM-DD HH:mm').local().format('YYYY-MM-DD HH:mm')
          break
        case 'timer':
          let timelist = t.data.split(',')
          let Tdate = this.$moment(parseInt(timelist[0]) * 1000).utc().format('HH:mm:ss')
          let cTdate = this.$moment(parseInt(timelist[1]) * 1000).utc().format('HH:mm:ss')
          disc += Tdate + ' | ' + cTdate
          break
        default:
          disc += t.data
      }
      return disc
    },
    conjunctionDefDisc (index) {
      let conj = ''
      for (let i = 0; i < this.actions[index].triggers.length; i++) {
        conj += '#' + this.actions[index].triggers[i].lp + '#'
        if (i < this.actions[index].triggers.length - 1) conj += ' and '
      }
      return conj
    },
    dayOfWeek (dayIndex) {
      return this.dayNames[dayIndex]
    },
    getActions () {
      this.doPost('GPIO_ASAlist').then(datalist => {
        this.$route.meta.error = null
        this.actions = []
        for (var j = 2; j < (datalist.length - 1); j = j + 18) {
          let triggerList = datalist[j + 17].split('$')
          let triggers = []
          for (var i = 0; i < (triggerList.length - 1); i += 11) {
            triggers.push({
              id: parseInt(triggerList[i]),
              actionId: parseInt(datalist[j]),
              sourceId: triggerList[i + 1],
              lp: parseInt(triggerList[i + 2]),
              type: triggerList[i + 3],
              operator: triggerList[i + 4],
              data: triggerList[i + 5],
              ioName: triggerList[i + 6],
              pmwName: triggerList[i + 8],
              sensorName: triggerList[i + 9],
              sensorUnit: triggerList[i + 10]
            })
          }
          this.actions.push({
            id: parseInt(datalist[j]),
            type: datalist[j + 1],
            noe: datalist[j + 2],
            conjunction: datalist[j + 3],
            outputId: parseInt(datalist[j + 4]),
            outputState: parseInt(datalist[j + 5]),
            pwmId: parseInt(datalist[j + 6]),
            pwmFr: parseInt(datalist[j + 7]),
            pwmDc: parseInt(datalist[j + 8]),
            pwmSs: parseInt(datalist[j + 9]),
            name: datalist[j + 10],
            outputName: datalist[j + 11],
            pwmName: datalist[j + 13],
            chainId: datalist[j + 14],
            keepLogs: !!+datalist[j + 15],
            chainName: datalist[j + 16],
            triggers: triggers
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

<style>
.columns {
    padding-bottom: 120px;
}
#autorefresh {
    width: 75px;
}
</style>
