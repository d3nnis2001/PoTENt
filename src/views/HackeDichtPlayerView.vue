<template>
  <div class="min-h-screen p-4 bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
    <div class="max-w-md mx-auto">
      
      <!-- Connection Status -->
      <div class="text-center mb-4">
        <div :class="[
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs',
          connectionStatus === 'connected' ? 'bg-green-600/30 text-green-200' : 'bg-red-600/30 text-red-200'
        ]">
          <div :class="[
            'w-2 h-2 rounded-full',
            connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
          ]"></div>
          {{ connectionStatus === 'connected' ? 'Verbunden' : 'Verbindung verloren' }}
        </div>
      </div>

      <!-- Lobby Code -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-white mb-1">Quiz Lobby</h1>
        <div class="text-lg text-orange-200">{{ lobbyCode }}</div>
      </div>

      <!-- Join Form (wenn noch nicht beigetreten) -->
      <div v-if="!hasJoined" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 class="text-xl font-bold text-white mb-4">Lobby beitreten</h2>
        
        <form @submit.prevent="joinLobby" class="space-y-4">
          <div>
            <label class="block text-white font-medium mb-2">Dein Name</label>
            <input
              v-model="playerName"
              type="text"
              maxlength="20"
              class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Dein Spielername"
              required
            />
          </div>

          <div>
            <label class="block text-white font-medium mb-2">Wähle dein Icon</label>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                @click="selectedIcon = icon"
                type="button"
                :class="[
                  'w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all border-2',
                  selectedIcon === icon 
                    ? 'bg-orange-600/50 border-orange-400' 
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                ]"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="!playerName.trim() || isJoining"
            class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ isJoining ? 'Trete bei...' : 'Beitreten' }}
          </button>
        </form>
      </div>

      <!-- Waiting Screen (nach dem Beitreten, vor Spielstart) -->
      <div v-else-if="gamePhase === 'waiting'" class="text-center">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <div class="w-20 h-20 rounded-full bg-green-600/30 flex items-center justify-center text-4xl mx-auto mb-3">
            {{ currentPlayer?.icon || '🎮' }}
          </div>
          <h2 class="text-xl font-bold text-white mb-1">{{ currentPlayer?.name }}</h2>
          <div class="text-green-300 text-sm">Bereit zum Spielen!</div>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <h3 class="text-lg font-bold text-white mb-3">Warte auf Spielstart...</h3>
          <div class="text-center">
            <div class="text-2xl text-orange-300 mb-1">{{ playerCount }}</div>
            <div class="text-xs text-orange-200">Spieler in der Lobby</div>
          </div>
        </div>
      </div>

      <!-- Event Phase -->
      <div v-else-if="gamePhase === 'event'" class="text-center py-12">
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

      <!-- Question Phase (während des Spiels) -->
      <div v-else-if="gamePhase === 'reading' && currentQuestion" class="space-y-6">
        <!-- Question Header -->
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">Frage {{ currentQuestionIndex + 1 }}/15</h2>
          <div v-if="timeRemaining > 0" class="text-orange-200 text-sm">
            {{ timeRemaining }}s verbleibend
          </div>
          <div v-else class="text-red-300 text-sm">
            Zeit abgelaufen!
          </div>
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
            :disabled="hasVoted || timeRemaining <= 0 || isHidden(index)"
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
            @click="submitVote"
            :disabled="isSubmitting"
            class="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all"
          >
            {{ isSubmitting ? 'Wird gesendet...' : 'Antwort bestätigen' }}
          </button>
        </div>

        <!-- Vote Confirmed -->
        <div v-else-if="hasVoted" class="text-center">
          <div class="bg-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
            <div class="text-6xl mb-4 animate-bounce">✓</div>
            <h3 class="text-xl font-bold text-white mb-2">Antwort bestätigt!</h3>
            <p class="text-green-200 mb-4">Warte auf andere Spieler...</p>
            <div class="text-sm text-white/70">
              Du hast {{ String.fromCharCode(65 + selectedAnswer) }} gewählt
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div v-else class="text-center text-orange-200 text-sm">
          {{ selectedAnswer !== null ? 'Du kannst deine Auswahl bis zur Bestätigung ändern' : 'Wähle deine Antwort' }}
        </div>
      </div>

      <!-- Results Phase -->
      <div v-else-if="gamePhase === 'results' && currentQuestion" class="text-center">
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
          </div>

          <div v-if="selectedAnswer !== currentQuestion.correctAnswer" class="text-orange-200 text-sm">
            Du trinkst: {{ currentReward?.name }}! 🍻
          </div>
        </div>
        
        <div class="text-orange-200 text-sm">
          Warte auf den Moderator...
        </div>
      </div>

      <!-- Game Finished -->
      <div v-else-if="gamePhase === 'finished'" class="text-center py-12">
        <div class="text-8xl mb-6 animate-bounce">🎉</div>
        <h2 class="text-3xl font-bold text-white mb-4">Quiz beendet!</h2>
        <p class="text-orange-200 text-lg mb-8">Danke fürs Mitspielen!</p>
        
        <button
          @click="leaveLobby"
          class="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          Lobby verlassen
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mt-4 p-3 bg-red-600/20 border border-red-400/30 rounded-lg">
        <p class="text-red-300 text-sm text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'
