<template>
  <div class="Variables">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div class="container" v-else>
        <div class="columns">
            <LinkedPis class="column col-6 col-lg-12"/>
            <GlobalVariables class="column col-6 col-lg-12"/>
        </div>
    </div>
</div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import LinkedPis from '@/components/LinkedPis.vue'
import GlobalVariables from '@/components/GlobalVariables.vue'

export default {
  name: 'Vars',
  components: {
    Error,
    LinkedPis,
    GlobalVariables
  }
}
</script>