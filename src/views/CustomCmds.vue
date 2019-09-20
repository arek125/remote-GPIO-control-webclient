<template>
  <div class="customcmds">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div class="container" v-else>
      <div class="columns">
        <CustomCmds class="column col-8 col-md-12"/>
        <History class="column col-4 col-md-12" category="cmd"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import CustomCmds from '@/components/CustomCmds.vue'
import History from '@/components/History.vue'

export default {
  name: 'customcmds',
  components: {
    Error,
    CustomCmds,
    History
  }
}
</script>
