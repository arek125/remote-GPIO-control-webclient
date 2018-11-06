<template>
  <div class="Sensors">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div class="container" v-else>
      <div class="columns">
        <SensorList class="column" v-bind:class="{ 'col-4': selectedIds.length, 'col-12': !selectedIds.length }" v-bind:col="whatCol()" v-on:selectionChange="selectedSensorsChange($event)"/>
        <SensorsHistory class="column col-8" v-if="selectedIds.length" v-bind:sensorsIds="selectedIds"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import SensorList from '@/components/SensorList.vue'
import SensorsHistory from '@/components/SensorHistory.vue'

export default {
  name: 'Sensors',
  components: {
    Error,
    SensorList,
    SensorsHistory
  },
  data () {
    return {
      selectedIds: []
    }
  },
  methods: {
    selectedSensorsChange (selectedIds) {
      this.selectedIds = selectedIds
    },
    whatCol () {
      if (this.selectedIds.length) { return 'col-12' } else { return 'col-4' }
    }
  }
}
</script>
