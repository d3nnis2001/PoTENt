<template>
  <button
    @click="$emit('save')"
    :disabled="!isGameValid || isSaving"
    class="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
  >
    <svg v-if="isSaving" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>
    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
    </svg>
    {{ isSaving ? 'Speichere...' : 'Spiel speichern' }}
  </button>
</template>

<script>
export default {
  name: 'SaveButton',
  props: {
    isGameValid: {
      type: Boolean,
      required: true
    },
    isSaving: {
      type: Boolean,
      required: true
    }
  },
  emits: ['save']
}
</script>