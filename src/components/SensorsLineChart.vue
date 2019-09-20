<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['data', 'options'],
  mounted () {
    // let dateLabels = []
    // let datasets = []
    // for(var i in this.sensorsHistory){
    //     console.log(this.sensorsHistory[i])
    //     dateLabels.push(this.$moment.utc(this.sensorsHistory[i].dateutc, "YYYY-MM-DD HH:mm:ss").local().doDate())
    //     let index = datasets.findIndex(el => el.id==this.sensorsHistory[i].id);
    //     if(index == -1)index = datasets.push({
    //       id: this.sensorsHistory[i].id,
    //       label: this.sensorsHistory[i].name,
    //       data: []
    //     })-1
    //     datasets[index].data.push(this.sensorsHistory[i].value)

    // }
    this.renderChart(this.chartData, this.options)
  }
}
</script>
