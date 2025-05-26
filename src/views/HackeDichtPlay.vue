<template>
  <div class="min-h-screen p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6">
        <button
          @click="$router.push('/hacke-dicht/gallery')"
          class="text-purple-200 hover:text-white mb-4 inline-flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Zurück zur Galerie
        </button>
        <h1 class="text-2xl font-bold text-white mb-2">{{ game?.name || 'Wer wird hacke dicht?' }}</h1>
        
        <!-- Progress -->
        <div v-if="!showResults" class="flex items-center justify-center gap-4 mb-4">
          <span class="text-orange-200">Frage {{ currentQuestionIndex + 1 }} von 15</span>
          <div class="w-64 bg-white/20 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <span class="text-orange-200">{{ Math.round(progress) }}%</span>
        </div>

        <!-- Current Reward -->
        <div v-if="!showResults && currentReward" class="flex items-center justify-center gap-2 mb-4">
          <span class="text-orange-200 text-sm">Bei falscher Antwort:</span>
          <div class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
            <img v-if="currentReward.image" :src="currentReward.image" :alt="currentReward.name" class="w-6 h-6 object-cover rounded-full">
            <span class="text-white font-medium">{{ currentReward.name }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="text-white mt-2">Lade Quiz...</p>
      </div>

      <!-- Game Not Found -->
      <div v-else-if="!game" class="text-center py-12">
        <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <h2 class="text-xl font-semibold text-white mb-2">Quiz nicht gefunden</h2>
        <p class="text-orange-200">Das angeforderte Quiz existiert nicht oder wurde gelöscht.</p>
      </div>

      <!-- Event Question Display -->
      <div v-else-if="showEventQuestion" class="text-center">
        <div class="bg-yellow-600/20 backdrop-blur-lg rounded-xl p-8 border border-yellow-400/30 mb-6">
          <div class="flex items-center justify-center gap-2 mb-6">
            <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <h2 class="text-2xl font-bold text-white">Ereignis!</h2>
          </div>
          <p class="text-white text-lg leading-relaxed mb-6">{{ currentEventQuestion.text }}</p>
          <button
            @click="continueAfterEvent"
            class="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Weiter
          </button>
        </div>
      </div>

      <!-- Results Screen -->
      <div v-else-if="showResults" class="text-center">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-6">
          <div class="mb-6">
            <svg class="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 class="text-3xl font-bold text-white mb-4">Quiz beendet!</h2>
            <p class="text-orange-200 text-lg">Du hast {{ correctAnswers }}/15 Fragen richtig beantwortet!</p>
          </div>

          <!-- Score breakdown -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-green-600/20 rounded-lg p-4">
              <div class="text-2xl font-bold text-green-400">{{ correctAnswers }}</div>
              <div class="text-green-200 text-sm">Richtig</div>
            </div>
            <div class="bg-red-600/20 rounded-lg p-4">
              <div class="text-2xl font-bold text-red-400">{{ 15 - correctAnswers }}</div>
              <div class="text-red-200 text-sm">Falsch</div>
            </div>
            <div class="bg-orange-600/20 rounded-lg p-4">
              <div class="text-2xl font-bold text-orange-400">{{ Math.round((correctAnswers / 15) * 100) }}%</div>
              <div class="text-orange-200 text-sm">Score</div>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button
              @click="restartGame"
              class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all"
            >
              Nochmal spielen
            </button>
            <button
              @click="$router.push('/hacke-dicht/gallery')"
              class="bg-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/30 transition-all"
            >
              Zurück zur Galerie
            </button>
          </div>
        </div>
      </div>

      <!-- Current Question -->
      <div v-else-if="currentQuestion" class="space-y-6">
        <!-- Question Card -->
        <div class="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 class="text-xl font-bold text-white mb-6 text-center">
            Frage {{ currentQuestionIndex + 1 }}
          </h2>
          <p class="text-white text-lg leading-relaxed text-center mb-8">
            {{ currentQuestion.question }}
          </p>

          <!-- Answer Options -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              v-for="(answer, index) in currentQuestion.answers"
              :key="index"
              @click="selectAnswer(index)"
              :disabled="selectedAnswer !== null"
              :class="getAnswerButtonClass(index)"
              class="p-4 rounded-lg font-medium transition-all duration-300 text-left flex items-center gap-3 min-h-[60px]"
            >
              <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">
                {{ String.fromCharCode(65 + index) }}
              </span>
              <span class="flex-1">{{ answer.text }}</span>
            </button>
          </div>

          <!-- Continue Button -->
          <div v-if="selectedAnswer !== null" class="text-center mt-6">
            <button
              @click="nextQuestion"
              class="bg-white text-orange-600 py-3 px-8 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              {{ isLastQuestion ? 'Quiz beenden' : 'Nächste Frage' }}
            </button>
          </div>
        </div>

        <!-- Answer Feedback -->
        <div v-if="selectedAnswer !== null" class="text-center">
          <div v-if="isCorrectAnswer" class="text-green-400 text-lg font-semibold">
            ✅ Richtig! Gut gemacht!
          </div>
          <div v-else class="space-y-2">
            <div class="text-red-400 text-lg font-semibold">
              ❌ Falsch! Die richtige Antwort war {{ String.fromCharCode(65 + currentQuestion.correctAnswer) }}
            </div>
            <div v-if="currentReward" class="flex items-center justify-center gap-2 text-orange-200">
              <span>Zeit zu trinken:</span>
              <div class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <img v-if="currentReward.image" :src="currentReward.image" :alt="currentReward.name" class="w-6 h-6 object-cover rounded-full">
                <span class="text-white font-medium">{{ currentReward.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { hackeDichtStore } from '../store/hackeDichtStore'

export default {
  name: 'HackeDichtPlay',
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const isLoading = ref(true)
    const game = ref(null)
    const currentQuestionIndex = ref(0)
    const selectedAnswer = ref(null)
    const correctAnswers = ref(0)
    const showResults = ref(false)
    const showEventQuestion = ref(false)
    const currentEventQuestion = ref(null)
    const eventQueue = ref([])

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

    const progress = computed(() => {
      if (showResults.value) return 100
      return ((currentQuestionIndex.value + 1) / 15) * 100
    })

    const isLastQuestion = computed(() => {
      return currentQuestionIndex.value >= 14
    })

    const isCorrectAnswer = computed(() => {
      return selectedAnswer.value === currentQuestion.value?.correctAnswer
    })

    const getAnswerButtonClass = (index) => {
      if (selectedAnswer.value === null) {
        return 'bg-white/20 text-white hover:bg-white/30 border-2 border-transparent'
      }
      
      if (index === currentQuestion.value.correctAnswer) {
        return 'bg-green-600 text-white border-2 border-green-400'
      } else if (index === selectedAnswer.value) {
        return 'bg-red-600 text-white border-2 border-red-400'
      } else {
        return 'bg-white/10 text-white/60 border-2 border-transparent'
      }
    }

    const selectAnswer = (answerIndex) => {
      if (selectedAnswer.value !== null) return
      
      selectedAnswer.value = answerIndex
      if (isCorrectAnswer.value) {
        correctAnswers.value++
      }
    }

    const nextQuestion = () => {
      // Check for event questions after current question
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
        selectedAnswer.value = null
      }
    }

    const restartGame = () => {
      currentQuestionIndex.value = 0
      selectedAnswer.value = null
      correctAnswers.value = 0
      showResults.value = false
      showEventQuestion.value = false
      currentEventQuestion.value = null
      eventQueue.value = []
    }

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
      isLoading,
      game,
      currentQuestion,
      currentQuestionIndex,
      selectedAnswer,
      correctAnswers,
      showResults,
      showEventQuestion,
      currentEventQuestion,
      currentReward,
      progress,
      isLastQuestion,
      isCorrectAnswer,
      getAnswerButtonClass,
      selectAnswer,
      nextQuestion,
      continueAfterEvent,
      restartGame
    }
  }
}
</script>