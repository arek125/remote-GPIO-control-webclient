<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Sensors list</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <button class="btn" v-on:click="getSensors()"><i class="icon icon-refresh centered"></i></button>
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
                                            <label class="form-label" for="hs">History save interval</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" id="hs" placeholder="In seconds" v-model="modalData.historyRefresh">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-3 col-sm-12">
                                            <label class="form-label" for="hk">History range back</label>
                                        </div>
                                        <div class="col-9 col-sm-12">
                                            <input class="form-input" type="number" min="1" id="hk" placeholder="In days" v-model="modalData.historyKeep">
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-code float-left" v-on:click="modalAction(true)" :disabled="this.loading"><i class="icon icon-delete"></i> Delete</button>
                            <button class="btn btn-primary" v-on:click="modalAction(false)" :disabled="this.loading"><i class="icon icon-check"></i> Confirm</button>
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div v-if="!sensors.length && !loading" class="empty centered">
                        <div class="empty-icon">
                            <i class="icon icon-4x icon-cross"></i>
                        </div>
                        <p class="empty-title h5">There are no sensors configured</p>
                    </div>
                    <div v-else class="columns">
                        <div class="column" v-bind:class="[col]" v-for="(sensor,index) in sensors" :key="sensor.id" >
                            <div class="tile tile-centered">
                                <div class="tile-icon">
                                    <div class="tile-title text-large text-bold">{{ sensor.value+sensor.unit }}</div>
                                </div>
                                <div class="tile-content">
                                        <div class="tile-title">{{ sensor.name }}</div>
                                        <div class="tile-subtitle text-gray ">{{ sensor.id }}</div>
                                </div>
                                <div class="tile-content">
                                    <div class="tile-title text-right">{{ sensor.refreshDate }}</div>
                                    <div class="tile-subtitle text-gray text-right">{{ sensor.type }}</div>
                                </div>
                                <div class="tile-action d-grid">
                                    <div class="form-group float-right">
                                        <label class="form-checkbox">
                                            <input type="checkbox" v-model="sensor.selected" v-on:change="setSelection(sensor.selected, sensor.id, sensor.unit, sensor.name)">
                                            <i class="form-icon"></i>
                                        </label>
                                    </div>
                                    <button class="btn btn-link" >
                                        <i class="icon icon-edit" v-on:click="openModal('Edit '+sensor.id,sensor.name,sensor.id,sensor.historyRefresh,sensor.historyKeep)"></i>
                                    </button>
                                    <button class="btn btn-link" >
                                        <i class="icon icon-refresh" v-on:click="refreshSensor(sensor.id,index)"></i>
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
  name: 'SensorsList',
  data () {
    return {
      sensors: [],
      selectedSensors: [],
      selectedUnit: 'any',
      refreshInterval: '',
      updateDate: '',
      autoRefreshTime: 5,
      modalData: {
        active: false,
        id: -1,
        index: -1,
        title: '',
        name: '',
        historyRefresh: 3600,
        historyKeep: 7,
        errors: []
      }
    }
  },
  props: {
    col: {
      type: String,
      default: 'col-4 col-md-6 col-xl-12'
    }
  },
  created () {
    this.getSensors()
    if (this.$cookies.isKey('sensor_arTime')) { this.autoRefreshTime = parseInt(this.$cookies.get('sensor_arTime')) }
    this.autoRefresh()
  },
  beforeDestroy () {
    clearTimeout(this.refreshInterval)
  },
  methods: {
    autoRefresh () {
      this.$cookies.set('sensor_arTime', this.autoRefreshTime, -1)
      clearTimeout(this.refreshInterval)
      if (this.autoRefreshTime > 0) {
        this.refreshInterval = setTimeout(() => {
          if (!this.modalData.active) { this.getSensors() }
          this.autoRefresh()
        }, (this.autoRefreshTime * 1000))
      }
    },
    setSelection (selected, id, unit, name) {
      if (selected && this.selectedSensors.length == 0) { this.selectedUnit = unit } else if (!selected && this.selectedSensors.length == 1) { this.selectedUnit = 'any' }
      if (selected && this.selectedSensors.indexOf(id) == -1) { this.selectedSensors.push(id) } else if (!selected && this.selectedSensors.indexOf(id) > -1) { this.selectedSensors.splice(this.selectedSensors.indexOf(id), 1) }
      this.$emit('selectionChange', this.selectedSensors)
    },
    openModal (title, name, id, historyRefresh, historyKeep) {
      this.modalData.active = true
      this.modalData.title = title
      this.modalData.name = name
      this.modalData.id = id
      this.modalData.historyRefresh = historyRefresh
      this.modalData.historyKeep = historyKeep
      this.modalData.errors = []
    },
    modalAction (deleteO) {
      this.modalData.errors = []
      if (!deleteO) {
        if (!this.modalData.name) { this.modalData.errors.push('Name required !') }
        if (!this.modalData.historyRefresh) { this.modalData.errors.push('History refresh value is required !') }
        if (!this.modalData.historyKeep) { this.modalData.errors.push('History range back value is required !') }
      }
      if (!this.modalData.errors.length) {
        let postData = ''
        if (deleteO) { postData = 'SENSOR_remove;' + this.modalData.id } else { postData = 'SENSOR_update;' + this.modalData.id + ';' + this.modalData.name + ';' + this.modalData.historyRefresh + ';' + this.modalData.historyKeep }
        this.doPost(postData).then(datalist => {
          this.getSensors()
          this.modalData.active = false
        }).catch(err => {
          this.modalData.errors.push(err.message)
        })
      }
    },
    getSensors () {
      this.doPost('SENSOR_list').then(datalist => {
        this.$route.meta.error = null
        this.sensors = []
        for (var j = 2; j < (datalist.length - 1); j = j + 8) {
          this.sensors.push({
            id: datalist[j],
            name: datalist[j + 1],
            type: datalist[j + 2],
            value: parseFloat(datalist[j + 3]),
            historyRefresh: datalist[j + 4],
            historyKeep: datalist[j + 5],
            unit: datalist[j + 6],
            refreshDate: this.$moment.utc(datalist[j + 7], 'YYYY-MM-DD HH:mm:ss').local().format('YYYY-MM-DD HH:mm:ss'),
            selected: this.selectedSensors.indexOf(datalist[j]) > -1
          })
        }
        this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    },
    refreshSensor (id, index) {
      this.doPost('SENSOR_refresh;' + id).then(datalist => {
        this.$route.meta.error = null
        let value = parseFloat(datalist[2])
        if (value = -999) { this.$route.meta.error = 'Sensor error' } else { this.sensors[index].value = value }
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
.unclickable {
    pointer-events: none;
}
.btn-group{
    margin-right: 15px
}
</style>
