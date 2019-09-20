<template>
  <div class="outputs">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div class="container" v-else>
      <div class="columns">
        <GPIO_Output class="column col-8 col-md-12"/>
        <History class="column col-4 col-md-12" category="i/o"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import GPIO_Output from '@/components/GPIO_Output.vue'
import History from '@/components/History.vue'

export default {
  name: 'outputs',
  components: {
    Error,
    GPIO_Output,
    History
  }
}
</script>
