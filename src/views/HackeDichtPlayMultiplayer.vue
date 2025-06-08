<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Audio Controls -->
      <AudioControls 
        :is-audio-enabled="isAudioEnabled"
        :is-playing="isPlaying"
        @toggle-audio-enabled="toggleAudioEnabled"
        @toggle-audio="toggleAudio"
      />

      <!-- Lobby Code Display (nur wenn Lobby aktiv) -->
      <div v-if="currentLobby && !showResults" class="fixed top-4 left-4 z-40 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div class="text-center">
          <div class="text-sm text-white/70 mb-1">Lobby-Code</div>
          <div class="text-2xl font-bold text-white tracking-wider">{{ currentLobby.code }}</div>
          <div class="text-xs text-orange-200 mt-1">{{ realPlayerCount }} Spieler</div>
          <button
            @click="copyLobbyCode"
            class="mt-2 text-xs bg-blue-600/30 text-blue-200 px-2 py-1 rounded hover:bg-blue-600/50 transition-colors"
          >
            Code kopieren
          </button>
        </div>
      </div>

      <GameHeader 
        :game-name="game?.name || 'Wer wird hacke dicht? - Multiplayer'"
        @back="handleBackToGallery"
      />

      <LoadingView v-if="isLoading" message="Erstelle Multiplayer-Spiel..." />

      <GameNotFoundView v-else-if="!game" />

      <!-- Lobby Setup (vor Spielstart) -->
      <div v-else-if="!currentLobby" class="max-w-md mx-auto">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h2 class="text-xl font-bold text-white mb-4">Multiplayer-Lobby erstellen</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-white font-medium mb-2">Dein Name (Host)</label>
              <input
                v-model="hostName"
                type="text"
                maxlength="20"
                class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Dein Moderator-Name"
                required
              />
            </div>

            <button
              @click="createLobby"
              :disabled="!hostName.trim() || isCreatingLobby"
              class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <svg v-if="isCreatingLobby" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              {{ isCreatingLobby ? 'Erstelle Lobby...' : 'Multiplayer starten' }}
            </button>
          </div>
        </div>

        <!-- Game Info Card -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <h3 class="text-lg font-bold text-white mb-3">Quiz-Info</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl text-orange-300 mb-1">15</div>
              <div class="text-xs text-orange-200">Fragen</div>
            </div>
            <div>
              <div class="text-2xl text-red-300 mb-1">30</div>
              <div class="text-xs text-red-200">Sekunden</div>
            </div>
            <div>
              <div class="text-2xl text-purple-300 mb-1">3</div>
              <div class="text-xs text-purple-200">Joker</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warten auf Spieler (nach Lobby-Erstellung) -->
      <div v-else-if="currentLobby && currentLobby.status === 'waiting'" class="text-center py-12">
        <h2 class="text-3xl font-bold text-white mb-4">Warte auf Mitspieler</h2>
        <p class="text-orange-200 text-lg mb-8">Spieler können jetzt mit dem Code {{ currentLobby.code }} beitreten</p>
        
        <!-- Player Count -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6 max-w-md mx-auto">
          <div class="text-4xl font-bold text-white mb-2">{{ realPlayerCount }}</div>
          <div class="text-orange-200">Spieler beigetreten</div>
        </div>

        <!-- Start Game Button -->
        <button
          v-if="realPlayerCount >= 1"
          @click="startGame"
          :disabled="isStartingGame"
          class="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-lg font-bold text-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all"
        >
          {{ isStartingGame ? 'Starte Spiel...' : 'Spiel starten' }}
        </button>
        <p v-else class="text-orange-200 text-sm">Mindestens 1 Spieler wird benötigt</p>
        
        <!-- Join Instructions -->
        <div class="mt-8 text-sm text-orange-200 max-w-md mx-auto">
          <p>Spieler können unter <strong>{{ window.location.origin }}/#/play-mobile/{{ currentLobby.code }}</strong> beitreten</p>
        </div>
      </div>

      <!-- Progress Screen (wie Single-Player) -->
      <ProgressScreen 
        v-else-if="showProgressScreen"
        :game="game"
        :current-question-index="currentQuestionIndex"
        @continue="continueFromProgress"
      />

      <!-- Event Question (wie Single-Player) -->
      <EventQuestionView
        v-else-if="showEventQuestion"
        :event-question="currentEventQuestion"
        @continue="continueAfterEvent"
      />

      <!-- Results (wie Single-Player) -->
      <ResultsView
        v-else-if="showResults"
        @restart="restartGame"
        @back-to-gallery="handleBackToGallery"
      />

      <!-- Question View (wie Single-Player, aber mit Multiplayer-Daten) -->
      <QuestionView
        v-else-if="currentQuestion"
        :question="currentQuestion"
        :question-index="currentQuestionIndex"
        :current-reward="currentReward"
        :game-phase="gamePhase"
        :is-last-question="isLastQuestion"
        :hidden-answers="hiddenAnswers"
        :jokers="jokers"
        @show-answer="showAnswer"
        @next-question="nextQuestion"
        @use-joker="handleJokerUse"
      />

      <!-- Multiplayer Stats Overlay -->
      <div v-if="currentQuestion && gamePhase === 'showing_answer' && realPlayerCount > 0" class="mt-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 class="text-xl font-bold text-white mb-4">Abstimmungs-Ergebnisse</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(answer, index) in currentQuestion.answers"
              :key="index"
              :class="[
                'p-4 rounded-lg border-2 transition-all',
                index === currentQuestion.correctAnswer 
                  ? 'bg-green-600/30 border-green-400' 
                  : 'bg-white/5 border-white/20'
              ]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-bold">{{ String.fromCharCode(65 + index) }}</span>
                  <span class="text-white">{{ getVoteCount(index) }} Stimmen</span>
                </div>
                <div class="text-lg font-bold text-white">
                  {{ getVotePercentage(index) }}%
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div class="w-full bg-black/20 rounded-full h-2 mt-2">
                <div 
                  class="bg-white h-2 rounded-full transition-all duration-1000"
                  :style="{ width: `${getVotePercentage(index)}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <div class="mt-4 text-center">
            <p class="text-orange-200">
              {{ getWrongPlayerCount() }} von {{ realPlayerCount }} Spielern trinken {{ currentReward?.name }}! 🍻
            </p>
          </div>
        </div>
      </div>

      <!-- Joker Message Modal (wie Single-Player) -->
      <JokerMessageModal
        v-if="jokerMessage"
        :joker-message="jokerMessage"
        @close="clearJokerMessage"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'
