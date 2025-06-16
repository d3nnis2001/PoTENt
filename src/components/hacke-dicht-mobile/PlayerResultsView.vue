<template>
  <div class="text-center">
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
      <h2 class="text-xl font-bold text-white mb-4">Auflösung</h2>
      
      <div class="mb-4">
        <div class="text-green-400 text-lg font-bold mb-2">
          Richtige Antwort: {{ String.fromCharCode(65 + currentQuestion.correctAnswer) }}
        </div>
        <div :class="[
          'text-lg font-medium',
          selectedAnswer === currentQuestion.correctAnswer ? 'text-green-400' : 'text-red-400'
        ]">
          {{ selectedAnswer === currentQuestion.correctAnswer ? '🎉 Richtig!' : '❌ Falsch!' }}
        </div>
        
        <!-- Debug Info -->
        <div class="text-xs text-gray-400 mt-2">
          Debug: Selected={{ selectedAnswer }}, Correct={{ currentQuestion.correctAnswer }}
        </div>
      </div>

      <div v-if="selectedAnswer !== currentQuestion.correctAnswer" class="text-orange-200 text-sm">
        Du trinkst: {{ currentReward?.name }}! 🍻
      </div>
    </div>
    
    <div class="text-orange-200 text-sm">
      Warte auf den Moderator...
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerResultsView',
  props: {
    currentQuestion: {
      type: Object,
      required: true
    },
    currentReward: {
      type: Object,
      default: null
    },
    selectedAnswer: {
      type: Number,
      required: true
    }
  }
}
</script>