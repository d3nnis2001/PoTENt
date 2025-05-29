<template>
  <div class="h-[80vh] flex items-center justify-center">
    <div class="flex items-center gap-8 w-full max-w-6xl">
      <!-- Drinks Column (Left Side) -->
      <DrinksColumn :rewards="game.rewards" />

      <!-- Question Ladder (Right Side) -->
      <QuestionLadder 
        :current-question-index="currentQuestionIndex"
        :rewards="game.rewards"
      />
    </div>

    <!-- Continue Button -->
    <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2">
      <button
        @click="$emit('continue')"
        class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-lg font-bold text-xl hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-2xl"
      >
        {{ currentQuestionIndex === 0 ? 'Spiel starten' : 'Weiter zur nächsten Frage' }}
      </button>
    </div>
  </div>
</template>

<script>
import DrinksColumn from './DrinksColumn.vue'
import QuestionLadder from './QuestionLadder.vue'

export default {
  name: 'ProgressScreen',
  components: {
    DrinksColumn,
    QuestionLadder
  },
  props: {
    game: {
      type: Object,
      required: true
    },
    currentQuestionIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['continue']
}
</script>