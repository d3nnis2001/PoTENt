<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click="$emit('close')">
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 w-full max-w-2xl border border-white/20" @click.stop>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close']
}
</script>