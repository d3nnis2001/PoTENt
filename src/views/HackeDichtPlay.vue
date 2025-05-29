<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <GameHeader 
        :game-name="game?.name || 'Wer wird hacke dicht?'"
        @back="$router.push('/hacke-dicht/gallery')"
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

      <ResultsView
        v-else-if="showResults"
        @restart="restartGame"
        @back-to-gallery="$router.push('/hacke-dicht/gallery')"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { hackeDichtStore } from '../store/hackeDichtStore'
import { playerStore } from '../store/playerStore'

// Import Components
import GameHeader from '../components/hacke-dicht/GameHeader.vue'
import PasswordBlockedView from '../components/hacke-dicht/PasswordBlockedView.vue'
import LoadingView from '../components/hacke-dicht/LoadingView.vue'
import GameNotFoundView from '../components/hacke-dicht/GameNotFoundView.vue'
import ProgressScreen from '../components/hacke-dicht/ProgressScreen.vue'
import EventQuestionView from '../components/hacke-dicht/EventQuestionView.vue'
import ResultsView from '../components/hacke-dicht/ResultsView.vue'
import QuestionView from '../components/hacke-dicht/QuestionView.vue'
import JokerMessageModal from '../components/hacke-dicht/JokerMessageModal.vue'

export default {
  name: 'HackeDichtPlay',
  components: {
    GameHeader,
    PasswordBlockedView,
    LoadingView,
    GameNotFoundView,
    ProgressScreen,
    EventQuestionView,
    ResultsView,
    QuestionView,
    JokerMessageModal
  },
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    
    // Reactive state
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

    // Joker system
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

    // Game access check
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

    // Game flow methods
    const continueFromProgress = () => {
      showProgressScreen.value = false
      gamePhase.value = 'reading'
    }

    const showAnswer = () => {
      gamePhase.value = 'showing_answer'
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
      } else {
        currentQuestionIndex.value++
        showProgressScreen.value = true
        gamePhase.value = 'progress'
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
    }

    // Joker handling
    const handleJokerUse = (jokerType) => {
      if (gamePhase.value !== 'reading') return

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
      
      const players = playerStore.getPlayerNames()
      if (players.length === 0) {
        jokerMessage.value = {
          type: 'randomPerson',
          title: 'Random Person Joker aktiviert!',
          text: 'Keine Spieler verfügbar. Ihr müsst selbst entscheiden!'
        }
        return
      }
      
      const randomPlayer = players[Math.floor(Math.random() * players.length)]
      
      jokerMessage.value = {
        type: 'randomPerson',
        title: 'Random Person Joker aktiviert!',
        text: `${randomPlayer} muss ihre/seine Antwort preisgeben und erklären, warum sie/er diese Wahl getroffen hat!`
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

    // Initialize game
    const initializeGame = async () => {
      isLoading.value = true
      
      try {
        await hackeDichtStore.loadGames()
        await playerStore.loadPlayers()
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

      } catch (error) {
        console.error('Error loading game:', error)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      initializeGame()
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
      
      // Methods
      continueFromProgress,
      showAnswer,
      nextQuestion,
      continueAfterEvent,
      restartGame,
      handleJokerUse,
      clearJokerMessage
    }
  }
}
</script>