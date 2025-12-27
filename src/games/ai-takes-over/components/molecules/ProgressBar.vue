<template>
  <div class="ai-progress-container">
    <div class="ai-progress-bar" :style="{ width: `${progress}%` }" />
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    progress: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 100
    }
  }
}
</script>
