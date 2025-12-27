<template>
  <button
    v-if="gamePhase === 'reading'"
    @click="$emit('show-answer')"
    class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors"
  >
    Bereit - Antwort zeigen
  </button>
  <button
    v-else-if="gamePhase === 'showing_answer'"
    @click="$emit('next-question')"
    class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors"
  >
    {{ isLastQuestion ? 'Quiz beenden' : 'Weiter' }}
  </button>
</template>

<script>
export default {
  name: 'ActionButton',
  props: {
    gamePhase: {
      type: String,
      required: true
    },
    isLastQuestion: {
      type: Boolean,
      required: true
    }
  },
  emits: ['show-answer', 'next-question']
}
</script>