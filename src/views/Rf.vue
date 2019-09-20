<template>
  <div class="RF">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div class="container" v-else>
      <div class="columns">
        <RfCodes class="column col-6 col-md-12"/>
        <RfHistory class="column col-6 col-md-12"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import RfCodes from '@/components/RfCodes.vue'
import RfHistory from '@/components/RfHistory.vue'

export default {
  name: 'Rfs',
  components: {
    Error,
    RfCodes,
    RfHistory
  }
}
</script>
