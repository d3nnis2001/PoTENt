<template>
  <div class="ai-message-box" :class="variant">
    <span v-if="icon" class="ai-message-icon">{{ icon }}</span>
    <span class="ai-message-text">
      <slot />
    </span>
    <BlinkingCursor v-if="showCursor" />
  </div>
</template>

<script>
import BlinkingCursor from '@/games/ai-takes-over/components/atoms/BlinkingCursor.vue'

export default {
  name: 'MessageBox',
  components: { BlinkingCursor },
  props: {
    icon: {
      type: String,
      default: '>'
    },
    variant: {
      type: String,
      default: '',
      validator: (value) => ['', 'error', 'success', 'warning'].includes(value)
    },
    showCursor: {
      type: Boolean,
      default: false
    }
  }
}
</script>
