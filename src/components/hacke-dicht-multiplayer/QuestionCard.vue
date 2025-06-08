<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 shadow-2xl border border-white/20">
      <p class="text-white text-2xl leading-relaxed text-center mb-8">
        {{ question.question }}
      </p>

      <!-- Answer Options mit integrierten Vote-Displays -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <!-- Host View -->
        <div
          v-if="isHost"
          v-for="(answer, index) in question.answers"
          :key="`host-${index}`"
          :class="[
            'p-4 rounded-lg font-medium text-left flex items-center gap-3 min-h-[60px] transition-all duration-500 relative',
            getHostAnswerClasses(index)
          ]"
        >
          <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">
            {{ String.fromCharCode(65 + index) }}
          </span>
          <span class="flex-1">{{ answer.text }}</span>
          
          <!-- Vote Display direkt in der Antwort -->
          <div v-if="showVotes" class="flex flex-col items-end min-w-[80px]">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg font-bold">{{ voteStats.answerCounts[index] || 0 }}</span>
              <span class="text-sm opacity-75">({{ voteStats.percentages[index] || 0 }}%)</span>
            </div>
            <!-- Mini Progress Bar -->
            <div class="w-16 bg-black/20 rounded-full h-2">
              <div 
                class="bg-white h-2 rounded-full transition-all duration-1000"
                :style="{ width: `${voteStats.percentages[index] || 0}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Player View -->
        <button
          v-else
          v-for="(answer, index) in question.answers"
          :key="`player-${index}`"
          @click="$emit('select-answer', index)"
          :disabled="hasVotedFinal || isDisconnected || timeRemaining <= 0"
          :class="[
            'p-4 rounded-lg font-medium text-left transition-all flex items-center gap-3 min-h-[60px]',
            getPlayerAnswerClasses(index)
          ]"
        >
          <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">
            {{ String.fromCharCode(65 + index) }}
          </span>
          <span class="flex-1">{{ answer.text }}</span>
          <div v-if="selectedAnswer === index" class="text-blue-300 text-xl">
            ✓
          </div>
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="text-center">
        <!-- Host Actions -->
        <div v-if="isHost" class="space-y-4">
          <!-- Voting Progress Display -->
          <div v-if="gamePhase === 'reading'" class="bg-white/10 rounded-lg p-4">
            <div class="flex items-center justify-center gap-4 text-white">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                <span>{{ votedPlayerCount }}/{{ realPlayerCount }} abgestimmt</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span v-if="timeRemaining > 0">{{ timeRemaining }}s</span>
                <span v-else class="text-red-300">Zeit abgelaufen!</span>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-white/20 rounded-full h-2 mt-3">
              <div 
                class="bg-green-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${(votedPlayerCount / Math.max(realPlayerCount, 1)) * 100}%` }"
              ></div>
            </div>
          </div>
          
          <button
            v-if="gamePhase === 'reading'"
            @click="$emit('show-answer')"
            :disabled="!canShowAnswer"
            class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {{ getShowAnswerButtonText }}
          </button>
          
          <button
            v-else-if="gamePhase === 'showing_answer'"
            @click="$emit('next-question')"
            :disabled="isDisconnected"
            class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {{ isLastQuestion ? 'Quiz beenden' : 'Nächste Frage' }}
          </button>
        </div>

        <!-- Player Actions -->
        <div v-else-if="!isHost">
          <!-- Submit Button for Players -->
          <button
            v-if="selectedAnswer !== null && !hasVotedFinal && gamePhase === 'reading'"
            @click="$emit('submit-final-vote')"
            :disabled="submittingVote || isDisconnected"
            class="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-lg font-bold text-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all"
          >
            {{ submittingVote ? 'Wird gesendet...' : 'Antwort bestätigen' }}
          </button>
          
          <!-- Waiting State -->
          <div v-else-if="hasVotedFinal" class="text-center py-4">
            <div class="text-6xl mb-4 animate-bounce">✓</div>
            <h3 class="text-xl font-bold text-white mb-2">Antwort bestätigt!</h3>
            <p class="text-orange-200 mb-4">Warte auf andere Spieler...</p>
            
            <!-- Vote Progress -->
            <div class="bg-white/10 rounded-full h-2 mb-2 max-w-md mx-auto">
              <div 
                class="bg-green-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${(votedPlayerCount / realPlayerCount) * 100}%` }"
              ></div>
            </div>
            <div class="text-sm text-white/70">
              {{ votedPlayerCount }}/{{ realPlayerCount }} Spieler haben geantwortet
            </div>
            
            <div class="mt-4 text-sm text-white/70">
              Du hast {{ String.fromCharCode(65 + selectedAnswer) }} gewählt
            </div>
          </div>
          
          <!-- Instructions for Players -->
          <div v-else-if="gamePhase === 'reading'" class="text-center text-orange-200">
            {{ selectedAnswer !== null ? 'Du kannst deine Auswahl bis zur Bestätigung ändern' : 'Wähle deine Antwort' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionCard',
  props: {
    question: { type: Object, required: true },
    gamePhase: { type: String, required: true },
    hiddenAnswers: { type: Array, required: true },
    isLastQuestion: { type: Boolean, required: true },
    isHost: { type: Boolean, required: true },
    selectedAnswer: { type: Number, default: null },
    hasVotedFinal: { type: Boolean, required: true },
    submittingVote: { type: Boolean, required: true },
    voteStats: { type: Object, required: true },
    showVotes: { type: Boolean, required: true },
    realPlayerCount: { type: Number, required: true },
    votedPlayerCount: { type: Number, required: true },
    allPlayersVoted: { type: Boolean, required: true },
    timeRemaining: { type: Number, required: true },
    isDisconnected: { type: Boolean, required: true }
  },
  emits: ['show-answer', 'next-question', 'select-answer', 'submit-final-vote'],
  computed: {
    canShowAnswer() {
      return this.allPlayersVoted || this.timeRemaining <= 0
    },
    
    getShowAnswerButtonText() {
      if (this.timeRemaining <= 0) {
        return 'Zeit abgelaufen - Antwort zeigen'
      }
      if (this.allPlayersVoted) {
        return 'Alle haben geantwortet - Antwort zeigen'
      }
      return `Warten auf Spieler (${this.votedPlayerCount}/${this.realPlayerCount})`
    }
  },
  methods: {
    getHostAnswerClasses(index) {
      if (this.gamePhase === 'reading') {
        if (this.hiddenAnswers.includes(index)) {
          return 'bg-white/5 text-white/30 border-2 border-white/10 opacity-30'
        }
        return 'bg-white/20 text-white border-2 border-white/30'
      } else if (this.gamePhase === 'showing_answer') {
        if (index === this.question.correctAnswer) {
          return 'bg-green-600 text-white border-2 border-green-400 animate-pulse shadow-lg shadow-green-400/50'
        } else if (this.hiddenAnswers.includes(index)) {
          return 'bg-white/5 text-white/20 border-2 border-white/10 opacity-30'
        } else {
          return 'bg-white/10 text-white/50 border-2 border-white/20'
        }
      }
      return 'bg-white/20 text-white border-2 border-white/30'
    },
    
    getPlayerAnswerClasses(index) {
      if (this.gamePhase === 'reading') {
        if (this.hiddenAnswers.includes(index)) {
          return 'bg-white/5 text-white/30 border-2 border-white/10 opacity-30 cursor-not-allowed'
        }
        if (this.selectedAnswer === index) {
          return 'bg-blue-600/50 text-white border-2 border-blue-400 shadow-lg'
        }
        if (this.hasVotedFinal || this.isDisconnected || this.timeRemaining <= 0) {
          return 'bg-white/10 text-white/50 border-2 border-white/20 cursor-not-allowed'
        }
        return 'bg-white/20 text-white border-2 border-white/30 hover:border-orange-400/50 hover:bg-white/30 cursor-pointer'
      } else if (this.gamePhase === 'showing_answer') {
        if (index === this.question.correctAnswer) {
          return 'bg-green-600 text-white border-2 border-green-400 animate-pulse'
        } else if (this.hiddenAnswers.includes(index)) {
          return 'bg-white/5 text-white/20 border-2 border-white/10 opacity-30'
        } else {
          return 'bg-white/10 text-white/50 border-2 border-white/20'
        }
      }
      return 'bg-white/20 text-white border-2 border-white/30 cursor-not-allowed'
    }
  }
}
</script>