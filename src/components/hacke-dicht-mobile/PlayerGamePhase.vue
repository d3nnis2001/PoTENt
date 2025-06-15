<template>
  <div>
    <!-- Event Phase -->
    <div v-if="gamePhase === 'event'" class="text-center py-12">
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
        <div class="text-6xl mb-4">🎭</div>
        <h2 class="text-2xl font-bold text-white mb-4">Event läuft</h2>
        <div v-if="currentEventQuestion" class="text-white mb-4">
          <p class="text-lg font-medium">{{ currentEventQuestion.question }}</p>
          <p class="text-orange-200 text-sm mt-2">{{ currentEventQuestion.description }}</p>
        </div>
        <p v-else class="text-orange-200 text-lg">Der Moderator zeigt ein Event...</p>
      </div>
      
      <div class="text-orange-200 text-sm">
        Warte auf den Moderator...
      </div>
    </div>

    <!-- Progress Screen Phase -->
    <div v-else-if="gamePhase === 'progress'" class="text-center py-12">
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
        <div class="text-6xl mb-4 animate-pulse">📊</div>
        <h2 class="text-2xl font-bold text-white mb-4">Nächste Frage</h2>
        <div class="text-orange-300 text-xl mb-2">Frage {{ currentQuestionIndex + 1 }}/15</div>
        <p class="text-orange-200">Bereite dich vor...</p>
      </div>
      
      <div class="text-orange-200 text-sm">
        Warte auf den Moderator...
      </div>
    </div>

    <!-- Question Phase -->
    <PlayerQuestionView
      v-else-if="gamePhase === 'reading'"
      :current-question="currentQuestion"
      :current-question-index="currentQuestionIndex"
      :time-remaining="timeRemaining"
      :available-jokers="availableJokers"
      :hidden-answers="hiddenAnswers"
      :selected-answer="selectedAnswer"
      :has-voted="hasVoted"
      :is-submitting="isSubmitting"
      @select-answer="$emit('select-answer', $event)"
      @submit-vote="$emit('submit-vote')"
    />

    <!-- Results Phase -->
    <PlayerResultsView
      v-else-if="gamePhase === 'results'"
      :current-question="currentQuestion"
      :current-reward="currentReward"
      :selected-answer="selectedAnswer"
    />

    <!-- Game Finished -->
    <div v-else-if="gamePhase === 'finished'" class="text-center py-12">
      <div class="text-8xl mb-6 animate-bounce">🎉</div>
      <h2 class="text-3xl font-bold text-white mb-4">Quiz beendet!</h2>
      <p class="text-orange-200 text-lg mb-8">Danke fürs Mitspielen!</p>
      
      <button
        @click="$emit('leave-lobby')"
        class="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
      >
        Lobby verlassen
      </button>
    </div>
  </div>
</template>

<script>
import PlayerQuestionView from './PlayerQuestionView.vue'
import PlayerResultsView from './PlayerResultsView.vue'

export default {
  name: 'PlayerGamePhase',
  components: {
    PlayerQuestionView,
    PlayerResultsView
  },
  props: {
    gamePhase: {
      type: String,
      required: true
    },
    currentEventQuestion: {
      type: Object,
      default: null
    },
    currentQuestionIndex: {
      type: Number,
      required: true
    },
    currentQuestion: {
      type: Object,
      default: null
    },
    currentReward: {
      type: Object,
      default: null
    },
    timeRemaining: {
      type: Number,
      required: true
    },
    availableJokers: {
      type: Object,
      default: () => ({})
    },
    hiddenAnswers: {
      type: Array,
      default: () => []
    },
    selectedAnswer: {
      type: Number,
      default: null
    },
    hasVoted: {
      type: Boolean,
      default: false
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select-answer', 'submit-vote', 'leave-lobby']
}
</script>