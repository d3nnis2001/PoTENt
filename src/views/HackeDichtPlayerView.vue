<template>
  <div class="min-h-screen p-4 bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
    <div class="max-w-md mx-auto">
      
      <!-- Connection Status (nur nach dem Beitreten anzeigen) -->
      <div v-if="hasJoined" class="text-center mb-4">
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

      <!-- Join Form (wenn noch nicht beigetreten) -->
      <PlayerJoinForm
        v-if="!hasJoined"
        :is-joining="isJoining"
        @join="handleJoin"
      />

      <!-- Waiting Screen (nach dem Beitreten, vor Spielstart) -->
      <PlayerWaitingScreen
        v-else-if="gamePhase === 'waiting'"
        :player="currentPlayer"
        :player-count="playerCount"
      />

      <!-- Game Phases -->
      <PlayerGamePhase
        v-else
        :game-phase="gamePhase"
        :current-event-question="currentEventQuestion"
        :current-question-index="currentQuestionIndex"
        :current-question="currentQuestion"
        :current-reward="currentReward"
        :time-remaining="timeRemaining"
        :available-jokers="availableJokers"
        :hidden-answers="hiddenAnswers"
        :selected-answer="selectedAnswer"
        :has-voted="hasVoted"
        :is-submitting="isSubmitting"
        @select-answer="selectAnswer"
        @submit-vote="submitVote"
        @leave-lobby="leaveLobby"
      />

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

// Components
import PlayerJoinForm from '../components/hacke-dicht-mobile/PlayerJoinForm.vue'
import PlayerWaitingScreen from '../components/hacke-dicht-mobile/PlayerWaitingScreen.vue'
import PlayerGamePhase from '../components/hacke-dicht-mobile/PlayerGamePhase.vue'

// Dynamic import of character images
const importCharacterImages = () => {
  const images = []
  const modules = import.meta.glob('../assets/character/Character*.png', { eager: true })
  
  // Sort by character number
  const sortedKeys = Object.keys(modules).sort((a, b) => {
    const numA = parseInt(a.match(/Character(\d+)\.png$/)?.[1] || '0')
    const numB = parseInt(b.match(/Character(\d+)\.png$/)?.[1] || '0')
    return numA - numB
  })
  
  sortedKeys.forEach(key => {
    images.push(modules[key].default)
  })
  
  return images
}

const characterImages = importCharacterImages()

export default {
  name: 'HackeDichtPlayerView',
  components: {
    PlayerJoinForm,
    PlayerWaitingScreen,
    PlayerGamePhase
  },
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
    const isJoining = ref(false)

    // Game State
    const selectedAnswer = ref(null)
    const hasVoted = ref(false)
    const isSubmitting = ref(false)
    const timeRemaining = ref(30)
    const hiddenAnswers = ref([])
    const activeJokers = ref([])
    const questionTimer = ref(null)

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
      console.log('🃏 Player availableJokers:', gameState.value.jokers)
      return gameState.value.jokers
    })

    const currentEventQuestion = computed(() => {
      return gameState.value?.currentEventQuestion || null
    })

    // Methods
    const handleJoin = async (joinData) => {
      isJoining.value = true
      error.value = ''
      
      try {
        const iconUrl = characterImages[joinData.iconIndex] || characterImages[0]
        await joinLobbyAction(props.lobbyCode, joinData.name, iconUrl)
        hasJoined.value = true
        success('Lobby beigetreten!')
      } catch (err) {
        error.value = err.message
      } finally {
        isJoining.value = false
      }
    }

    const selectAnswer = (answerIndex) => {
      if (hasVoted.value || timeRemaining.value <= 0 || hiddenAnswers.value.includes(answerIndex)) return
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

    onUnmounted(() => {
      stopTimer()
    })

    return {
      // Props
      lobbyCode: props.lobbyCode,
      
      // State
      hasJoined, isJoining,
      selectedAnswer, hasVoted, isSubmitting, timeRemaining,
      hiddenAnswers, activeJokers, error,
      
      // Lobby State
      currentLobby, currentPlayer, players, connectionStatus,
      
      // Computed
      gamePhase, currentQuestionIndex, currentQuestion, currentReward, playerCount,
      availableJokers, currentEventQuestion,
      
      // Methods
      handleJoin, selectAnswer, submitVote, leaveLobby
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