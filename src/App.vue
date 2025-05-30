<template>
  <div class="min-h-screen">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script>
import ToastContainer from './components/ToastContainer.vue'

export default {
  name: 'App',
  components: {
    ToastContainer
  }
}
</script>