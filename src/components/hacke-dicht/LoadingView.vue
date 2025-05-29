<template>
  <div class="text-center py-8">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    <p class="text-white mt-2">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingView',
  props: {
    message: {
      type: String,
      default: 'Lädt...'
    }
  }
}
</script>