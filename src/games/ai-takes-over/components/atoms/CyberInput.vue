<template>
  <div class="cyber-input-wrapper">
    <span v-if="prompt" class="ai-terminal-prompt">{{ prompt }}</span>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="ai-terminal-input"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
export default {
  name: 'CyberInput',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    prompt: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.cyber-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
