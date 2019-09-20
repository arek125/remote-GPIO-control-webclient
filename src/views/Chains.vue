<template>
  <div class="Chains">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div class="container" v-else>
      <div class="columns">
        <Chain class="column col-8 col-md-12"/>
        <History class="column col-4 col-md-12" category="chain"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import Chain from '@/components/Chain.vue'
import History from '@/components/History.vue'

export default {
  name: 'Chains',
  components: {
    Error,
    Chain,
    History
  }
}
</script>
