<template>
  <div class="space-y-6">
    <!-- Question Header -->
    <div class="text-center">
      <h2 class="text-xl font-bold text-white mb-2">Frage {{ currentQuestionIndex + 1 }}/15</h2>
    </div>

    <!-- Jokers Display (mobile-optimiert) -->
    <div v-if="hasAvailableJokers" class="mb-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <h4 class="text-white font-bold mb-3 text-center text-sm">🃏 Verfügbare Joker</h4>
        <div class="flex justify-center gap-3">
          <!-- 50/50 Joker -->
          <div class="relative flex flex-col items-center">
            <div :class="[
              'p-2 rounded-lg border-2 transition-all',
              availableJokers.fiftyFifty?.used 
                ? 'bg-gray-600/30 border-gray-400/30 opacity-50' 
                : 'bg-blue-600/30 border-blue-400/50'
            ]">
              <img :src="joker50" alt="50/50 Joker" class="w-10 h-10" />
              <!-- Durchstrich wenn benutzt -->
              <div v-if="availableJokers.fiftyFifty?.used" class="absolute inset-0 flex items-center justify-center">
                <div class="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                <div class="absolute w-full h-0.5 bg-red-500 transform -rotate-45"></div>
              </div>
            </div>
            <span class="text-xs text-white text-center mt-1">50/50</span>
          </div>

          <!-- Random Person Joker -->
          <div class="relative flex flex-col items-center">
            <div :class="[
              'p-2 rounded-lg border-2 transition-all',
              availableJokers.randomPerson?.used 
                ? 'bg-gray-600/30 border-gray-400/30 opacity-50' 
                : 'bg-purple-600/30 border-purple-400/50'
            ]">
              <img :src="jokerrandom" alt="Random Person Joker" class="w-10 h-10" />
              <!-- Durchstrich wenn benutzt -->
              <div v-if="availableJokers.randomPerson?.used" class="absolute inset-0 flex items-center justify-center">
                <div class="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                <div class="absolute w-full h-0.5 bg-red-500 transform -rotate-45"></div>
              </div>
            </div>
            <span class="text-xs text-white text-center mt-1">Person</span>
          </div>

          <!-- Reveal Joker -->
          <div class="relative flex flex-col items-center">
            <div :class="[
              'p-2 rounded-lg border-2 transition-all',
              availableJokers.reveal?.used 
                ? 'bg-gray-600/30 border-gray-400/30 opacity-50' 
                : 'bg-green-600/30 border-green-400/50'
            ]">
              <img :src="jokerreveal" alt="Reveal Joker" class="w-10 h-10" />
              <!-- Durchstrich wenn benutzt -->
              <div v-if="availableJokers.reveal?.used" class="absolute inset-0 flex items-center justify-center">
                <div class="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                <div class="absolute w-full h-0.5 bg-red-500 transform -rotate-45"></div>
              </div>
            </div>
            <span class="text-xs text-white text-center mt-1">Aufdecken</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Question Text -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <p class="text-white text-lg leading-relaxed text-center">
        {{ currentQuestion.question }}
      </p>
    </div>

    <!-- Answer Buttons -->
    <div class="space-y-3">
      <button
        v-for="(answer, index) in currentQuestion.answers"
        :key="index"
        @click="selectAnswer(index)"
        :disabled="hasVoted || isHidden(index)"
        :class="[
          'w-full p-4 rounded-lg text-left transition-all flex items-center gap-3',
          getAnswerButtonClass(index)
        ]"
      >
        <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">
          {{ String.fromCharCode(65 + index) }}
        </span>
        <span class="flex-1">{{ answer.text }}</span>
        <div v-if="selectedAnswer === index && !hasVoted" class="text-blue-300 text-xl">
          ✓
        </div>
      </button>
    </div>

    <!-- Submit Button -->
    <div v-if="selectedAnswer !== null && !hasVoted" class="text-center">
      <button
        @click="$emit('submit-vote')"
        :disabled="isSubmitting"
        class="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all"
      >
        {{ isSubmitting ? 'Wird gesendet...' : 'Antwort bestätigen' }}
      </button>
    </div>

    <!-- Vote Confirmed - Kompakte Version -->
    <div v-else-if="hasVoted" class="text-center">
      <div class="bg-green-600/20 backdrop-blur-lg rounded-lg p-4 border border-green-400/30">
        <div class="flex items-center justify-center gap-3 mb-2">
          <div class="text-2xl animate-pulse">✓</div>
          <div>
            <h3 class="text-lg font-bold text-white">Antwort bestätigt</h3>
            <p class="text-green-200 text-sm">Antwort {{ String.fromCharCode(65 + selectedAnswer) }} gewählt</p>
          </div>
        </div>
        <p class="text-green-200/80 text-xs">Warten auf andere Spieler...</p>
      </div>
    </div>

    <!-- Instructions -->
    <div v-else class="text-center text-orange-200 text-sm">
      {{ selectedAnswer !== null ? 'Du kannst deine Auswahl bis zur Bestätigung ändern' : 'Wähle deine Antwort' }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import joker50 from '../../assets/5050.png'
import jokerrandom from '../../assets/RandomPerson.png'
import jokerreveal from '../../assets/RevealJoker.png'

export default {
  name: 'PlayerQuestionView',
  props: {
    currentQuestion: {
      type: Object,
      required: true
    },
    currentQuestionIndex: {
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
  emits: ['select-answer', 'submit-vote'],
  setup(props, { emit }) {
    const hasAvailableJokers = computed(() => {
      if (!props.availableJokers || Object.keys(props.availableJokers).length === 0) {
        console.log('🃏 PlayerQuestionView: Keine Joker verfügbar')
        return false
      }
      
      // Prüfe ob mindestens ein Joker noch nicht verwendet wurde
      const hasUnused = Object.values(props.availableJokers).some(joker => !joker.used)
      console.log('🃏 PlayerQuestionView availableJokers:', props.availableJokers)
      console.log('🃏 PlayerQuestionView hasUnused:', hasUnused)
      return hasUnused
    })
    
    const selectAnswer = (answerIndex) => {
      if (props.hasVoted || isHidden(answerIndex)) return
      emit('select-answer', answerIndex)
    }
    
    const isHidden = (answerIndex) => {
      return props.hiddenAnswers.includes(answerIndex)
    }
    
    const getAnswerButtonClass = (index) => {
      if (isHidden(index)) {
        return 'bg-white/5 text-white/30 border-2 border-white/10 opacity-30 cursor-not-allowed'
      }
      
      if (props.selectedAnswer === index && !props.hasVoted) {
        return 'bg-blue-600/50 text-white border-2 border-blue-400 shadow-lg'
      }
      
      if (props.hasVoted) {
        return 'bg-white/10 text-white/50 border-2 border-white/20 cursor-not-allowed'
      }
      
      return 'bg-white/20 text-white border-2 border-white/30 hover:border-orange-400/50 hover:bg-white/30 cursor-pointer'
    }
    
    return {
      hasAvailableJokers,
      selectAnswer,
      isHidden,
      getAnswerButtonClass,
      joker50,
      jokerrandom,
      jokerreveal
    }
  }
}
</script>