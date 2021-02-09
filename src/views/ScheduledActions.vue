<template>
  <div class="Actions">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div class="container" v-else>
      <div class="columns">
        <AdvSA class="column col-8 col-lg-12"/>
        <History class="column col-4 col-lg-12" category="action"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import AdvSA from '@/components/AdvSA.vue'
import History from '@/components/History.vue'

export default {
  name: 'Actions',
  components: {
    Error,
    AdvSA,
    History
  }
}
</script>
