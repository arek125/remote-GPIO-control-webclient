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
                </div>
            </div>
            <div class="panel-body">
                <table class="table table-striped" v-if="history.length">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Action</th>
                            <th>By</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(hEl) in history" :key="hEl.id">
                            <td>{{hEl.date}}</td>
                            <td>{{hEl.name}}</td>
                            <td>{{hEl.state}}</td>
                            <td>{{hEl.by}}</td>
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

export default {
  name: 'History',
  data () {
    return {
      history: [],
      refreshInterval: '',
      updateDate: '',
      autoRefreshTime: 5,
      dateFrom: '',
      dateTo: ''
    }
  },
  props: ['category'],
  created () {
    this.dateFrom = this.$moment().subtract(7, 'days').format('YYYY-MM-DD')
    this.dateTo = this.$moment().add(1, 'days').format('YYYY-MM-DD')
    this.getHistory()
    if (this.$cookies.isKey('hr_arTime')) { this.autoRefreshTime = parseInt(this.$cookies.get('hr_arTime')) }
    this.autoRefresh()
  },
  beforeDestroy () {
    clearTimeout(this.refreshInterval)
  },
  methods: {
    autoRefresh () {
      this.$cookies.set('hr_arTime', this.autoRefreshTime, -1)
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
        this.doPost('HR_selByCat;' + this.$moment(this.dateFrom, 'YYYY-MM-DD').utc().format('YYYY-MM-DD') + ';' + this.$moment(this.dateTo + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss').utc().format('YYYY-MM-DD') + ';' + this.category).then(datalist => {
          this.$route.meta.error = null
          this.history = []
          for (var j = 2; j < (datalist.length - 1); j = j + 5) {
            this.history.push({
              id: parseInt(datalist[j]),
              date: this.$moment.utc(datalist[j + 1], 'YYYY-MM-DD HH:mm:ss').local().format('YYYY-MM-DD HH:mm:ss'),
              by: datalist[j + 2],
              name: datalist[j + 3],
              state: datalist[j + 4]

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
    Error
  }
}
</script>

