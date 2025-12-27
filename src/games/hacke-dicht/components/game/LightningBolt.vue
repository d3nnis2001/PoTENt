<template>
  <svg :class="classes" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
  </svg>
</template>

<script>
export default {
  name: 'LightningBolt',
  props: {
    classes: {
      type: String,
      default: ''
    }
  }
}
</script>