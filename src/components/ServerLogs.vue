<template>
    <div>
        <table class="table table-striped logs" v-if="logs.length">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Message</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(log,index) in logs" :key="index">
                    <td>{{log.time}}</td>
                    <td>{{log.priority}}</td>
                    <td>{{log.message}}</td>
                </tr>
            </tbody>
        </table>
        <div v-else class="empty centered">
            <div class="empty-icon">
                <i class="icon icon-4x icon-cross"></i>
            </div>
            <p class="empty-title h5">There are is no logs</p>
        </div>
    </div>

</template>

<script>

export default {
  name: 'ServerInfo',
  data () {
    return {
      logs: [],
      jsonD: ''
    }
  },
  created () {
    this.getData()
  },
  methods: {
    priorityParse (prio) {
      switch (prio) {
        case 0:
          return 'emerg'
        case 1:
          return 'alert'
        case 2:
          return 'crit'
        case 3:
          return 'error'
        case 4:
          return 'warning'
        case 5:
          return 'notice'
        case 6:
          return 'info'
        case 7:
          return 'debug'
      }
    },
    getData () {
      this.doPost('Server_logs_JSON').then(datalist => {
        this.logs = []
        for (let i = 2; i < datalist.length; i += 3) {
          this.logs.push({
            time: this.$moment(parseInt(datalist[i]) / 1000).format('YYYY-MM-DD HH:mm:ss'),
            priority: this.priorityParse(parseInt(datalist[i + 1])),
            message: datalist[i + 2]
          })
        }
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    }
  }
}
</script>

