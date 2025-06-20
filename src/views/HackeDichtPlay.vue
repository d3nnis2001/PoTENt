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
        :game-name="game?.name || 'Wer wird hacke dicht?'"
        @back="handleBackToGallery"
      />

      <PasswordBlockedView 
        v-if="needsPassword" 
        @go-to-gallery="$router.push('/hacke-dicht/gallery')"
      />

      <LoadingView v-else-if="isLoading" message="Lade Quiz..." />

      <GameNotFoundView v-else-if="!game" />

      <ProgressScreen 
        v-else-if="showProgressScreen"
        :game="game"
        :current-question-index="currentQuestionIndex"
        @continue="continueFromProgress"
      />

      <EventQuestionView
        v-else-if="showEventQuestion"
        :event-question="currentEventQuestion"
        @continue="continueAfterEvent"
      />

      <LeaderboardView
        v-else-if="showResults"
        :player-stats="{}"
        @restart="restartGame"
        @back-to-gallery="handleBackToGallery"
      />

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

      <JokerMessageModal
        v-if="jokerMessage"
        :joker-message="jokerMessage"
        @close="clearJokerMessage"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { hackeDichtStore } from '../store/hackeDichtStore'
import { useAudio } from '../composables/useAudio'

// Import bestehende Komponenten
import GameHeader from '../components/hacke-dicht/GameHeader.vue'
import PasswordBlockedView from '../components/hacke-dicht/PasswordBlockedView.vue'
import LoadingView from '../components/hacke-dicht/LoadingView.vue'
import GameNotFoundView from '../components/hacke-dicht/GameNotFoundView.vue'
import ProgressScreen from '../components/hacke-dicht/ProgressScreen.vue'
import EventQuestionView from '../components/hacke-dicht/EventQuestionView.vue'
import LeaderboardView from '../components/hacke-dicht/LeaderboardView.vue'
import QuestionView from '../components/hacke-dicht/QuestionView.vue'
import JokerMessageModal from '../components/hacke-dicht/JokerMessageModal.vue'
import AudioControls from '../components/AudioControls.vue'

export default {
  name: 'HackeDichtPlay',
  components: {
    GameHeader,
    PasswordBlockedView,
    LoadingView,
    GameNotFoundView,
    ProgressScreen,
    EventQuestionView,
    LeaderboardView,
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
    
    // Audio System
    const {
      isAudioEnabled,
      isPlaying,
      stopAudio,
      toggleAudio,
      toggleAudioEnabled,
      playQuestionAudio,
      playCorrectAnswerAudio,
      playJokerAudio,
      playGameStartAudio,
      initAudio
    } = useAudio()
    
    // REINER SINGLE-PLAYER STATE (keine Lobby)
    const isLoading = ref(true)
    const game = ref(null)
    const needsPassword = ref(false)
    const currentQuestionIndex = ref(0)
    const gamePhase = ref('progress') // 'progress', 'reading', 'showing_answer'
    const showResults = ref(false)
    const showEventQuestion = ref(false)
    const showProgressScreen = ref(true)
    const currentEventQuestion = ref(null)
    const eventQueue = ref([])

    // Joker system (Single-Player)
    const jokers = ref({
      fiftyFifty: { used: false },
      randomPerson: { used: false },
      reveal: { used: false }
    })
    const hiddenAnswers = ref([])
    const jokerMessage = ref(null)

    // Computed properties
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

    // Game access check (vereinfacht ohne passwordUtils)
    const checkGameAccess = () => {
      if (!game.value) return false
      if (!game.value.isProtected) return true
      
      const sessionKey = `session_${props.gameId}`
      try {
        const sessionData = localStorage.getItem(sessionKey)
        if (sessionData) {
          const session = JSON.parse(sessionData)
          const now = Date.now()
          const sessionAge = now - session.timestamp
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours

          if (sessionAge < maxAge && session.gameId == props.gameId) {
            return true
          } else {
            localStorage.removeItem(sessionKey)
          }
        }
      } catch {
        localStorage.removeItem(sessionKey)
      }
      
      return false
    }

    // PURE SINGLE-PLAYER GAME FLOW (keine Lobby-Kommunikation)
    const continueFromProgress = () => {
      showProgressScreen.value = false
      gamePhase.value = 'reading'
      
      // Audio für die aktuelle Frage starten
      const questionNumber = currentQuestionIndex.value + 1
      playQuestionAudio(questionNumber)
    }

    const showAnswer = () => {
      gamePhase.value = 'showing_answer'
      
      // Hintergrundmusik stoppen und Richtige-Antwort-Sound spielen
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
      router.push('/hacke-dicht/gallery')
    }

    // SINGLE-PLAYER JOKER HANDLING (ohne echte Spieler)
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
      
      // SINGLE-PLAYER VERSION - kein echter Spieler
      const fakePlayerNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Robin', 'Casey']
      const randomPlayer = fakePlayerNames[Math.floor(Math.random() * fakePlayerNames.length)]
      
      jokerMessage.value = {
        type: 'randomPerson',
        title: 'Random Person Joker aktiviert!',
        text: `${randomPlayer} würde jetzt ihre/seine Antwort preisgeben müssen! (Single-Player Modus)`
      }
    }

    const useRevealJoker = () => {
      if (jokers.value.reveal.used) return
      
      jokers.value.reveal.used = true
      
      jokerMessage.value = {
        type: 'reveal',
        title: 'Reveal Joker aktiviert!',
        text: 'Alle Spieler würden jetzt ihre Karten aufdecken! (Single-Player Modus)'
      }
    }

    const clearJokerMessage = () => {
      jokerMessage.value = null
    }

    // Initialize game (OHNE LOBBY)
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

        if (!checkGameAccess()) {
          needsPassword.value = true
          setTimeout(() => {
            router.push('/hacke-dicht/gallery')
          }, 3000)
          return
        }

        // Audio beim Start initialisieren
        initAudio()
        
        // Spiel-Start Audio nach kurzer Verzögerung
        setTimeout(() => {
          playGameStartAudio()
        }, 1000)

      } catch (error) {
        console.error('Error loading game:', error)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      initializeGame()
    })
    
    // Provide dummy player list for tag parsing in single player
    provide('playerList', ['Max', 'Lisa', 'Tom', 'Anna', 'Ben', 'Sara'])

    onUnmounted(() => {
      stopAudio()
    })

    return {
      // State
      isLoading,
      game,
      needsPassword,
      currentQuestion,
      currentQuestionIndex,
      gamePhase,
      showResults,
      showEventQuestion,
      showProgressScreen,
      currentEventQuestion,
      currentReward,
      isLastQuestion,
      jokers,
      hiddenAnswers,
      jokerMessage,
      
      // Audio State
      isAudioEnabled,
      isPlaying,
      
      // Methods
      continueFromProgress,
      showAnswer,
      nextQuestion,
      continueAfterEvent,
      restartGame,
      handleJokerUse,
      clearJokerMessage,
      handleBackToGallery,
      
      // Audio Methods
      toggleAudio,
      toggleAudioEnabled
    }
  }
}
</script>