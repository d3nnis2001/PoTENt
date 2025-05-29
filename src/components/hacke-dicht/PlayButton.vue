<template>
  <button
    @click="$emit('play')"
    :disabled="disabled"
    class="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
  >
    <svg v-if="isProtected" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
    </svg>
    Spielen
  </button>
</template>

<script>
export default {
  name: 'PlayButton',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    isProtected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['play']
}
</script>