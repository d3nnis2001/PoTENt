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
        :game-name="game?.name || 'AI Takes Over'"
        @back="handleBackToGallery"
      />

      <PasswordBlockedView 
        v-if="needsPassword" 
        @go-to-gallery="$router.push('/ai-takes-over/gallery')"
      />

      <LoadingView v-else-if="isLoading" message="Lade AI Quiz..." />

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
        :jokers="jokers"
        :selected-answer="selectedAnswer"
        :has-voted-final="hasVotedFinal"
        :submitting-vote="submittingVote"
        :game-phase="gamePhase"
        :hidden-answers="hiddenAnswers"
        :is-last-question="isLastQuestion"
        @select-answer="selectAnswer"
        @submit-final-vote="submitFinalVote"
        @use-joker="handleJokerUse"
        @show-answer="showAnswer"
        @next-question="nextQuestion"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { aiTakesOverStore } from '../store/aiTakesOverStore'
import { useAudio } from '../composables/useAudio'
import { globalToast } from '../composables/useToast'

// Import Components (reuse the same components from hacke-dicht)
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
  name: 'AiTakesOverPlay',
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
    const { success, error: showError } = globalToast
    
    // Audio System
    const {
      isAudioEnabled, isPlaying, stopAudio, toggleAudio, toggleAudioEnabled,
      playQuestionAudio, playCorrectAnswerAudio, playJokerAudio, playGameStartAudio, initAudio
    } = useAudio()

    // Game State
    const isLoading = ref(true)
    const needsPassword = ref(false)
    const game = ref(null)
    const currentQuestionIndex = ref(0)
    const gamePhase = ref('progress')
    const showResults = ref(false)
    const showEventQuestion = ref(false)
    const showProgressScreen = ref(true)
    const currentEventQuestion = ref(null)
    const eventQueue = ref([])

    // Question State
    const selectedAnswer = ref(null)
    const hasVotedFinal = ref(false)
    const submittingVote = ref(false)

    // Joker System
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

    // Game Flow Methods
    const continueFromProgress = () => {
      console.log('▶️ Continue from progress')
      const events = game.value.eventQuestions[currentQuestionIndex.value + 1] || []
      if (events.length > 0) {
        eventQueue.value = [...events]
        showNextEvent()
      } else {
        proceedToQuestion()
      }
    }

    const proceedToQuestion = () => {
      showProgressScreen.value = false
      showEventQuestion.value = false
      gamePhase.value = 'reading'
      playQuestionAudio(currentQuestionIndex.value + 1)
    }

    const showNextEvent = () => {
      if (eventQueue.value.length > 0) {
        currentEventQuestion.value = eventQueue.value.shift()
        showEventQuestion.value = true
        gamePhase.value = 'event'
        stopAudio()
      } else {
        proceedToQuestion()
      }
    }

    const continueAfterEvent = () => {
      console.log('📄 Continue after event')
      showNextEvent()
    }

    const selectAnswer = (answerIndex) => {
      if (hasVotedFinal.value || hiddenAnswers.value.includes(answerIndex)) return
      selectedAnswer.value = answerIndex
    }

    const submitFinalVote = () => {
      if (submittingVote.value || hasVotedFinal.value || selectedAnswer.value === null) return
      
      submittingVote.value = true
      
      setTimeout(() => {
        hasVotedFinal.value = true
        submittingVote.value = false
        success('Antwort bestätigt!')
      }, 500)
    }

    const showAnswer = () => {
      console.log('🔍 Show Answer')
      gamePhase.value = 'showing_answer'
      stopAudio()
      playCorrectAnswerAudio()
    }

    const nextQuestion = () => {
      console.log('➡️ Next Question')
      if (isLastQuestion.value) {
        showResults.value = true
        stopAudio()
      } else {
        currentQuestionIndex.value++
        selectedAnswer.value = null
        hasVotedFinal.value = false
        hiddenAnswers.value = []
        showProgressScreen.value = true
        gamePhase.value = 'progress'
        stopAudio()
      }
    }

    const restartGame = () => {
      currentQuestionIndex.value = 0
      selectedAnswer.value = null
      hasVotedFinal.value = false
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
      router.push('/ai-takes-over/gallery')
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
        title: 'AI-Filter aktiviert!',
        text: `Die KI hat zwei falsche Antworten eliminiert. Nur noch zwei Optionen übrig!`
      }
    }

    const useRandomPersonJoker = () => {
      if (jokers.value.randomPerson.used) return
      
      jokers.value.randomPerson.used = true
      
      jokerMessage.value = {
        type: 'randomPerson',
        title: 'KI-Zufallsanalyse aktiviert!',
        text: 'Die KI analysiert zufällige Muster... Leider sind keine anderen Spieler da!'
      }
    }

    const useRevealJoker = () => {
      if (jokers.value.reveal.used) return
      
      jokers.value.reveal.used = true
      
      jokerMessage.value = {
        type: 'reveal',
        title: 'KI-Transparenz aktiviert!',
        text: 'Die KI zeigt alle versteckten Informationen... aber du spielst alleine!'
      }
    }

    const clearJokerMessage = () => {
      jokerMessage.value = null
    }

    // Initialize Game
    const initializeGame = async () => {
      isLoading.value = true
      
      try {
        await aiTakesOverStore.loadGames()
        const gameData = aiTakesOverStore.getGame(parseInt(props.gameId))
        
        if (!gameData) {
          console.error('Game not found')
          return
        }

        // Check if password protected and if we have access
        if (gameData.isProtected && !aiTakesOverStore.hasValidSession(parseInt(props.gameId))) {
          needsPassword.value = true
          return
        }

        game.value = gameData
        initAudio()
        
        setTimeout(() => {
          playGameStartAudio()
        }, 1000)
        
      } catch (error) {
        console.error('Error loading game:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Keyboard Handler
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        
        if (showProgressScreen.value) {
          continueFromProgress()
        }
        else if (showEventQuestion.value) {
          continueAfterEvent()
        }
        else if (gamePhase.value === 'showing_answer') {
          nextQuestion()
        }
        else if (gamePhase.value === 'reading' && hasVotedFinal.value) {
          showAnswer()
        }
      }
    }

    onMounted(() => {
      initializeGame()
      window.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      stopAudio()
      window.removeEventListener('keydown', handleKeyPress)
    })

    return {
      // State
      isLoading, needsPassword, game,
      currentQuestionIndex, gamePhase,
      showResults, showEventQuestion, showProgressScreen,
      currentEventQuestion, currentQuestion, currentReward, isLastQuestion,
      selectedAnswer, hasVotedFinal, submittingVote,
      jokers, hiddenAnswers, jokerMessage,
      
      // Audio
      isAudioEnabled, isPlaying,
      
      // Methods
      continueFromProgress, continueAfterEvent,
      selectAnswer, submitFinalVote, showAnswer, nextQuestion,
      restartGame, handleBackToGallery,
      handleJokerUse, clearJokerMessage,
      
      // Audio Methods
      toggleAudio, toggleAudioEnabled
    }
  }
}
</script>