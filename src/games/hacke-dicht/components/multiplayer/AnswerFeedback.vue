<template>
  <div class="text-center mt-6">
    <!-- Host View -->
    <div v-if="isHost">
      <div class="text-green-400 text-2xl font-bold mb-2">
        ✅ Die richtige Antwort ist {{ String.fromCharCode(65 + correctAnswer) }}!
      </div>
      <div class="text-orange-200 text-lg">
        {{ wrongPlayerCount }} Spieler trinken: {{ currentReward?.name }}! 🍻
      </div>
    </div>
    
    <!-- Player View -->
    <div v-else>
      <div class="text-green-400 text-xl font-bold mb-2">
        Richtige Antwort: {{ String.fromCharCode(65 + correctAnswer) }}
      </div>
      <div :class="[
        'text-lg font-medium mb-2',
        selectedAnswer === correctAnswer ? 'text-green-400' : 'text-red-400'
      ]">
        {{ selectedAnswer === correctAnswer ? '🎉 Richtig!' : '❌ Falsch!' }}
      </div>
      <div v-if="selectedAnswer !== correctAnswer" class="text-orange-200 text-sm">
        Du trinkst: {{ currentReward?.name }}! 🍻
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnswerFeedback',
  props: {
    correctAnswer: {
      type: Number,
      required: true
    },
    currentReward: {
      type: Object,
      required: true
    },
    isHost: {
      type: Boolean,
      required: true
    },
    wrongPlayerCount: {
      type: Number,
      default: 0
    },
    selectedAnswer: {
      type: Number,
      default: null
    }
  }
}
</script>