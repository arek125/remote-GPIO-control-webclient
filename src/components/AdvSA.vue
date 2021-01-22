<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Automation</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getActions()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn" v-on:click="openActionModal('Add new action',-1,'','',-1,-1,-1,-1,true,-1,-1,-1,0.3)"><i class="icon icon-plus centered"></i></button>
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
                                                <option value="rfsend">Transmit RF Code</option>
                                                <option value="cmd">Execude custom command</option>
                                                <option value="var">Set global variable</option>
                                                <option value="action_noe">Set number of executions of automated action</option>
                                                <option value="chain_ec">Set chain execution countdown</option>
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
                                    <div class="form-group" :class="{'has-error': !modalActionData.chains.length}" v-else-if="modalActionData.type == 'chain' || modalActionData.type == 'chain_ec'">
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
                                        <div class="col-3 col-sm-12" v-if="modalActionData.type == 'chain_ec'">
                                            <label class="form-label" for="ec">Execution countdown</label>
                                        </div>
                                        <div class="col-9 col-sm-12" v-if="modalActionData.type == 'chain_ec'">
                                          <input class="form-input" type="number" id="ec" min="-1" v-model="modalActionData.chainEC">
                                          <p class="text-gray text-italic">-1 infinite, 0 disabled or any number for loop countdown</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalActionData.rfCodes.length}" v-else-if="modalActionData.type == 'rfsend'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="rf">RF transmit target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" id="rf" v-model="modalActionData.rfId">
                                                <option v-for="rf in modalActionData.rfCodes" :key="rf.id" :value="rf.id">{{ rf.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalActionData.rfCodes.length && !loading">Add RF codes to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalActionData.cmds.length}" v-else-if="modalActionData.type == 'cmd'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="cmd">Custom command target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" id="cmd" v-model="modalActionData.cmdId">
                                                <option v-for="cmd in modalActionData.cmds" :key="cmd.id" :value="cmd.id">{{ cmd.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalActionData.cmds.length && !loading">Add custom commands to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalActionData.vars.length}" v-else-if="modalActionData.type == 'var'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Set value of</label>
                                        </div>
                                        <div class="col-4 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalActionData.varId" @change="modalActionData.selectedVarIndex = $event.target.selectedIndex">
                                                <option v-for="_var in modalActionData.vars" :key="_var.id" :value="_var.id">{{ _var.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalActionData.vars.length && !loading">Add global variables to make them pickable here.</p>
                                        </div>
                                        <div class="col-1 col-sm-12" style="text-align: center; padding-top: 5px;"> eq </div>
                                        <div v-if="modalActionData.vars.length" class="col-4 col-sm-12" >
                                            <input v-if="modalActionData.vars[modalActionData.selectedVarIndex].type == 'String'" class="form-input" type="text" id="val" placeholder="Default value" v-model="modalActionData.varVal">
                                            <input v-else-if="modalActionData.vars[modalActionData.selectedVarIndex].type == 'Date'" class="form-input" type="datetime-local" id="val" v-model="modalActionData.varVal">
                                            <input v-else-if="modalActionData.vars[modalActionData.selectedVarIndex].type == 'Time'" class="form-input" type="time" id="val" v-model="modalActionData.varVal">
                                            <input v-else class="form-input" type="number" id="val" v-model="modalActionData.varVal">
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !actions.length}" v-else-if="modalActionData.type == 'action_noe'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Action target</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalActionData.actionId">
                                                <option v-for="action in actions" :key="action.id" :value="action.id">{{ action.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!actions.length && !loading">Add actions to make them pickable here.</p>
                                        </div>
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="noe">Number of executions for target</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                          <input class="form-input" type="number" id="noe" min="-1" v-model="modalActionData.actionNOE">
                                          <p class="text-gray text-italic">-1 unlimited, 0 disabled or any number for execution countdown</p>
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
                                    <div class="form-group" v-show="modalActionData.type == 'output' || modalActionData.type == 'pwm' || modalActionData.type == 'chain'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="state">Set state</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <select class="form-select" id="state" v-model="modalActionData.state">
                                                <option value="0">OFF</option>
                                                <option value="1">ON</option>
                                                <option value="2" v-show="modalActionData.type != 'chain'">OPPOSITE</option>
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
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="rr">Thread refresh rate (s)</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" step="0.1" id="rr" min="0.1" v-model="modalActionData.refreshRate">
                                            <p class="text-gray text-italic">Interval (rest time) for triggers check. The lower the value, the faster the reaction will be. The higher the value, the slower the response, but less CPU usage. </p>
                                        </div>
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
                                                <option value="rfrecived">Recive RF</option>
                                                <option value="cmd">Custom command output</option>
                                                <option value="var">Global variable</option>
                                                <option value="i/o link">Linked Input/Output state</option>
                                                <option value="sensor link">Linked Sensor value</option>
                                                <option value="rfrecived link">Linked Recive RF</option>
                                                <option value="var link">Linked Global variable</option>
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
                                            <label class="form-label">Sensor value</label>
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
                                            <p class="form-input-hint" v-show="!modalTriggerData.ios.length && !loading">Add GIPO input/output to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.rfCodes.length}" v-else-if="modalTriggerData.type == 'rfrecived'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">RF Recive</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.rfId">
                                                <option v-for="rf in modalTriggerData.rfCodes" :key="rf.id" :value="rf.id">{{ rf.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <select class="form-select" v-model="modalTriggerData.isReciving">
                                                <option value="True">True</option>
                                                <option value="False">False</option>
                                            </select>
                                            <p class="form-input-hint" v-show="!modalTriggerData.rfCodes.length && !loading">Add RF codes to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.cmds.length}" v-else-if="modalTriggerData.type == 'cmd'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">Custom command</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.cmdId">
                                                <option v-for="cmd in modalTriggerData.cmds" :key="cmd.id" :value="cmd.id">{{ cmd.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <input class="form-input" placeholder="value"  v-model="modalTriggerData.cmdOutput">
                                            <p class="form-input-hint" v-show="!modalTriggerData.cmds.length && !loading">Add custom commands to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.vars.length}" v-else-if="modalTriggerData.type == 'var'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="type">Value of</label>
                                        </div>
                                        <div class="col-4 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.varId" @change="modalTriggerData.selectedVarIndex = $event.target.selectedIndex">
                                                <option v-for="_var in modalTriggerData.vars" :key="_var.id" :value="_var.id">{{ _var.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <p class="form-input-hint" v-show="!modalTriggerData.vars.length && !loading">Add global variables to make them pickable here.</p>
                                        </div>
                                        <div v-if="modalTriggerData.vars.length" class="col-4 col-sm-12" >
                                            <input v-if="modalTriggerData.vars[modalTriggerData.selectedVarIndex].type == 'String'" class="form-input" type="text" id="val" placeholder="Default value" v-model="modalTriggerData.varVal">
                                            <input v-else-if="modalTriggerData.vars[modalTriggerData.selectedVarIndex].type == 'Date'" class="form-input" type="datetime-local" id="val" v-model="modalTriggerData.varVal">
                                            <input v-else-if="modalTriggerData.vars[modalTriggerData.selectedVarIndex].type == 'Time'" class="form-input" type="time" id="val" v-model="modalTriggerData.varVal">
                                            <input v-else class="form-input" type="number" id="val" v-model="modalTriggerData.varVal">
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.linkedPis.length}" v-else-if="modalTriggerData.type == 'i/o link'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">Linked Input/Output state</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.linkId" v-on:change="getLinkedData()">
                                                <option v-for="link in modalTriggerData.linkedPis" :key="link.id" :value="link.id">{{ link.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <select class="form-select" v-model="modalTriggerData.lioId">
                                                <option v-for="lio in modalTriggerData.lios" :key="lio.id" :value="lio.id">{{ lio.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <select class="form-select" v-model="modalTriggerData.lioState">
                                                <option value="0">OFF</option>
                                                <option value="1">ON</option>
                                            </select>
                                            <p class="form-input-hint" v-show="!modalTriggerData.linkedPis.length && !loading">Add linked pis devices to make them pickable here.</p>
                                            <p class="form-input-hint" v-show="!modalTriggerData.lios.length && !loading">Add GIPO input/output on selected linked device to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.linkedPis.length}" v-else-if="modalTriggerData.type == 'sensor link'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">Linked sensor value</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.linkId" v-on:change="getLinkedData()">
                                                <option v-for="link in modalTriggerData.linkedPis" :key="link.id" :value="link.id">{{ link.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <select class="form-select" v-model="modalTriggerData.lsensorId">
                                                <option v-for="sensor in modalTriggerData.lsensors" :key="sensor.id" :value="sensor.id">{{ sensor.name }}({{sensor.unit}})</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <input class="form-input" type="number" placeholder="value"  v-model="modalTriggerData.lsensorValue">
                                            <p class="form-input-hint" v-show="!modalTriggerData.linkedPis.length && !loading">Add linked pis devices to make them pickable here.</p>
                                            <p class="form-input-hint" v-show="!modalTriggerData.lsensors.length && !loading">Add sensors on selected linked device to make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.linkedPis.length}" v-else-if="modalTriggerData.type == 'rfrecived link'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">Linked RF Recive</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.linkId" v-on:change="getLinkedData()">
                                                <option v-for="link in modalTriggerData.linkedPis" :key="link.id" :value="link.id">{{ link.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <select class="form-select" v-model="modalTriggerData.lrfId">
                                                <option v-for="rf in modalTriggerData.lrfCodes" :key="rf.id" :value="rf.id">{{ rf.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <select class="form-select" v-model="modalTriggerData.lisReciving">
                                                <option value="True">True</option>
                                                <option value="False">False</option>
                                            </select>
                                            <p class="form-input-hint" v-show="!modalTriggerData.linkedPis.length && !loading">Add linked pis devices to make them pickable here.</p>
                                            <p class="form-input-hint" v-show="!modalTriggerData.lrfCodes.length && !loading">Add RF codes on selected linked deviceto make them pickable here.</p>
                                        </div>
                                    </div>
                                    <div class="form-group" :class="{'has-error': !modalTriggerData.linkedPis.length}" v-else-if="modalTriggerData.type == 'var link'">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label">Linked global variable value</label>
                                        </div>
                                        <div class="col-9 col-sm-12 has-icon-left">
                                            <select class="form-select" v-model="modalTriggerData.linkId" v-on:change="getLinkedData()">
                                                <option v-for="link in modalTriggerData.linkedPis" :key="link.id" :value="link.id">{{ link.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <select class="form-select" v-model="modalTriggerData.lvarId">
                                                <option v-for="_var in modalTriggerData.lvars" :key="_var.id" :value="_var.id">{{ _var.name }}</option>
                                            </select>
                                            <i class="form-icon" :class="{'loading': loading}"></i>
                                            <div v-if="modalTriggerData.lvars.length">
                                              <input v-if="modalTriggerData.lvars[modalTriggerData.selectedVarIndex].type == 'String'" class="form-input" type="text" id="val" placeholder="Default value" v-model="modalTriggerData.lvarVal">
                                              <input v-else-if="modalTriggerData.lvars[modalTriggerData.selectedVarIndex].type == 'Date'" class="form-input" type="datetime-local" id="val" v-model="modalTriggerData.lvarVal">
                                              <input v-else class="form-input" type="number" id="val" v-model="modalTriggerData.lvarVal">
                                            </div>
                                            <p class="form-input-hint" v-show="!modalTriggerData.linkedPis.length && !loading">Add linked pis devices to make them pickable here.</p>
                                            <p class="form-input-hint" v-show="!modalTriggerData.lvars.length && !loading">Add variables on selected linked device to make them pickable here.</p>
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
                            <button class="btn btn-primary" v-on:click="openActionModal('Add new action',-1,'','',-1,-1,-1,-1,true,-1,-1,-1,0.3)"><i class="icon icon-plus centered"></i></button>
                        </div>
                    </div>
                    <div v-else class="columns">
                        <div class="column" v-bind:class="[col]" v-for="(action,index) in actions" :key="action.id">
                            <div class="tile">
                                <div class="tile-icon d-grid">
                                    <button class="btn btn-link" v-on:click="openActionModal('Edit '+action.name,action.id,action.name,action.type,action.outputId,action.pwmId,action.chainId,action.noe,action.keepLogs,index,action.rfId,action.cmdId,action.refreshRate,action.varId,action.varVal,action.actionId,action.actionNOE,action.chainEC)">
                                        <i class="icon icon-edit"></i>
                                    </button>
                                    <button class="btn btn-link tooltip tooltip-right" v-on:click="openTriggerModal('Add trigger for '+action.name,-1,action.id,'date','==',null,0)" data-tooltip="Add trigger">
                                        <i class="icon icon-plus"></i>
                                    </button>
                                    <button class="btn btn-link tooltip tooltip-right" :disabled="action.triggers.length < 2" v-on:click="openPatternModal('Set conjunction pattern for '+action.name,action.id,action.conjunction,index)" data-tooltip="Set conjunction pattern">
                                        <i class="icon icon-resize-horiz"></i>
                                    </button>
                                    <button class="btn btn-link tooltip tooltip-right" data-tooltip="Cpu usage (Click to enable/disable whole action)" v-on:click="startStopAction(action.id,action.noe)"><span :class="{'text-success': action.noe, 'text-error': !action.noe}">{{action.cpuUsage}}%</span></button>
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
                                                <button class="btn btn-link" v-on:click="openTriggerModal('Edit trigger '+trigger.lp+' for '+action.name,trigger.id,action.id,trigger.type,trigger.operator,trigger.data,trigger.sourceId,trigger.linkId)">{{ triggerSourceDisc(index,j) }}</button>
                                            </li>
                                        </ol>
                                        <div v-else>No triggers added.</div>
                                        <span class="float-right text-gray">N.O.E.: {{action.noe}}</span>
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
        rfId: -1,
        cmdId: -1,
        pwmId: -1,
        varId: -1,
        chainEC: -1,
        actionId: -1,
        actionNOE: -1,
        selectedVarIndex: 0,
        noe: -1,
        state: 0,
        fr: '',
        dc: '',
        keepLogs: true,
        refreshRate: 0.3,
        errors: [],
        outputs: [],
        pwms: [],
        chains: [],
        rfCodes: [],
        cmds: [],
        vars: []
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
        lsensorId: -1,
        sensorValue: '',
        lsensorValue: '',
        ioId: -1,
        lioId: -1,
        rfId: -1,
        lrfId: -1,
        cmdId: -1,
        varId: -1,
        varVal: '',
        selectedVarIndex: 0,
        lvarId: -1,
        lvarVal: '',
        cmdOutput: '',
        ioState: 0,
        lioState: 0,
        inChain: 'True',
        pwmId: -1,
        pwmState: 0,
        pwmFr: 600,
        pwmDc: 0,
        timerh: '',
        timerm: '',
        timers: '',
        ios: [],
        lios: [],
        linkedIos: [],
        pwms: [],
        sensors: [],
        lsensors: [],
        rfCodes: [],
        lrfCodes: [],
        cmds: [],
        vars: [],
        lvars: [],
        linkedPis: [],
        linkId: -1,
        errors: [],
        isPinging: 'True',
        isReciving: 'True',
        lisReciving: 'True',
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
      default: 'col-4 col-xl-6 col-sm-12'
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
      // let rightBracetsNumber = 0
      // for (let bracket in rightBracets) { rightBracetsNumber++ }
      let leftBracets = this.modalPatternData.pattern.match(/\)/g)
      // let leftBracetsNumber = 0
      // for (let bracket in leftBracets) { leftBracetsNumber++ }
      if(rightBracets || leftBracets)
        if (rightBracets.length != leftBracets.length) { this.modalPatternData.errors.push('Bracket not closed ?!') }
      if (!this.modalPatternData.errors.length) {
        this.doPost('GPIO_ASA_SetConj;' + this.modalPatternData.pattern + ';' + this.modalPatternData.id).then(() => {
          this.actions[this.modalPatternData.index].conjunction = this.modalPatternData.pattern
          this.modalPatternData.active = false
        }).catch(err => {
          this.modalPatternData.errors.push(err.message)
        })
      }
    },
    openTriggerModal (title, id, actionId, type, operator, data, sourceId, linkId) {
      this.modalTriggerData.active = true
      this.modalTriggerData.title = title
      this.modalTriggerData.id = id
      this.modalTriggerData.actionId = actionId
      this.modalTriggerData.type = type
      this.modalTriggerData.operator = operator
      this.modalTriggerData.linkId = linkId
      this.modalTriggerData.pwms = []
      this.modalTriggerData.ios = []
      this.modalTriggerData.sensors = []
      this.modalTriggerData.rfCodes = []
      this.modalTriggerData.cmds = []
      this.modalTriggerData.vars = []
      this.modalTriggerData.linkedPis = []
      if (linkId != -1)this.getLinkedData()
      if (data != null) {
        switch (type) {
          case 'date':
            this.modalTriggerData.date = this.$moment.utc(data, 'YYYY-MM-DD HH:mm').local().format('YYYY-MM-DDTHH:mm')
            break
          case 'hour':
            this.modalTriggerData.hour = this.$moment.utc(this.$moment().format('YYYY-MM-DD ') + data, 'YYYY-MM-DD HH:mm').local().format('HH:mm')
            break
          case 'timer':{
              let timelist = data.split(',')
              let dateM = this.$moment(parseInt(timelist[0]) * 1000).utc()
              this.modalTriggerData.timerh = dateM.hour()
              this.modalTriggerData.timerm = dateM.minutes()
              this.modalTriggerData.timers = dateM.seconds()
              break
            }
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
          case 'rfrecived':
            this.modalTriggerData.rfId = sourceId
            this.modalTriggerData.isReciving = data
            break
          case 'cmd':
            this.modalTriggerData.cmdId = sourceId
            this.modalTriggerData.cmdOutput = data
            break
          case 'var':
            this.modalTriggerData.varId = sourceId
            this.modalTriggerData.varVal = data
            break
          case 'i/o link':
            this.modalTriggerData.lioId = sourceId
            this.modalTriggerData.lioState = data
            break
          case 'sensor link':
            this.modalTriggerData.lrfId = sourceId
            this.modalTriggerData.lisReciving = data
            break
          case 'rfrecived link':
            this.modalTriggerData.lsensorId = sourceId
            this.modalTriggerData.lsensorValue = data
            break
          case 'var link':
            this.modalTriggerData.lvarId = sourceId
            this.modalTriggerData.lvarVal = data
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
        }),
        this.doQPost('GetRfCodes').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 8) {
            if (datalist[j + 2] == 'Recive') {
              this.modalTriggerData.rfCodes.push({
                id: datalist[j],
                name: datalist[j + 1]
              })
            }
          }
        }),
        this.doQPost('GetCustomCmds').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 4) {
            this.modalTriggerData.cmds.push({
              id: datalist[j],
              name: datalist[j + 1]
            })
          }
        }),
        this.doQPost('GetLinkedPis;0').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 6) {
            this.modalTriggerData.linkedPis.push({
              id: datalist[j],
              name: datalist[j + 1]
            })
          }
        }),
        this.doQPost('GetGlobalVars').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 5) {
            this.modalTriggerData.vars.push({
              id: datalist[j],
              name: datalist[j + 1],
              type: datalist[j + 3]
            })
          }
        })
      ]).then(()=>{
        if(this.modalTriggerData.varId || this.modalTriggerData.lvarId)this.modalTriggerData.selectedVarIndex = this.modalTriggerData.vars.findIndex(el=>el.id == this.modalTriggerData.varId || this.modalTriggerData.lvarId)
      })
      .catch(err => {
        this.modalTriggerData.errors.push(err.message)
      })
    },
    modalTriggerAction (deleteO) {
      this.modalTriggerData.errors = []
      let data = ''
      let sourceId = ''
      let linkId = ''
      let linkName = ''
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
            if (!this.modalTriggerData.timers) { 
              this.modalTriggerData.errors.push('Timer fields are required !')

              } else {
              if(!this.modalTriggerData.timerh)this.modalTriggerData.timerh=0
              if(!this.modalTriggerData.timerm)this.modalTriggerData.timerm=0
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
            if (!this.modalTriggerData.pingHost || !this.modalTriggerData.pingHost) { this.modalTriggerData.errors.push('Ping feilds are required !') } else {
              data = this.modalTriggerData.isPinging
              sourceId = this.modalTriggerData.pingHost
            }
            break
          case 'rfrecived':
            if (!this.modalTriggerData.rfId) { this.modalTriggerData.errors.push('RF fields are required !') } else {
              data = this.modalTriggerData.isReciving
              sourceId = this.modalTriggerData.rfId
            }
            break
          case 'cmd':
            if (!this.modalTriggerData.cmdOutput || !this.modalTriggerData.cmdId) { this.modalTriggerData.errors.push('Custom command fields are required !') } else {
              data = this.modalTriggerData.cmdOutput
              sourceId = this.modalTriggerData.cmdId
            }
            break
          case 'var':
            if (!this.modalTriggerData.varId) { this.modalTriggerData.errors.push('Variable fields are required !') } else {
              data = this.modalTriggerData.varVal
              sourceId = this.modalTriggerData.varId
            }
            break
          case 'i/o link':
            if (!this.modalTriggerData.lioId || !this.modalTriggerData.linkId) { this.modalTriggerData.errors.push('Linked I/O fields are required !') } else {
              data = this.modalTriggerData.lioState
              sourceId = this.modalTriggerData.lioId
              linkId = this.modalTriggerData.linkId
              linkName = this.modalTriggerData.lios.find(x => x.id == sourceId).name
            }
            break
          case 'sensor link':
            if (!this.modalTriggerData.lsensorValue || !this.modalTriggerData.lsensorId || !this.modalTriggerData.linkId) { this.modalTriggerData.errors.push('Linked Sensor fields are required !') } else {
              data = this.modalTriggerData.lsensorValue
              sourceId = this.modalTriggerData.lsensorId
              linkId = this.modalTriggerData.linkId
              let lsensor = this.modalTriggerData.lsensors.find(x => x.id == sourceId)
              linkName = lsensor.name +'('+ lsensor.unit +')'
            }
            break
          case 'rfrecived link':
            if (!this.modalTriggerData.lrfId || !this.modalTriggerData.linkId) { this.modalTriggerData.errors.push('Linked RF fields are required !') } else {
              data = this.modalTriggerData.lisReciving
              sourceId = this.modalTriggerData.lrfId
              linkId = this.modalTriggerData.linkId
              linkName = this.modalTriggerData.lrfCodes.find(x => x.id == sourceId).name
            }
            break
          case 'var link':
            if (!this.modalTriggerData.lvarVal || !this.modalTriggerData.lvarId || !this.modalTriggerData.linkId) { this.modalTriggerData.errors.push('Linked Variable fields are required !') } else {
              data = this.modalTriggerData.lvarVal
              sourceId = this.modalTriggerData.lvarId
              linkId = this.modalTriggerData.linkId
              let lvar = this.modalTriggerData.lvars.find(x => x.id == sourceId)
              linkName = lvar.name
            }
            break
        }
      }
      if (!this.modalTriggerData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'GPIO_ASA_DeleteTrigger;' + this.modalTriggerData.id + ';' + this.modalTriggerData.actionId } else if (this.modalTriggerData.id === -1) { postData = 'GPIO_ASA_AddTrigger;' + this.modalTriggerData.actionId + ';' + sourceId + ';' + this.modalTriggerData.type + ';' + this.modalTriggerData.operator + ';' + data + ';' + linkId + ';' + linkName } else { postData = 'GPIO_ASA_UpdateTrigger;' + this.modalTriggerData.actionId + ';' + sourceId + ';' + this.modalTriggerData.type + ';' + this.modalTriggerData.operator + ';' + data + ';' + this.modalTriggerData.id + ';' + linkId + ';' + linkName }
        this.doPost(postData).then(() => {
          this.getActions()
          this.modalTriggerData.active = false
        }).catch(err => {
          this.modalTriggerData.errors.push(err.message)
        })
      }
    },
    openActionModal (title, id, name, type, outputId, pwmId, chainId, noe, keepLogs, index, rfId, cmdId, refreshRate, varId, varVal, actionId, actionNOE, chainEC) {
      this.modalActionData.active = true
      this.modalActionData.title = title
      this.modalActionData.name = name
      this.modalActionData.id = id
      this.modalActionData.type = type
      this.modalActionData.outputId = outputId
      this.modalActionData.pwmId = pwmId
      this.modalActionData.chainId = chainId
      this.modalActionData.rfId = rfId
      this.modalActionData.cmdId = cmdId
      this.modalActionData.noe = noe
      this.modalActionData.refreshRate = refreshRate
      this.modalActionData.varId = varId
      this.modalActionData.actionId = actionId
      this.modalActionData.actionNOE = actionNOE
      this.modalActionData.chainEC = chainEC
      if (type == 'output' || type == 'chain') { this.modalActionData.state = this.actions[index].outputState } 
      else if (type == 'pwm') {
        this.modalActionData.state = this.actions[index].pwmSs
        this.modalActionData.fr = this.actions[index].pwmFr
        this.modalActionData.dc = this.actions[index].pwmDc
      }
      else if (type == 'var')this.modalActionData.varVal = varVal
      this.modalActionData.keepLogs = keepLogs
      this.modalActionData.errors = []
      this.modalActionData.outputs = []
      this.modalActionData.pwms = []
      this.modalActionData.chains = []
      this.modalActionData.rfCodes = []
      this.modalActionData.cmds = []
      this.modalActionData.vars = []
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
        }),
        this.doQPost('GetRfCodes').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 8) {
            if (datalist[j + 2] == 'Transmit') {
              this.modalActionData.rfCodes.push({
                id: datalist[j],
                name: datalist[j + 1]
              })
            }
          }
        }),
        this.doQPost('GetCustomCmds').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 4) {
            this.modalActionData.cmds.push({
              id: datalist[j],
              name: datalist[j + 1]
            })
          }
        }),
        this.doQPost('GetGlobalVars').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 5) {
            this.modalActionData.vars.push({
              id: datalist[j],
              name: datalist[j + 1],
              type: datalist[j + 3]
            })
          }
        })
      ]).then(()=>{
        if(varId)this.modalActionData.selectedVarIndex = this.modalActionData.vars.findIndex(el=>el.id == varId)
      })
      .catch(err => {
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
        if (this.modalActionData.type == 'rfsend' && (isNaN(this.modalActionData.rfId) || this.modalActionData.rfId == '' || this.modalActionData.rfId == null || this.modalActionData.rfId == -1)) {
          this.modalActionData.errors.push('Rf action selection is required with this type !')
        }
        if (this.modalActionData.type == 'cmd' && (isNaN(this.modalActionData.cmdId) || this.modalActionData.cmdId == '' || this.modalActionData.cmdId == null || this.modalActionData.cmdId == -1)) {
          this.modalActionData.errors.push('CMD action selection is required with this type !')
        }
        if (this.modalActionData.type == 'var' && (isNaN(this.modalActionData.varId) || this.modalActionData.varId == '' || this.modalActionData.varId == null || this.modalActionData.varId == -1)) {
          this.modalActionData.errors.push('Global variable selection is required with this type !')
        }
        if (this.modalActionData.type == 'chain_ec' && (isNaN(this.modalActionData.chainId) || this.modalActionData.chainId == '' || this.modalActionData.chainId == null || this.modalActionData.chainId == -1 || isNaN(this.modalActionData.chainEC))) {
          this.modalActionData.errors.push('Chain selection and counter is required with this type !')
        }
        if (this.modalActionData.type == 'action_noe' && (isNaN(this.modalActionData.actionId) || this.modalActionData.actionId == '' || this.modalActionData.actionId == null || this.modalActionData.actionId == -1 || isNaN(this.modalActionData.actionNOE))) {
          this.modalActionData.errors.push('Action selection and counter is required with this type !')
        }
        if (!this.modalActionData.noe) { this.modalActionData.errors.push('Number of executions is required !') }
      }
      if (!this.modalActionData.errors.length) {
        let targetId = -1
        if (this.modalActionData.type == 'output') { targetId = this.modalActionData.outputId } else if (this.modalActionData.type == 'pwm') { targetId = this.modalActionData.pwmId } else if (this.modalActionData.type == 'chain'||this.modalActionData.type == 'chain_ec') { targetId = this.modalActionData.chainId } else if (this.modalActionData.type == 'rfsend') { targetId = this.modalActionData.rfId } else if (this.modalActionData.type == 'cmd') { targetId = this.modalActionData.cmdId }else if (this.modalActionData.type == 'var') { targetId = this.modalActionData.varId }else if (this.modalActionData.type == 'action_noe') { targetId = this.modalActionData.actionId }
        let targetVal = ''
        if(this.modalActionData.type == 'var')targetVal = this.modalActionData.varVal; else if (this.modalActionData.type == 'chain_ec')targetVal = this.modalActionData.chainEC;else if (this.modalActionData.type == 'action_noe')targetVal = this.modalActionData.actionNOE; else targetVal = this.modalActionData.state
        let postData = ''
        if (deleteO) { postData = 'GPIO_ASA_Delete;' + this.modalActionData.id } else if (this.modalActionData.id === -1) { postData = 'GPIO_ASA_Add;' + this.modalActionData.name + ';' + this.modalActionData.type + ';' + targetId + ';' + this.modalActionData.noe + ';' + targetVal + ';' + this.modalActionData.fr + ';' + this.modalActionData.dc + ';' + (+this.modalActionData.keepLogs) + ';' + this.modalActionData.refreshRate } else { postData = 'GPIO_ASA_Update;' + this.modalActionData.name + ';' + this.modalActionData.type + ';' + targetId + ';' + this.modalActionData.noe + ';' + targetVal + ';' + this.modalActionData.fr + ';' + this.modalActionData.dc + ';' + this.modalActionData.id + ';' + (+this.modalActionData.keepLogs) + ';' + this.modalActionData.refreshRate }
        this.doPost(postData).then(() => {
          this.getActions()
          this.modalActionData.active = false
        }).catch(err => {
          this.modalActionData.errors.push(err.message)
        })
      }
    },
    actionTargetDisc (i) {
      if (this.actions[i].type == 'output') { return this.actions[i].outputName + ' ' + this.outState(this.actions[i].outputState) } 
      else if (this.actions[i].type == 'pwm') { return this.actions[i].pwmName + ' ' + this.pwmState(this.actions[i].pwmState, this.actions[i].pwmDc, this.actions[i].pwmFr) } 
      else if (this.actions[i].type == 'chain') { return this.actions[i].chainName + (this.actions[i].outputState?' Execude':' Cancel') } 
      else if (this.actions[i].type == 'rfsend') { return this.actions[i].rfName + ' Transmit' } 
      else if (this.actions[i].type == 'cmd') { return this.actions[i].cmdName + ' Execude' }
      else if (this.actions[i].type == 'var') { return this.actions[i].varName + ' = ' + this.actions[i].varVal}
      else if (this.actions[i].type == 'chain_ec') { return this.actions[i].chainName + ' E.C. = ' + this.actions[i].chainEC} 
      else if (this.actions[i].type == 'action_noe') { return this.actions.find(action => action.id == this.actions[i].actionId).name + ' N.O.E. = ' + this.actions[i].actionNOE} 
    },
    triggerSourceDisc (i, j) {
      let t = this.actions[i].triggers[j]
      let disc = t.type
      if (t.type == 'i/o') { disc += ' ' + t.ioName } 
      else if (t.type.search(/pwm/) != -1) { disc += ' ' + t.pwmName } 
      else if (t.type == 'sensor') { disc += ' ' + t.sensorName } 
      else if (t.type == 'ping') { disc += ' ' + t.sourceId } 
      else if (t.type == 'rfrecived') { disc += ' ' + t.rfName } 
      else if (t.type == 'cmd') { disc += ' ' + t.cmdName } 
      else if (t.type == 'var') { disc += ' ' + t.valName } 
      else if (t.type == 'i/o link') { disc = 'i/o(l) ' + t.linkName + ':' + t.linkSName }
      else if (t.type == 'sensor link') { disc = 'sensor(l) ' + t.linkName + ':' + t.linkSName } 
      else if (t.type == 'rfrecived link') { disc = 'rf(l) ' + t.linkName + ':' + t.linkSName }
      else if (t.type == 'var link') { disc = 'var(l) ' + t.linkName + ':' + t.linkSName }
      disc += ' ' + t.operator + ' '
      switch (t.type) {
        case 'weekday':
          disc += this.dayOfWeek(parseInt(t.data))
          break
        case 'i/o':
        case 'i/o link':
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
        case 'timer':{
            let timelist = t.data.split(',')
            let Tdate = this.$moment(parseInt(timelist[0]) * 1000).utc().format('HH:mm:ss')
            let cTdate = this.$moment(parseInt(timelist[1]) * 1000).utc().format('HH:mm:ss')
            disc += Tdate+ ' | ' + cTdate
            break
        }
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
    startStopAction (id,noe){
      if(!noe)noe = -1
      else noe = 0
      this.doPost('startStopASA;'+id+";"+noe).then(() => {
        this.getActions()
      })
    },
    getActions () {
      this.doPost('GPIO_ASAlist').then(datalist => {
        this.$route.meta.error = null
        this.actions = []
        for (var j = 2; j < (datalist.length - 1); j = j + 30) {
          let triggerList = datalist[j + 29].split('$')
          let triggers = []
          for (var i = 0; i < (triggerList.length - 1); i += 17) {
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
              sensorUnit: triggerList[i + 10],
              rfName: triggerList[i + 11],
              cmdName: triggerList[i + 12],
              linkId: parseInt(triggerList[i + 13]),
              linkSName: triggerList[i + 14],
              linkName: triggerList[i + 15],
              valName: triggerList[i + 16]
            })
          }
          this.actions.push({
            id: parseInt(datalist[j]),
            type: datalist[j + 1],
            noe: parseInt(datalist[j + 2]),
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
            rfId: parseInt(datalist[j + 17]),
            rfName: datalist[j + 18],
            cmdId: parseInt(datalist[j + 19]),
            cmdName: datalist[j + 20],
            refreshRate: parseFloat(datalist[j + 21]),
            cpuUsage: parseFloat(datalist[j + 22]),
            varId: parseInt(datalist[j + 23]),
            varVal: datalist[j + 24],
            varName: datalist[j + 25],
            actionId: parseInt(datalist[j + 26]),
            actionNOE: datalist[j + 27],
            chainEC: datalist[j + 28],
            triggers: triggers
          })
        }
        this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    getLinkedData () {
      if (this.modalTriggerData.linkId) {
        this.modalTriggerData.lios = []
        this.modalTriggerData.lsensors = []
        this.modalTriggerData.lrfCodes = []
        this.modalTriggerData.lvars = []
        this.doPosts([
          this.doQPost('CallLinkedPi;' + this.modalTriggerData.linkId + ';GPIO_OInames').then(datalist => {
            for (var j = 2; j < (datalist.length - 1); j += 2) {
              this.modalTriggerData.lios.push({
                id: datalist[j],
                name: datalist[j + 1]
              })
            }
          }),
          this.doQPost('CallLinkedPi;' + this.modalTriggerData.linkId +';SENSOR_names').then(datalist => {
            for (var j = 2; j < (datalist.length - 1); j += 3) {
              this.modalTriggerData.lsensors.push({
                id: datalist[j],
                name: datalist[j + 1],
                unit: datalist[j + 2]
              })
            }
        }),
        this.doQPost('CallLinkedPi;' + this.modalTriggerData.linkId +';GetRfCodes').then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 8) {
            if (datalist[j + 2] == 'Recive') {
              this.modalTriggerData.lrfCodes.push({
                id: datalist[j],
                name: datalist[j + 1]
              })
            }
          }
        }),
        this.doQPost('CallLinkedPi;' + this.modalTriggerData.linkId +';GetGlobalVars').then(datalist => {
            for (var j = 2; j < (datalist.length - 1); j += 5) {
              this.modalTriggerData.lvars.push({
                id: datalist[j],
                name: datalist[j + 1],
                type: datalist[j + 3]
              })
            }
        })
        ]).catch(err => {
          this.modalTriggerData.errors.push(err.message)
        })
      }
    }
  },
  components: {
    Error
  }
}
</script>

