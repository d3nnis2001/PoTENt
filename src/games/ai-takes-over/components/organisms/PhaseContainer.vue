<template>
  <transition
    :name="transitionName"
    mode="out-in"
    @after-leave="$emit('phase-exit', phase)"
    @after-enter="$emit('phase-enter', phase)"
  >
    <slot />
  </transition>
</template>

<script>
export default {
  name: 'PhaseContainer',
  props: {
    phase: {
      type: String,
      required: true
    },
    transitionName: {
      type: String,
      default: 'fade'
    }
  },
  emits: ['phase-exit', 'phase-enter']
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--ai-transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
