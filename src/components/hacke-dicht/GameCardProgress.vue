<template>
  <div class="w-full bg-white/20 rounded-full h-2 mb-4">
    <div 
      class="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full transition-all duration-300"
      :style="{ width: `${progress}%` }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'GameCardProgress',
  props: {
    progress: {
      type: Number,
      required: true
    }
  }
}
</script>