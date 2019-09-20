<template>
  <div class="Actions">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div class="container" v-else>
      <div class="columns">
        <AdvSA class="column col-9 col-lg-12"/>
        <LinkedPis class="column col-3 col-lg-12" />
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import AdvSA from '@/components/AdvSA.vue'
import LinkedPis from '@/components/LinkedPis.vue'

export default {
  name: 'Actions',
  components: {
    Error,
    AdvSA,
    LinkedPis
  }
}
</script>
