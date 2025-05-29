<template>
  <div class="text-center p-6 bg-black/20 rounded-lg mb-8">
    <p class="text-white text-2xl leading-relaxed font-medium">{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: 'EventContent',
  props: {
    text: {
      type: String,
      required: true
    }
  }
}
</script>