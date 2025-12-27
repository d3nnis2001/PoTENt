<template>
  <div class="ai-terminal">
    <div v-if="showHeader" class="ai-terminal-header">
      <span v-if="showDots" class="ai-terminal-dots">
        <span class="dot red" />
        <span class="dot yellow" />
        <span class="dot green" />
      </span>
      <slot name="header">
        <span v-if="title" class="ai-terminal-title">{{ title }}</span>
      </slot>
    </div>
    <div class="ai-terminal-body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TerminalBox',
  props: {
    title: {
      type: String,
      default: ''
    },
    showDots: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    }
  }
}
</script>
