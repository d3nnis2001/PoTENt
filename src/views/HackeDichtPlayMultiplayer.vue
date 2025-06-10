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
              :disabled="!hostName.trim() || isCreatingLobby || !game"
              class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <svg v-if="isCreatingLobby" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              {{ isCreatingLobby ? 'Erstelle Lobby...' : !game ? 'Lade Spiel...' : 'Multiplayer starten' }}
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
      <div v-else-if="currentLobby && currentLobby.status === 'waiting'" class="max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold text-white mb-6 text-center">Multiplayer Lobby</h2>
        
        <div class="grid md:grid-cols-2 gap-8">
          <!-- QR Code & Join Info -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <h3 class="text-lg font-bold text-white mb-4">📱 Handy beitreten</h3>
            
            <!-- QR Code -->
            <div class="bg-white p-4 rounded-lg mb-4 inline-block">
              <canvas ref="qrCanvas" class="max-w-full"></canvas>
            </div>
            
            <!-- Join Link -->
            <div class="mb-4">
              <div class="text-sm text-orange-200 mb-2">Link:</div>
              <div class="bg-black/30 rounded-lg p-3 text-white text-sm break-all">
                {{ joinUrl }}
              </div>
              <button
                @click="copyJoinUrl"
                class="mt-2 text-xs bg-blue-600/30 text-blue-200 px-3 py-1 rounded hover:bg-blue-600/50 transition-colors"
              >
                Link kopieren
              </button>
            </div>
          </div>

          <!-- Lobby Code & Info -->
          <div class="space-y-4">
            <!-- Großer Lobby Code -->
            <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
              <h3 class="text-lg font-bold text-white mb-3">🎯 Lobby Code</h3>
              <div class="text-6xl font-bold text-orange-300 tracking-wider mb-3">{{ currentLobby.code }}</div>
              <button
                @click="copyLobbyCode"
                class="bg-orange-600/30 text-orange-200 px-4 py-2 rounded-lg hover:bg-orange-600/50 transition-colors text-sm"
              >
                Code kopieren
              </button>
            </div>

            <!-- Kompakte Spieler Info -->
            <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-white font-bold">Spieler</h4>
                <div class="text-2xl font-bold text-white">{{ realPlayerCount }}</div>
              </div>
              
              <!-- Game Info kompakt -->
              <div class="grid grid-cols-3 gap-2 text-center text-xs border-t border-white/20 pt-3">
                <div>
                  <div class="text-orange-300 font-bold">15</div>
                  <div class="text-orange-200">Fragen</div>
                </div>
                <div>
                  <div class="text-red-300 font-bold">30s</div>
                  <div class="text-red-200">Zeit</div>
                </div>
                <div>
                  <div class="text-purple-300 font-bold">3</div>
                  <div class="text-purple-200">Joker</div>
                </div>
              </div>
            </div>

            <!-- Start Button -->
            <button
              v-if="realPlayerCount >= 1"
              @click="startGame"
              :disabled="isStartingGame"
              class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all"
            >
              {{ isStartingGame ? 'Starte Spiel...' : 'Spiel starten' }}
            </button>
            <p v-else class="text-orange-200 text-sm text-center">Mindestens 1 Spieler wird benötigt</p>
          </div>
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

      <!-- Question View (Multiplayer Version) -->
      <div v-else-if="currentQuestion" class="space-y-6">
        <!-- Jokers Display (Host only) -->
        <JokersPanel 
          v-if="currentPlayer?.isHost"
          :jokers="jokers"
          :game-phase="gamePhase"
          @use-joker="handleJokerUse"
        />

        <!-- Question Header -->
        <QuestionHeader 
          :question-index="currentQuestionIndex"
          :current-reward="currentReward"
          :is-host="currentPlayer?.isHost || false"
          :real-player-count="realPlayerCount"
          :voted-player-count="votedPlayerCount"
          :time-remaining="timeRemaining"
        />

        <!-- Question Card mit integrierten Votes -->
        <QuestionCard
          :question="currentQuestion"
          :game-phase="gamePhase"
          :hidden-answers="hiddenAnswers"
          :is-last-question="isLastQuestion"
          :is-host="currentPlayer?.isHost || false"
          :selected-answer="null"
          :has-voted-final="false"
          :submitting-vote="false"
          :vote-stats="currentVoteStats"
          :show-votes="gamePhase === 'showing_answer'"
          :real-player-count="realPlayerCount"
          :voted-player-count="votedPlayerCount"
          :all-players-voted="allPlayersVoted"
          :time-remaining="timeRemaining"
          :is-disconnected="connectionStatus !== 'connected'"
          @show-answer="showAnswer"
          @next-question="nextQuestion"
          @select-answer="() => {}"
          @submit-final-vote="() => {}"
        />

        <!-- Answer Feedback -->
        <AnswerFeedback
          v-if="gamePhase === 'showing_answer'"
          :correct-answer="currentQuestion.correctAnswer"
          :current-reward="currentReward"
          :is-host="currentPlayer?.isHost || false"
          :wrong-player-count="getWrongPlayerCount()"
          :selected-answer="null"
        />
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'
import { hackeDichtStore } from '../store/hackeDichtStore'
import { useAudio } from '../composables/useAudio'
import { globalToast } from '../composables/useToast'
import QRCode from 'qrcode'

