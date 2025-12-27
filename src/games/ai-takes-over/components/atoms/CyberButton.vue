<template>
  <button
    class="ai-btn"
    :class="{ 'loading': loading }"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span class="ai-btn-content" style="position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 12px;">
      <LoadingSpinner v-if="loading" />
      <slot v-else />
    </span>
  </button>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'CyberButton',
  components: { LoadingSpinner },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>
