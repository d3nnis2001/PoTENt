<template>
  <div class="flex justify-between items-center mb-4">
    <h4 class="text-lg font-bold text-white flex items-center gap-2">
      <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      Ereignisfrage nach Frage {{ questionIndex }}
    </h4>
    <button
      @click="$emit('remove')"
      type="button"
      class="text-red-400 hover:text-red-300"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'EventQuestionHeader',
  props: {
    questionIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['remove']
}
</script>