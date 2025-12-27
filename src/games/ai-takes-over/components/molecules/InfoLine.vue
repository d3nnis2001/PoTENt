<template>
  <div class="ai-info-line">
    <span class="ai-info-label">{{ label }}</span>
    <span class="ai-info-value">
      <slot />
    </span>
  </div>
</template>

<script>
export default {
  name: 'InfoLine',
  props: {
    label: {
      type: String,
      required: true
    }
  }
}
</script>
