<template>
    <div>
        <table class="table table-striped logs" v-if="logs.length">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Code</th>
                    <th>Pulse length</th>
                    <th>Protocol</th>
                    <th>Bit length</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(log,index) in logs" :key="index">
                    <td>{{log.time}}</td>
                    <td>{{log.code}}</td>
                    <td>{{log.pulseLength}}</td>
                    <td>{{log.protocol}}</td>
                    <td>{{log.bitLength}}</td>
                </tr>
            </tbody>
        </table>
        <div v-else class="empty centered">
            <div class="empty-icon">
                <i class="icon icon-4x icon-cross"></i>
            </div>
            <p class="empty-title h5">Nothing here...</p>
        </div>
    </div>

</template>

<script>

export default {
  name: 'RfSniffer',
  data () {
    return {
      logs: [],
      refreshInterval: '',
      loading: false
    }
  },
  created () {
    this.getData()
    this.refreshInterval = setInterval(() => {
      if (!this.loading) this.getData()
    }, (1000))
  },
  beforeDestroy () {
    clearInterval(this.refreshInterval)
  },
  methods: {
    getData () {
      this.loading = true
      this.doQPost('SniffRfCodes').then(datalist => {
        this.logs = []
        for (let i = 2; i < datalist.length; i += 5) {
          this.logs.push({
            code: datalist[i],
            pulseLength: datalist[i + 1],
            protocol: datalist[i + 2],
            bitLength: datalist[i + 3],
            time: this.$moment.utc(datalist[i + 4], 'YYYY-MM-DD HH:mm:ss.SSS').local().format('HH:mm:ss')
          })
        }
      }).finally(() => {
        this.loading = false
      }).catch(err => {
        this.$route.meta.error = err.message
        this.$forceUpdate()
      })
    }
  }
}
</script>

