<template>
  <div class="Actions">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div v-else>
      <AdvSA/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import AdvSA from '@/components/AdvSA.vue'

export default {
  name: 'Actions',
  components: {
    Error,
    AdvSA
  }
}
</script>
