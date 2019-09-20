<template>
    <div>
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><h3>Selected sensors history</h3></div>
                <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
            </div>
            <div class="panel-nav">
                <div class="btn-group btn-group-block float-right">
                    <!-- <button class="btn" v-on:click="getInputs()"><i class="icon icon-refresh centered"></i></button> -->
                </div>
            </div>
            <div class="panel-body">
                <LineChart v-if="datasets.length" :chart-data="chartData" :options="chartOptions"/>
                <table class="table table-striped" v-if="sensorsHistory.length">
                    <thead>
                        <tr>
                            <th>Sensor name</th>
                            <th>Date</th>
                            <th>Value</th>
                            <th>Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(sensor,index) in sensorsHistory" :key="index">
                            <td>{{sensor.name}}</td>
                            <td>{{sensor.datelocal}}</td>
                            <td>{{sensor.value}}</td>
                            <td>{{sensor.unit}}</td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="empty centered">
                    <div class="empty-icon">
                        <i class="icon icon-4x icon-cross"></i>
                    </div>
                    <p class="empty-title h5">There are is no data for selected sensors</p>
                </div>
            </div>
            <div class="panel-footer">
                <span class="text-secondary">Last update: {{ updateDate }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import Error from '@/components/Error.vue'
import LineChart from '@/components/SensorsLineChart.vue'

export default {
  name: 'SensorsHistory',
  data () {
    return {
      updateDate: '',
      sensorsHistory: [],
      dateLabels: [],
      datasets: [],
      chartData: {},
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Selected sensors history data'
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                second: 'H:mm:ss',
                minute: 'H:mm',
                hour: 'H:mm'
              },
              tooltipFormat: 'YYYY-MM-DD HH:mm:ss'
            },
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Date/Time'
            },
            ticks: {
              major: {
                fontStyle: 'bold',
                fontColor: '#FF0000'
              }
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Value'
            }
          }]
        }
      }
    }
  },
  props: {
    sensorsIds: {
      type: Array
    }
  },
  created () {},
  beforeDestroy () {},
  methods: {
    dynamicColors () {
      var r = Math.floor(Math.random() * 255)
      var g = Math.floor(Math.random() * 255)
      var b = Math.floor(Math.random() * 255)
      return 'rgb(' + r + ',' + g + ',' + b + ')'
    }
  },
  watch: {
    sensorsIds: {
      handler: function (newVal, oldVal) {
        let idArray = ''
        for (let i = 0; i < newVal.length; i++) {
          idArray += "'" + newVal[i] + "'"
          if (i < (newVal.length - 1)) { idArray += ',' }
        }
        this.sensorsHistory = []
        // console.log("SENSORS_history;"+idArray)
        this.doPost('SENSORS_history;' + idArray).then(datalist => {
          for (var j = 2; j < (datalist.length - 1); j += 5) {
            this.sensorsHistory.push({
              id: datalist[j],
              name: datalist[j + 1],
              unit: datalist[j + 2],
              dateutc: datalist[j + 3],
              datelocal: this.$moment.utc(datalist[j + 3], 'YYYY-MM-DD HH:mm:ss').local().format('YYYY-MM-DD HH:mm:ss'),
              value: parseFloat(datalist[j + 4])
            })
          }
          this.datasets = []
          for (var i in this.sensorsHistory) {
            // this.dateLabels.push(this.$moment.utc(this.sensorsHistory[i].dateutc, "YYYY-MM-DD HH:mm:ss").local().toDate())
            let index = this.datasets.findIndex(el => el.id == this.sensorsHistory[i].id)
            let color = this.dynamicColors()
            if (index == -1) {
              index = this.datasets.push({
                id: this.sensorsHistory[i].id,
                label: this.sensorsHistory[i].name,
                fill: false,
                borderColor: color,
                backgroundColor: color,
                data: []
              }) - 1
            }
            this.datasets[index].data.push({
              x: this.$moment.utc(this.sensorsHistory[i].dateutc, 'YYYY-MM-DD HH:mm:ss').local().toDate(),
              y: this.sensorsHistory[i].value
            })
          }
          this.chartData = {
            // labels: this.dateLabels,
            datasets: this.datasets
          }
          this.updateDate = this.$moment().format('YYYY-MM-DD HH:mm:ss.SSS')
        }).catch(err => {
          this.$route.meta.error = err.message
          this.$forceUpdate()
        })
      },
      immediate: true
    }
  },
  components: {
    Error,
    LineChart
  }
}
</script>