import { globalToast } from '../composables/useToast'
import joker50 from '../assets/5050.png'
import jokerrandom from '../assets/RandomPerson.png'
import jokerreveal from '../assets/RevealJoker.png'

export default {
  name: 'HackeDichtPlayerView',
  props: {
    lobbyCode: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const { success, error: showError } = globalToast
    
    const {
      currentLobby, currentPlayer, players, gameState, connectionStatus,
      joinLobby: joinLobbyAction, submitVote: submitVoteAction, leaveLobby: leaveLobbyAction
    } = useLobby()

    // Join State
    const hasJoined = ref(false)
    const playerName = ref('')
    const selectedIcon = ref('🎮')
    const isJoining = ref(false)

    // Game State
    const selectedAnswer = ref(null)
    const hasVoted = ref(false)
    const isSubmitting = ref(false)
    const timeRemaining = ref(30)
    const hiddenAnswers = ref([])
    const activeJokers = ref([])
    const questionTimer = ref(null)

    // Available Icons
    const availableIcons = [
      '🎮', '🎯', '🎲', '🎪', '🎨', 
      '🎭', '🎸', '⚽', '🍕', '🚀'
    ]

    const error = ref('')

    // Computed
    const gamePhase = computed(() => {
      if (!hasJoined.value) return 'joining'
      if (!currentLobby.value) return 'waiting'
      
      if (currentLobby.value.status === 'waiting') return 'waiting'
      if (gameState.value?.phase === 'voting') return 'reading'
      if (gameState.value?.phase === 'results') return 'results'
      if (gameState.value?.phase === 'finished') return 'finished'
      if (gameState.value?.phase === 'event') return 'event'
      if (gameState.value?.phase === 'progress') return 'progress'
      
      return 'waiting'
    })

    const currentQuestionIndex = computed(() => gameState.value?.currentQuestionIndex || 0)
    
    const currentQuestion = computed(() => {
      if (!currentLobby.value?.gameData) return null
      return currentLobby.value.gameData.questions[currentQuestionIndex.value]
    })

    const currentReward = computed(() => {
      if (!currentLobby.value?.gameData) return null
      const questionNumber = currentQuestionIndex.value + 1
      const rewards = currentLobby.value.gameData.rewards
      if (questionNumber <= 5) return rewards[0]
      if (questionNumber <= 10) return rewards[1]
      return rewards[2]
    })

    const playerCount = computed(() => {
      return Object.values(players.value || {}).filter(p => p.isOnline).length
    })

    // Joker Management
    const availableJokers = computed(() => {
      if (!gameState.value?.jokers) return {}
      return gameState.value.jokers
    })

    const hasAvailableJokers = computed(() => {
      return Object.keys(availableJokers.value).length > 0
    })

    const currentEventQuestion = computed(() => {
      return gameState.value?.currentEventQuestion || null
    })

    // Methods
    const joinLobby = async () => {
      if (!playerName.value.trim()) return
      
      isJoining.value = true
      error.value = ''
      
      try {
        await joinLobbyAction(props.lobbyCode, playerName.value.trim(), selectedIcon.value)
        hasJoined.value = true
        success('Lobby beigetreten!')
      } catch (err) {
        error.value = err.message
      } finally {
        isJoining.value = false
      }
    }

    const selectAnswer = (answerIndex) => {
      if (hasVoted.value || timeRemaining.value <= 0 || isHidden(answerIndex)) return
      selectedAnswer.value = answerIndex
    }

    const submitVote = async () => {
      if (isSubmitting.value || hasVoted.value || selectedAnswer.value === null) return
      
      isSubmitting.value = true
      try {
        await submitVoteAction(currentQuestionIndex.value, selectedAnswer.value)
        hasVoted.value = true
        success('Antwort bestätigt!')
      } catch (err) {
        error.value = 'Fehler beim Abstimmen: ' + err.message
      } finally {
        isSubmitting.value = false
      }
    }

    const leaveLobby = async () => {
      try {
        await leaveLobbyAction()
        router.push('/')
      } catch (err) {
        router.push('/')
      }
    }

    const isHidden = (answerIndex) => {
      return hiddenAnswers.value.includes(answerIndex)
    }

    const getAnswerButtonClass = (index) => {
      if (isHidden(index)) {
        return 'bg-white/5 text-white/30 border-2 border-white/10 opacity-30 cursor-not-allowed'
      }
      
      if (selectedAnswer.value === index && !hasVoted.value) {
        return 'bg-blue-600/50 text-white border-2 border-blue-400 shadow-lg'
      }
      
      if (hasVoted.value || timeRemaining.value <= 0) {
        return 'bg-white/10 text-white/50 border-2 border-white/20 cursor-not-allowed'
      }
      
      return 'bg-white/20 text-white border-2 border-white/30 hover:border-orange-400/50 hover:bg-white/30 cursor-pointer'
    }


    const stopTimer = () => {
      if (questionTimer.value) {
        clearInterval(questionTimer.value)
        questionTimer.value = null
      }
    }

    // Watchers
    watch(() => gameState.value, (newState) => {
      if (!newState) return
      
      console.log('🔄 Player GameState Update:', {
        phase: newState.phase,
        questionIndex: newState.currentQuestionIndex
      })
      
      // Reset vote state für neue Frage
      if (newState.phase === 'voting') {
        selectedAnswer.value = null
        hasVoted.value = false
        hiddenAnswers.value = []
        
        // Timer synchronisieren mit questionStartTime
        const startTime = newState.questionStartTime
        if (startTime) {
          const now = Date.now()
          const elapsed = Math.floor((now - startTime) / 1000)
          timeRemaining.value = Math.max(0, 30 - elapsed)
        } else {
          timeRemaining.value = 30
        }
        
        // Timer starten
        stopTimer()
        questionTimer.value = setInterval(() => {
          timeRemaining.value--
          if (timeRemaining.value <= 0) {
            stopTimer()
          }
        }, 1000)
      }
      
      // Event Phase
      if (newState.phase === 'event') {
        console.log('🎭 Player: Event Phase gestartet')
        stopTimer()
      }
      
      // Progress Phase
      if (newState.phase === 'progress') {
        console.log('📊 Player: Progress Phase gestartet')
        stopTimer()
      }
      
      // Timer stoppen bei Results und Finished
      if (newState.phase === 'results' || newState.phase === 'finished') {
        stopTimer()
      }
      
      // Joker Updates
      if (newState.jokers) {
        activeJokers.value = Object.keys(newState.jokers).filter(key => newState.jokers[key].used)
        
        // 50/50 Joker anwenden
        if (newState.jokers.fiftyFifty?.used && currentQuestion.value) {
          const wrongAnswers = []
          for (let i = 0; i < 4; i++) {
            if (i !== currentQuestion.value.correctAnswer) {
              wrongAnswers.push(i)
            }
          }
          const shuffled = wrongAnswers.sort(() => 0.5 - Math.random())
          hiddenAnswers.value = shuffled.slice(0, 2)
        }
      }
    }, { deep: true })

    watch(() => props.lobbyCode, () => {
      // Reset bei Lobby-Wechsel
      hasJoined.value = false
      selectedAnswer.value = null
      hasVoted.value = false
      error.value = ''
      stopTimer()
    })

    onMounted(() => {
      // Random Icon als Default setzen
      selectedIcon.value = availableIcons[Math.floor(Math.random() * availableIcons.length)]
    })

    onUnmounted(() => {
      stopTimer()
    })

    return {
      // Props
      lobbyCode: props.lobbyCode,
      
      // State
      hasJoined, playerName, selectedIcon, isJoining,
      selectedAnswer, hasVoted, isSubmitting, timeRemaining,
      hiddenAnswers, activeJokers, error,
      availableIcons,
      
      // Lobby State
      currentLobby, currentPlayer, players, connectionStatus,
      
      // Computed
      gamePhase, currentQuestionIndex, currentQuestion, currentReward, playerCount,
      availableJokers, hasAvailableJokers, currentEventQuestion,
      
      // Methods
      joinLobby, selectAnswer, submitVote, leaveLobby,
      isHidden, getAnswerButtonClass,
      
      // Assets
      joker50, jokerrandom, jokerreveal
    }
  }
}
</script>

<style scoped>
/* Mobile optimized styles */
@media (max-width: 640px) {
  .text-2xl {
    font-size: 1.5rem;
  }
  
  .text-xl {
    font-size: 1.125rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
  
  .py-4 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

/* Touch-friendly button sizing */
button {
  min-height: 44px;
}
</style>