// Import Komponenten
import GameHeader from '../components/hacke-dicht/GameHeader.vue'
import LoadingView from '../components/hacke-dicht/LoadingView.vue'
import GameNotFoundView from '../components/hacke-dicht/GameNotFoundView.vue'
import ProgressScreen from '../components/hacke-dicht/ProgressScreen.vue'
import EventQuestionView from '../components/hacke-dicht/EventQuestionView.vue'
import ResultsView from '../components/hacke-dicht/ResultsView.vue'
import JokerMessageModal from '../components/hacke-dicht/JokerMessageModal.vue'
import AudioControls from '../components/AudioControls.vue'
import JokersPanel from '../components/hacke-dicht/JokersPanel.vue'

// Multiplayer Komponenten
import QuestionCard from '../components/hacke-dicht-multiplayer/QuestionCard.vue'
import QuestionHeader from '../components/hacke-dicht-multiplayer/QuestionHeader.vue'
import AnswerFeedback from '../components/hacke-dicht-multiplayer/AnswerFeedback.vue'

export default {
  name: 'HackeDichtPlayMultiplayer',
  components: {
    GameHeader,
    LoadingView,
    GameNotFoundView,
    ProgressScreen,
    EventQuestionView,
    ResultsView,
    JokerMessageModal,
    AudioControls,
    JokersPanel,
    QuestionCard,
    QuestionHeader,
    AnswerFeedback
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
      currentLobby, currentPlayer, players, gameState, connectionStatus,
      createLobby: createLobbyAction, startGame: startGameAction,
      nextQuestion: nextQuestionAction, showAnswer: showAnswerAction,
      continueEvent: continueEventAction, continueFromProgress: continueFromProgressAction
    } = useLobby()
    
    // Audio System
    const {
      isAudioEnabled, isPlaying, stopAudio, toggleAudio, toggleAudioEnabled,
      playQuestionAudio, playCorrectAnswerAudio, playJokerAudio, playGameStartAudio, initAudio
    } = useAudio()

    // Game State
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

    // Timer Management
    const questionTimer = ref(null)
    const timeRemaining = ref(30)

    // Joker System
    const jokers = ref({
      fiftyFifty: { used: false },
      randomPerson: { used: false },
      reveal: { used: false }
    })
    const hiddenAnswers = ref([])
    const jokerMessage = ref(null)

    // Computed Properties
    const currentQuestionIndex = computed(() => {
      return gameState.value?.currentQuestionIndex || 0
    })

    const currentQuestion = computed(() => {
      if (!currentLobby.value?.gameData || showResults.value) return null
      return currentLobby.value.gameData.questions[currentQuestionIndex.value]
    })

    const currentReward = computed(() => {
      if (!currentLobby.value?.gameData) return null
      const questionNumber = currentQuestionIndex.value + 1
      if (questionNumber <= 5) return currentLobby.value.gameData.rewards[0]
      if (questionNumber <= 10) return currentLobby.value.gameData.rewards[1]
      return currentLobby.value.gameData.rewards[2]
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
    const currentVoteStats = computed(() => {
      if (!currentLobby.value) return { answerCounts: {}, percentages: {} }
      
      const votes = currentLobby.value.votes?.[currentQuestionIndex.value] || {}
      const totalVotes = Object.keys(votes).length
      const answerCounts = { 0: 0, 1: 0, 2: 0, 3: 0 }
      
      Object.values(votes).forEach(vote => {
        if (typeof vote.answer === 'number' && vote.answer >= 0 && vote.answer <= 3) {
          answerCounts[vote.answer]++
        }
      })
      
      const percentages = {}
      Object.keys(answerCounts).forEach(answer => {
        percentages[answer] = totalVotes > 0 ? 
          Math.round((answerCounts[answer] / totalVotes) * 100) : 0
      })
      
      return { totalVotes, answerCounts, percentages }
    })

    const votedPlayerCount = computed(() => {
      if (!currentLobby.value) return 0
      const votes = currentLobby.value.votes?.[currentQuestionIndex.value] || {}
      return Object.keys(votes).length
    })

    const allPlayersVoted = computed(() => {
      return votedPlayerCount.value >= realPlayerCount.value && realPlayerCount.value > 0
    })

    const getWrongPlayerCount = () => {
      const votes = currentLobby.value?.votes?.[currentQuestionIndex.value] || {}
      const correctAnswer = currentQuestion.value?.correctAnswer
      return Object.values(votes).filter(vote => vote.answer !== correctAnswer).length
    }

    // Timer Methods
    const startQuestionTimer = () => {
      console.log('🕐 Starte Question Timer')
      timeRemaining.value = 30
      
      if (questionTimer.value) {
        clearInterval(questionTimer.value)
      }
      
      questionTimer.value = setInterval(() => {
        timeRemaining.value--
        
        if (timeRemaining.value <= 0) {
          console.log('⏰ Zeit abgelaufen!')
          clearInterval(questionTimer.value)
          questionTimer.value = null
          
          // Auto-aufdecken wenn Host und noch in reading phase
          if (currentLobby.value && 
              currentPlayer.value?.isHost && 
              gamePhase.value === 'reading') {
            console.log('🔓 Auto-aufdecken als Host')
            setTimeout(() => {
              showAnswer()
            }, 1000)
          }
        }
      }, 1000)
    }

    const stopQuestionTimer = () => {
      if (questionTimer.value) {
        console.log('🛑 Stoppe Question Timer')
        clearInterval(questionTimer.value)
        questionTimer.value = null
      }
    }

    // QR Code & UI State
    const qrCanvas = ref(null)
    
    // Computed für Join URL
    const joinUrl = computed(() => {
      if (!currentLobby.value) return ''
      return `${window.location.origin}/#/play-mobile/${currentLobby.value.code}`
    })

    // QR Code Methods
    const generateQRCode = async () => {
      if (!qrCanvas.value || !joinUrl.value) return
      
      try {
        await QRCode.toCanvas(qrCanvas.value, joinUrl.value, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      } catch (error) {
        console.error('QR Code Fehler:', error)
      }
    }

    // Copy Methods
    const copyLobbyCode = async () => {
      if (!currentLobby.value) return
      
      try {
        await navigator.clipboard.writeText(currentLobby.value.code)
        success('Lobby-Code kopiert!')
      } catch (error) {
        showError('Kopieren fehlgeschlagen')
      }
    }

    const copyJoinUrl = async () => {
      try {
        await navigator.clipboard.writeText(joinUrl.value)
        success('Join-Link kopiert!')
      } catch (error) {
        showError('Kopieren fehlgeschlagen')
      }
    }

    // Lobby Methods
    const createLobby = async () => {
      if (!hostName.value.trim() || !game.value) {
        showError('Spiel wird noch geladen...')
        return
      }
      
      isCreatingLobby.value = true
      try {
        await createLobbyAction(props.gameId, hostName.value.trim(), game.value)
        success(`Lobby ${currentLobby.value.code} erstellt!`)
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
        
        setTimeout(() => {
          playGameStartAudio()
        }, 1000)
        
      } catch (error) {
        showError('Fehler beim Starten: ' + error.message)
      } finally {
        isStartingGame.value = false
      }
    }


    // Game Flow Methods
    const continueFromProgress = async () => {
      console.log('▶️ Continue from progress')
      try {
        await continueFromProgressAction()
        playQuestionAudio(currentQuestionIndex.value + 1)
      } catch (error) {
        showError('Fehler beim Fortsetzen: ' + error.message)
      }
    }

    const showAnswer = async () => {
      console.log('🔍 Show Answer')
      try {
        await showAnswerAction()
        stopQuestionTimer()
        stopAudio()
        playCorrectAnswerAudio()
      } catch (error) {
        showError('Fehler beim Anzeigen der Antwort: ' + error.message)
      }
    }

    const nextQuestion = async () => {
      console.log('➡️ Next Question')
      try {
        hiddenAnswers.value = []
        await nextQuestionAction()
      } catch (error) {
        showError('Fehler bei nächster Frage: ' + error.message)
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

    const continueAfterEvent = async () => {
      console.log('📄 Continue after event')
      try {
        await continueEventAction()
      } catch (error) {
        showError('Fehler beim Event fortsetzen: ' + error.message)
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
      
      stopAudio()
      setTimeout(() => {
        playGameStartAudio()
      }, 500)
    }

    const handleBackToGallery = () => {
      stopAudio()
      stopQuestionTimer()
      router.push('/hacke-dicht/gallery')
    }

    // Joker Handling
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
      
      console.log('🔄 GameState Update:', {
        phase: newState.phase,
        questionIndex: newState.currentQuestionIndex,
        showProgressScreen: newState.showProgressScreen,
        showEventQuestion: newState.showEventQuestion
      })
      
      // currentQuestionIndex wird jetzt über gameState synchronisiert
      
      // Event Phase
      if (newState.phase === 'event') {
        console.log('🎭 Switching to event phase')
        if (newState.currentEventQuestion) {
          currentEventQuestion.value = newState.currentEventQuestion
          eventQueue.value = newState.eventQueue || []
          showEventQuestion.value = true
          showProgressScreen.value = false
          gamePhase.value = 'event'
          stopQuestionTimer()
          stopAudio()
        }
      }
      // Progress Phase  
      else if (newState.phase === 'progress') {
        console.log('📊 Switching to progress phase')
        showProgressScreen.value = true
        showEventQuestion.value = false
        gamePhase.value = 'progress'
        stopQuestionTimer()
        stopAudio()
      }
      // Voting Phase
      else if (newState.phase === 'voting' && gamePhase.value !== 'reading') {
        console.log('🎯 Switching to reading phase')
        gamePhase.value = 'reading'
        showProgressScreen.value = false
        showEventQuestion.value = false
        startQuestionTimer()
      } 
      // Results Phase
      else if (newState.phase === 'results') {
        console.log('📊 Switching to results phase') 
        gamePhase.value = 'showing_answer'
        stopQuestionTimer()
      } 
      // Finished Phase
      else if (newState.phase === 'finished') {
        console.log('🏁 Game finished')
        showResults.value = true
        showProgressScreen.value = false
        showEventQuestion.value = false
        stopQuestionTimer()
      }
    }, { deep: true })

    onMounted(() => {
      initializeGame()
    })

    // QR Code Watcher - generiert QR Code wenn Lobby erstellt wird
    watch(() => currentLobby.value, async (newLobby) => {
      if (newLobby && newLobby.status === 'waiting') {
        await nextTick()
        generateQRCode()
      }
    }, { immediate: true })

    onUnmounted(() => {
      stopAudio()
      stopQuestionTimer()
    })

    return {
      // State
      isLoading, game, currentLobby, currentPlayer, players, connectionStatus,
      hostName, isCreatingLobby, isStartingGame,
      currentQuestion, currentQuestionIndex, gamePhase,
      showResults, showEventQuestion, showProgressScreen,
      currentEventQuestion, currentReward, isLastQuestion,
      jokers, hiddenAnswers, jokerMessage,
      timeRemaining,
      
      // QR Code
      qrCanvas, joinUrl,
      
      // Audio
      isAudioEnabled, isPlaying,
      
      // Computed
      realPlayerCount, currentVoteStats, votedPlayerCount, allPlayersVoted,
      
      // Methods
      createLobby, startGame, copyLobbyCode, copyJoinUrl,
      continueFromProgress, showAnswer, nextQuestion,
      continueAfterEvent, restartGame, handleBackToGallery,
      handleJokerUse, clearJokerMessage, getWrongPlayerCount,
      
      // Audio Methods
      toggleAudio, toggleAudioEnabled,
      
      // Utils
      window
    }
  }
}
</script>