<template>
  <div class="PWM's">
    <Error v-if="$route.meta.error !== null" v-on:close-err="$route.meta.error = null;$forceUpdate()" v-bind:error-message="$route.meta.error"/>
    <div class="container" v-else>
      <div class="columns">
        <GPIO_Pwm class="column col-8 col-md-12" col="col-4 col-xl-6 col-md-12"/>
        <History class="column col-4 hide-md" category="pwm"/>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Error from '@/components/Error.vue'
import GPIO_Pwm from '@/components/GPIO_Pwm.vue'
import History from '@/components/History.vue'

export default {
  name: 'PWMs',
  components: {
    Error,
    GPIO_Pwm,
    History
  }
}
</script>
