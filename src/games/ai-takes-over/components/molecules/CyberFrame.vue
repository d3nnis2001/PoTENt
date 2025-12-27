<template>
  <div class="ai-card" :class="{ 'with-padding': padding }">
    <div v-if="scanlines" class="ai-scanlines" />

    <template v-if="corners">
      <div class="ai-corner ai-corner-tl" />
      <div class="ai-corner ai-corner-tr" />
      <div class="ai-corner ai-corner-bl" />
      <div class="ai-corner ai-corner-br" />
    </template>

    <div class="ai-card-content" :style="{ padding: padding ? '24px' : '0' }">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CyberFrame',
  props: {
    scanlines: {
      type: Boolean,
      default: true
    },
    corners: {
      type: Boolean,
      default: false
    },
    padding: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.ai-card-content {
  position: relative;
  z-index: 10;
}
</style>
