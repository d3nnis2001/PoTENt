<template>
  <span class="ai-status-badge" :class="{ connected: isConnected }">
    <span class="ai-status-dot ai-pulse-dot" />
    <slot />
  </span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    isConnected: {
      type: Boolean,
      default: false
    }
  }
}
</script>