import { hackeDichtStore } from '../store/hackeDichtStore'
import { useAudio } from '../composables/useAudio'
import { globalToast } from '../composables/useToast'

// Import bestehende Komponenten wiederverwenden
import GameHeader from '../components/hacke-dicht/GameHeader.vue'
import LoadingView from '../components/hacke-dicht/LoadingView.vue'
import GameNotFoundView from '../components/hacke-dicht/GameNotFoundView.vue'
import ProgressScreen from '../components/hacke-dicht/ProgressScreen.vue'
import EventQuestionView from '../components/hacke-dicht/EventQuestionView.vue'
import ResultsView from '../components/hacke-dicht/ResultsView.vue'
import QuestionView from '../components/hacke-dicht/QuestionView.vue'
import JokerMessageModal from '../components/hacke-dicht/JokerMessageModal.vue'
import AudioControls from '../components/AudioControls.vue'

export default {
  name: 'HackeDichtPlayMultiplayer',
  components: {
    GameHeader,
    LoadingView,
    GameNotFoundView,
    ProgressScreen,
    EventQuestionView,
    ResultsView,
    QuestionView,
    JokerMessageModal,
    AudioControls
  },
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const { success, error: showError } = globalToast
    
    // Lobby Management
    const {
      currentLobby, currentPlayer, players, gameState,
      createLobby: createLobbyAction, startGame: startGameAction,
      submitVote, activateJoker: activateJokerAction, connectionStatus
    } = useLobby()
    
    // Audio System (wie Single-Player)
    const {
      isAudioEnabled, isPlaying, stopAudio, toggleAudio, toggleAudioEnabled,
      playQuestionAudio, playCorrectAnswerAudio, playJokerAudio, playGameStartAudio, initAudio
    } = useAudio()

    // Game State (wie Single-Player)
    const isLoading = ref(true)
    const game = ref(null)
    const currentQuestionIndex = ref(0)
    const gamePhase = ref('progress')
    const showResults = ref(false)
    const showEventQuestion = ref(false)
    const showProgressScreen = ref(true)
    const currentEventQuestion = ref(null)
    const eventQueue = ref([])

    // Lobby Setup State
    const hostName = ref('Moderator')
    const isCreatingLobby = ref(false)
    const isStartingGame = ref(false)

    // Joker System (wie Single-Player)
    const jokers = ref({
      fiftyFifty: { used: false },
      randomPerson: { used: false },
      reveal: { used: false }
    })
    const hiddenAnswers = ref([])
    const jokerMessage = ref(null)

    // Computed Properties
    const currentQuestion = computed(() => {
      if (!game.value || showResults.value) return null
      return game.value.questions[currentQuestionIndex.value]
    })

    const currentReward = computed(() => {
      if (!game.value) return null
      const questionNumber = currentQuestionIndex.value + 1
      if (questionNumber <= 5) return game.value.rewards[0]
      if (questionNumber <= 10) return game.value.rewards[1]
      return game.value.rewards[2]
    })

    const isLastQuestion = computed(() => {
      return currentQuestionIndex.value >= 14
    })

    // Multiplayer Computed
    const realPlayerList = computed(() => {
      return Object.values(players.value || {})
        .filter(p => p.isOnline && !p.isModerator)
    })

    const realPlayerCount = computed(() => realPlayerList.value.length)

    // Vote Statistics
    const getVoteCount = (answerIndex) => {
      const votes = currentLobby.value?.votes?.[currentQuestionIndex.value] || {}
      return Object.values(votes).filter(vote => vote.answer === answerIndex).length
    }

    const getVotePercentage = (answerIndex) => {
      const totalVotes = Object.keys(currentLobby.value?.votes?.[currentQuestionIndex.value] || {}).length
      if (totalVotes === 0) return 0
      return Math.round((getVoteCount(answerIndex) / totalVotes) * 100)
    }

    const getWrongPlayerCount = () => {
      const votes = currentLobby.value?.votes?.[currentQuestionIndex.value] || {}
      const correctAnswer = currentQuestion.value.correctAnswer
      return Object.values(votes).filter(vote => vote.answer !== correctAnswer).length
    }

    // Methods
    const createLobby = async () => {
      if (!hostName.value.trim()) return
      
      isCreatingLobby.value = true
      try {
        await createLobbyAction(props.gameId, hostName.value.trim())
        success(`Lobby ${currentLobby.value.code} erstellt!`)
        
        // Game data in lobby speichern für mobile clients
        // TODO: Implement game data sharing in lobbyStore
        
      } catch (error) {
        showError('Fehler beim Erstellen der Lobby: ' + error.message)
      } finally {
        isCreatingLobby.value = false
      }
    }

    const startGame = async () => {
      isStartingGame.value = true
      try {
        await startGameAction()
        success('Spiel gestartet!')
        
        // Audio für Spielstart
        setTimeout(() => {
          playGameStartAudio()
        }, 1000)
        
      } catch (error) {
        showError('Fehler beim Starten: ' + error.message)
      } finally {
        isStartingGame.value = false
      }
    }

    const copyLobbyCode = async () => {
      if (!currentLobby.value) return
      
      try {
        await navigator.clipboard.writeText(currentLobby.value.code)
        success('Lobby-Code kopiert!')
      } catch (error) {
        showError('Fehler beim Kopieren')
      }
    }

    // Game Flow Methods (identisch zu Single-Player, aber mit Lobby-Sync)
    const continueFromProgress = () => {
      showProgressScreen.value = false
      gamePhase.value = 'reading'
      playQuestionAudio(currentQuestionIndex.value + 1)
    }

    const showAnswer = () => {
      gamePhase.value = 'showing_answer'
      stopAudio()
      playCorrectAnswerAudio()
    }

    const nextQuestion = () => {
      hiddenAnswers.value = []
      
      const questionNumber = currentQuestionIndex.value + 1
      const eventQuestions = game.value.eventQuestions[questionNumber] || []
      
      if (eventQuestions.length > 0) {
        eventQueue.value = [...eventQuestions]
        showNextEvent()
      } else {
        proceedToNextQuestion()
      }
    }

    const showNextEvent = () => {
      if (eventQueue.value.length > 0) {
        currentEventQuestion.value = eventQueue.value.shift()
        showEventQuestion.value = true
        gamePhase.value = 'event'
        stopAudio()
      } else {
        proceedToNextQuestion()
      }
    }

    const continueAfterEvent = () => {
      showEventQuestion.value = false
      if (eventQueue.value.length > 0) {
        showNextEvent()
      } else {
        proceedToNextQuestion()
      }
    }

    const proceedToNextQuestion = () => {
      if (isLastQuestion.value) {
        showResults.value = true
        stopAudio()
      } else {
        currentQuestionIndex.value++
        showProgressScreen.value = true
        gamePhase.value = 'progress'
        stopAudio()
      }
    }

    const restartGame = () => {
      // Reset local state
      currentQuestionIndex.value = 0
      gamePhase.value = 'progress'
      showResults.value = false
      showEventQuestion.value = false
      showProgressScreen.value = true
      currentEventQuestion.value = null
      eventQueue.value = []
      
      jokers.value = {
        fiftyFifty: { used: false },
        randomPerson: { used: false },
        reveal: { used: false }
      }
      hiddenAnswers.value = []
      jokerMessage.value = null
      
      // TODO: Reset lobby state
      stopAudio()
      setTimeout(() => {
        playGameStartAudio()
      }, 500)
    }

    const handleBackToGallery = () => {
      stopAudio()
      router.push('/hacke-dicht/gallery')
    }

    // Joker Handling (wie Single-Player)
    const handleJokerUse = (jokerType) => {
      if (gamePhase.value !== 'reading') return

      playJokerAudio(jokerType)

      switch (jokerType) {
        case 'fiftyFifty':
          use5050Joker()
          break
        case 'randomPerson':
          useRandomPersonJoker()
          break
        case 'reveal':
          useRevealJoker()
          break
      }
    }

    const use5050Joker = () => {
      if (jokers.value.fiftyFifty.used) return
      
      jokers.value.fiftyFifty.used = true
      
      const wrongAnswers = []
      for (let i = 0; i < 4; i++) {
        if (i !== currentQuestion.value.correctAnswer) {
          wrongAnswers.push(i)
        }
      }
      
      const shuffled = wrongAnswers.sort(() => 0.5 - Math.random())
      hiddenAnswers.value = shuffled.slice(0, 2)
      
      jokerMessage.value = {
        type: 'fiftyFifty',
        title: '50/50 Joker aktiviert!',
        text: `Zwei falsche Antworten wurden entfernt. Es bleiben nur noch zwei Optionen übrig!`
      }
    }

    const useRandomPersonJoker = () => {
      if (jokers.value.randomPerson.used) return
      
      jokers.value.randomPerson.used = true
      
      if (realPlayerList.value.length === 0) {
        jokerMessage.value = {
          type: 'randomPerson',
          title: 'Random Person Joker aktiviert!',
          text: 'Keine Spieler verfügbar. Du musst selbst entscheiden!'
        }
        return
      }
      
      const randomPlayer = realPlayerList.value[Math.floor(Math.random() * realPlayerList.value.length)]
      
      jokerMessage.value = {
        type: 'randomPerson',
        title: 'Random Person Joker aktiviert!',
        text: `${randomPlayer.name} muss ihre/seine Antwort preisgeben und erklären!`
      }
    }

    const useRevealJoker = () => {
      if (jokers.value.reveal.used) return
      
      jokers.value.reveal.used = true
      
      jokerMessage.value = {
        type: 'reveal',
        title: 'Reveal Joker aktiviert!',
        text: 'Alle Spieler müssen jetzt ihre Karten aufdecken und ihre gewählten Antworten zeigen!'
      }
    }

    const clearJokerMessage = () => {
      jokerMessage.value = null
    }

    // Initialize Game
    const initializeGame = async () => {
      isLoading.value = true
      
      try {
        await hackeDichtStore.loadGames()
        const gameData = hackeDichtStore.getGame(parseInt(props.gameId))
        
        if (!gameData) {
          console.error('Game not found')
          return
        }

        game.value = gameData
        initAudio()
        
      } catch (error) {
        console.error('Error loading game:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Watchers für Lobby-Sync
    watch(() => gameState.value, (newState) => {
      if (!newState) return
      
      currentQuestionIndex.value = newState.currentQuestionIndex || 0
      
      if (newState.phase === 'voting') {
        gamePhase.value = 'reading'
        showProgressScreen.value = false
      } else if (newState.phase === 'results') {
        gamePhase.value = 'showing_answer'
      } else if (newState.phase === 'finished') {
        showResults.value = true
      }
    }, { deep: true })

    onMounted(() => {
      initializeGame()
    })

    onUnmounted(() => {
      stopAudio()
    })

    return {
      // State
      isLoading, game, currentLobby, currentPlayer, players,
      hostName, isCreatingLobby, isStartingGame,
      currentQuestion, currentQuestionIndex, gamePhase,
      showResults, showEventQuestion, showProgressScreen,
      currentEventQuestion, currentReward, isLastQuestion,
      jokers, hiddenAnswers, jokerMessage,
      
      // Audio
      isAudioEnabled, isPlaying,
      
      // Computed
      realPlayerCount,
      
      // Methods
      createLobby, startGame, copyLobbyCode,
      continueFromProgress, showAnswer, nextQuestion,
      continueAfterEvent, restartGame, handleBackToGallery,
      handleJokerUse, clearJokerMessage,
      getVoteCount, getVotePercentage, getWrongPlayerCount,
      
      // Audio Methods
      toggleAudio, toggleAudioEnabled,
      
      // Utils
      window
    }
  }
}
</script>