<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>History</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="input-group filter">
                    <input class="form-input input-sm" type="date" placeholder="Date from" v-model="dateFrom">
                    <input class="form-input input-sm" type="date" placeholder="Date to" v-model="dateTo">
                    <button class="btn input-group-btn btn-sm" v-on:click="getHistory()"><i class="icon icon-refresh centered"></i></button>
                    <button class="btn btn-sm" v-on:click="sniffModalActive = true">Sniffer</button>
                </div>
            </div>
            <div class="panel-body">
                <div class="modal" v-bind:class="{ active: sniffModalActive }">
                    <a class="modal-overlay" aria-label="Close" v-on:click="sniffModalActive = false"></a>
                    <div class="modal-container log-container">
                        <div class="modal-header">
                            <div class="modal-title h5">RF Sniffer<div class="loading float-right"></div></div>
                            <a class="btn btn-clear float-right" aria-label="Close" v-on:click="sniffModalActive = false"></a>
                        </div>
                        <div class="modal-body">
                            <RfSniffer v-if="sniffModalActive"/>
                        </div>
                    </div>
                </div>
                <table class="table table-striped" v-if="history.length">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Code</th>
                            <th>Date</th>
                            <th>Pulse length</th>
                            <th>Protocol</th>
                            <th>Bit length</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(hEl,index) in history" :key="index">
                            <td>{{hEl.name}}</td>
                            <td>{{hEl.type}}</td>
                            <td>{{hEl.code}}</td>
                            <td>{{hEl.date}}</td>
                            <td>{{hEl.pulseLength}}</td>
                            <td>{{hEl.protocol}}</td>
                            <td>{{hEl.bitLength}}</td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="empty centered">
                    <div class="empty-icon">
                        <i class="icon icon-4x icon-cross"></i>
                    </div>
                    <p class="empty-title h5">There are is no data in the selected range</p>
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
import RfSniffer from '@/components/RfSniffer.vue'

export default {
  name: 'RFHistory',
  data () {
    return {
      history: [],
      sniffModalActive: false,
      refreshInterval: '',
      updateDate: '',
      autoRefreshTime: 5,
      dateFrom: '',
      dateTo: ''
    }
  },
  created () {
    this.dateFrom = this.$moment().subtract(7, 'days').format('YYYY-MM-DD')
    this.dateTo = this.$moment().add(1, 'days').format('YYYY-MM-DD')
    this.getHistory()
    if (this.$cookies.isKey('hrf_arTime')) { this.autoRefreshTime = parseInt(this.$cookies.get('hrf_arTime')) }
    this.autoRefresh()
  },
  beforeDestroy () {
    clearTimeout(this.refreshInterval)
  },
  methods: {
    autoRefresh () {
      this.$cookies.set('hrf_arTime', this.autoRefreshTime, -1)
      clearTimeout(this.refreshInterval)
      if (this.autoRefreshTime > 0) {
        this.refreshInterval = setTimeout(() => {
          this.getHistory()
          this.autoRefresh()
        }, (this.autoRefreshTime * 1000))
      }
    },
    getHistory () {
      if (this.dateFrom && this.dateTo) {
        this.doPost('GetRfHistory;' + this.$moment(this.dateFrom, 'YYYY-MM-DD').utc().format('YYYY-MM-DD') + ';' + this.$moment(this.dateTo + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss').utc().format('YYYY-MM-DD') + ';' + this.category).then(datalist => {
          this.$route.meta.error = null
          this.history = []
          for (var j = 2; j < (datalist.length - 1); j = j + 7) {
            this.history.push({
              name: datalist[j],
              type: datalist[j + 1],
              code: datalist[j + 2],
              date: this.$moment.utc(datalist[j + 3], 'YYYY-MM-DD HH:mm:ss.SSS').local().format('YYYY-MM-DD HH:mm:ss'),
              pulseLength: datalist[j + 4],
              protocol: datalist[j + 5],
              bitLength: datalist[j + 6]
            })
          }
          this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
        }).catch(err => {
          this.$route.meta.error = err.message
          this.$forceUpdate()
        })
      }
    }
  },
  components: {
    Error,
    RfSniffer
  }
}
</script>

