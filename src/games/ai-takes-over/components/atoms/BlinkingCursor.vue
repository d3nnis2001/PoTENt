<template>
  <span class="ai-cursor">{{ char }}</span>
</template>

<script>
export default {
  name: 'BlinkingCursor',
  props: {
    char: {
      type: String,
      default: '_'
    }
  }
}
</script>
