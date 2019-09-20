<template>
  <div class="toast toast-error">
    <button v-on:click="$emit('close-err')" class="btn btn-clear float-right"></button>
    <span v-if="errorMessage !== '' && errorMessage !== null">
      {{ errorMessage }}
    </span>
    <ul v-if="errorArray.length && errorArray !== null">
      <li v-for="(error, index) in errorArray" :key="index">{{ error }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Error',
  props: {
    errorMessage: {
      type: String,
      required: false
    },
    errorArray: {
      default: () => [],
      type: Array,
      required: false
    }
  }
}
</script>

