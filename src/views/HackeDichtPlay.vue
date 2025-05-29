<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
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
        <h1 class="text-3xl font-bold text-white mb-2">{{ game?.name || 'Wer wird hacke dicht?' }}</h1>
      </div>

      <div v-if="needsPassword" class="flex justify-center items-center min-h-[60vh]">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-md text-center">
          <svg class="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <h2 class="text-xl font-bold text-white mb-2">Quiz ist gesperrt</h2>
          <p class="text-orange-200 mb-6">Dieses Quiz ist passwortgeschützt. Du wirst zur Galerie weitergeleitet.</p>
          <button
            @click="$router.push('/hacke-dicht/gallery')"
            class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all"
          >
            Zur Galerie
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="text-center py-8">
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

      <!-- Progress Screen (Millionär-Style) -->
      <div v-else-if="showProgressScreen" class="h-[80vh] flex items-center justify-center">
        <div class="flex items-center gap-8 w-full max-w-6xl">
          <!-- Drinks Column (Left Side) -->
          <div class="flex flex-col justify-center space-y-6 min-w-[180px]">
            <!-- Drink 3 (Questions 11-15) -->
            <div class="flex items-center justify-center">
              <div class="flex items-center gap-2 p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg border-2 border-red-400/50">
                <div class="w-8 h-8 flex-shrink-0">
                  <img 
                    v-if="game.rewards[2]?.image" 
                    :src="game.rewards[2].image" 
                    :alt="game.rewards[2].name" 
                    class="w-full h-full object-cover rounded"
                  >
                  <div v-else class="w-full h-full bg-white/20 rounded flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <span class="text-white font-bold text-xs">{{ game.rewards[2]?.name || 'Belohnung 3' }}</span>
              </div>
            </div>

            <!-- Spacer for middle questions -->
            <div class="h-4"></div>

            <!-- Drink 2 (Questions 6-10) -->
            <div class="flex items-center justify-center">
              <div class="flex items-center gap-2 p-2 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg shadow-lg border-2 border-orange-400/50">
                <div class="w-8 h-8 flex-shrink-0">
                  <img 
                    v-if="game.rewards[1]?.image" 
                    :src="game.rewards[1].image" 
                    :alt="game.rewards[1].name" 
                    class="w-full h-full object-cover rounded"
                  >
                  <div v-else class="w-full h-full bg-white/20 rounded flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <span class="text-white font-bold text-xs">{{ game.rewards[1]?.name || 'Belohnung 2' }}</span>
              </div>
            </div>

            <!-- Spacer for bottom questions -->
            <div class="h-4"></div>

            <!-- Drink 1 (Questions 1-5) -->
            <div class="flex items-center justify-center">
              <div class="flex items-center gap-2 p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg border-2 border-green-400/50">
                <div class="w-8 h-8 flex-shrink-0">
                  <img 
                    v-if="game.rewards[0]?.image" 
                    :src="game.rewards[0].image" 
                    :alt="game.rewards[0].name" 
                    class="w-full h-full object-cover rounded"
                  >
                  <div v-else class="w-full h-full bg-white/20 rounded flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <span class="text-white font-bold text-xs">{{ game.rewards[0]?.name || 'Belohnung 1' }}</span>
              </div>
            </div>
          </div>

          <!-- Question Ladder (Right Side) -->
          <div class="flex-1 space-y-1 max-w-lg ml-auto">
            <!-- Questions 11-15 (Top) - Red Border -->
            <div class="space-y-0.5 mb-1 p-2 rounded-md border border-red-400/30 bg-red-600/10">
              <div 
                v-for="level in [15, 14, 13, 12, 11]" 
                :key="level"
                class="flex items-center justify-between px-2 py-1 rounded transition-all duration-300 text-xs"
                :class="getProgressLevelClass(level)"
              >
                <div class="flex items-center gap-2">
                  <span class="font-bold min-w-[20px]">{{ level }}</span>
                  <span>Frage {{ level }}</span>
                </div>
                <div class="font-bold">{{ game.rewards[2]?.name || 'Belohnung 3' }}</div>
              </div>
            </div>

            <!-- Questions 6-10 (Middle) - Orange Border -->
            <div class="space-y-0.5 mb-1 p-2 rounded-md border border-orange-400/30 bg-orange-600/10">
              <div 
                v-for="level in [10, 9, 8, 7, 6]" 
                :key="level"
                class="flex items-center justify-between px-2 py-1 rounded transition-all duration-300 text-xs"
                :class="getProgressLevelClass(level)"
              >
                <div class="flex items-center gap-2">
                  <span class="font-bold min-w-[20px]">{{ level }}</span>
                  <span>Frage {{ level }}</span>
                </div>
                <div class="font-bold">{{ game.rewards[1]?.name || 'Belohnung 2' }}</div>
              </div>
            </div>

            <!-- Questions 1-5 (Bottom) - Green Border -->
            <div class="space-y-0.5 p-2 rounded-md border border-green-400/30 bg-green-600/10">
              <div 
                v-for="level in [5, 4, 3, 2, 1]" 
                :key="level"
                class="flex items-center justify-between px-2 py-1 rounded transition-all duration-300 text-xs"
                :class="getProgressLevelClass(level)"
              >
                <div class="flex items-center gap-2">
                  <span class="font-bold min-w-[20px]">{{ level }}</span>
                  <span>Frage {{ level }}</span>
                </div>
                <div class="font-bold">{{ game.rewards[0]?.name || 'Belohnung 1' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Continue Button -->
        <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            @click="continueFromProgress"
            class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-lg font-bold text-xl hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-2xl"
          >
            {{ currentQuestionIndex === 0 ? 'Spiel starten' : 'Weiter zur nächsten Frage' }}
          </button>
        </div>
      </div>

      <!-- Event Question Display with Cool Animation -->
      <div v-else-if="showEventQuestion" class="h-[75vh] flex justify-center items-center relative overflow-hidden">
        <!-- Background Lightning Effect -->
        <div class="absolute inset-0 bg-yellow-400/10" style="animation: slowPulse 3s ease-in-out infinite;"></div>
        <div class="absolute inset-0 opacity-30">
          <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-600/20 via-transparent to-yellow-600/20" style="animation: slowPulse 4s ease-in-out infinite;"></div>
          <!-- Lightning Bolts -->
          <svg class="absolute top-10 left-10 w-16 h-16 text-yellow-400 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <svg class="absolute top-20 right-20 w-12 h-12 text-yellow-300" style="animation: slowPulse 2.5s ease-in-out infinite;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <svg class="absolute bottom-20 left-20 w-20 h-20 text-yellow-500 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <svg class="absolute bottom-10 right-10 w-14 h-14 text-yellow-400" style="animation: slowPulse 3.5s ease-in-out infinite;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>

        <!-- Event Content -->
        <div class="relative z-10 bg-gradient-to-br from-yellow-600/30 to-yellow-700/30 backdrop-blur-lg rounded-xl p-8 border-2 border-yellow-400/50 max-w-4xl shadow-2xl">
          <div class="flex items-center justify-center gap-4 mb-6">
            <svg class="w-16 h-16 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <h2 class="text-4xl font-bold text-white animate-bounce">EREIGNIS!</h2>
            <svg class="w-16 h-16 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="text-center p-6 bg-black/20 rounded-lg mb-8">
            <p class="text-white text-2xl leading-relaxed font-medium">{{ currentEventQuestion.text }}</p>
          </div>
          <div class="text-center">
            <button
              @click="continueAfterEvent"
              class="bg-yellow-600 hover:bg-yellow-700 text-black py-4 px-8 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Weiter zum Spiel
            </button>
          </div>
        </div>
      </div>

      <!-- Results Screen -->
      <div v-else-if="showResults" class="flex justify-center items-center min-h-[70vh]">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-2xl text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 class="text-4xl font-bold text-white mb-4">Quiz beendet!</h2>
            <p class="text-orange-200 text-xl">Du hast alle 15 Fragen geschafft! 🎉</p>
            <p class="text-orange-200 text-lg mt-2">Zeit für den finalen Drink! 🍻</p>
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

      <!-- Question Display -->
      <div v-else-if="currentQuestion" class="space-y-6">
        <!-- Jokers Display -->
        <div class="fixed top-4 left-4 z-40 flex flex-col gap-3">
          <!-- 50/50 Joker -->
          <button
            @click="use5050Joker"
            :disabled="jokers.fiftyFifty.used || gamePhase !== 'reading'"
            :class="[
              'p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center',
              jokers.fiftyFifty.used 
                ? 'bg-gray-600/30 border-gray-400/30 opacity-50 cursor-not-allowed' 
                : 'bg-blue-600/30 border-blue-400/50 hover:bg-blue-600/50 cursor-pointer'
            ]"
            title="50/50 Joker - Entfernt 2 falsche Antworten"
          >
            <div class="relative">
              <img :src="joker50" alt="Joker 50/50" class="w-14 h-14" />
              <!-- Durchstrich wenn benutzt -->
              <div v-if="jokers.fiftyFifty.used" class="absolute inset-0 flex items-center justify-center">
                <div class="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                <div class="absolute w-full h-0.5 bg-red-500 transform -rotate-45"></div>
              </div>
            </div>
          </button>

          <!-- Random Person Joker -->
          <button
            @click="useRandomPersonJoker"
            :disabled="jokers.randomPerson.used || gamePhase !== 'reading'"
            :class="[
              'p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center',
              jokers.randomPerson.used 
                ? 'bg-gray-600/30 border-gray-400/30 opacity-50 cursor-not-allowed' 
                : 'bg-purple-600/30 border-purple-400/50 hover:bg-purple-600/50 cursor-pointer'
            ]"
            title="Random Person Joker - Wählt zufällig einen Spieler aus"
          >
            <div class="relative">
              <img :src="jokerrandom" alt="Joker Random" class="w-14 h-14" />
              <!-- Durchstrich wenn benutzt -->
              <div v-if="jokers.randomPerson.used" class="absolute inset-0 flex items-center justify-center">
                <div class="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                <div class="absolute w-full h-0.5 bg-red-500 transform -rotate-45"></div>
              </div>
            </div>
          </button>

          <!-- Reveal Joker -->
          <button
            @click="useRevealJoker"
            :disabled="jokers.reveal.used || gamePhase !== 'reading'"
            :class="[
              'p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center',
              jokers.reveal.used 
                ? 'bg-gray-600/30 border-gray-400/30 opacity-50 cursor-not-allowed' 
                : 'bg-green-600/30 border-green-400/50 hover:bg-green-600/50 cursor-pointer'
            ]"
            title="Reveal Joker - Alle müssen ihre Karten aufdecken"
          >
            <div class="relative">
              <img :src="jokerreveal" alt="Joker Reveal" class="w-14 h-14" />
              <!-- Durchstrich wenn benutzt -->
              <div v-if="jokers.reveal.used" class="absolute inset-0 flex items-center justify-center">
                <div class="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                <div class="absolute w-full h-0.5 bg-red-500 transform -rotate-45"></div>
              </div>
            </div>
          </button>
        </div>

        <!-- Question Number & Current Reward Info -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-white mb-2">Frage {{ currentQuestionIndex + 1 }}</h2>
          <div class="flex items-center justify-center gap-2">
            <span class="text-orange-200">Bei falscher Antwort trinken:</span>
            <div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <img v-if="currentReward?.image" :src="currentReward.image" :alt="currentReward.name" class="w-6 h-6 object-cover rounded-full">
              <span class="text-white font-bold">{{ currentReward?.name }}</span>
            </div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="max-w-4xl mx-auto">
          <div class="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 shadow-2xl border border-white/20">
            <p class="text-white text-2xl leading-relaxed text-center mb-8">
              {{ currentQuestion.question }}
            </p>

            <!-- Answer Options -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div
                v-for="(answer, index) in currentQuestion.answers"
                :key="index"
                class="p-4 rounded-lg font-medium text-left flex items-center gap-3 min-h-[60px] transition-all duration-500"
                :class="getAnswerDisplayClass(index)"
              >
                <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">
                  {{ String.fromCharCode(65 + index) }}
                </span>
                <span class="flex-1">{{ answer.text }}</span>
              </div>
            </div>

            <!-- Action Button -->
            <div class="text-center">
              <button
                v-if="gamePhase === 'reading'"
                @click="showAnswer"
                class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors"
              >
                Bereit - Antwort zeigen
              </button>
              <button
                v-else-if="gamePhase === 'showing_answer'"
                @click="nextQuestion"
                class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors"
              >
                {{ isLastQuestion ? 'Quiz beenden' : 'Weiter' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Answer Feedback -->
        <div v-if="gamePhase === 'showing_answer'" class="text-center">
          <div class="text-green-400 text-2xl font-bold mb-2">
            ✅ Die richtige Antwort ist {{ String.fromCharCode(65 + currentQuestion.correctAnswer) }}!
          </div>
          <div class="text-orange-200 text-lg">
            Wer die Antwort nicht wusste, trinkt: {{ currentReward?.name }}! 🍻
          </div>
        </div>

        <!-- Joker Feedback Messages -->
        <div v-if="jokerMessage" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click="clearJokerMessage">
          <div class="bg-gradient-to-br from-purple-600/40 to-blue-600/40 backdrop-blur-lg rounded-xl p-8 border-2 border-purple-400/50 max-w-2xl shadow-2xl" style="animation: gentlePulse 2.5s ease-in-out infinite;">
            <div class="text-center">
              <div class="mb-4">
                <img v-if="jokerMessage.type === 'fiftyFifty'" :src="joker50" alt="50/50 Joker" class="w-16 h-16 mx-auto" />
                <img v-else-if="jokerMessage.type === 'randomPerson'" :src="jokerrandom" alt="Random Person Joker" class="w-16 h-16 mx-auto" />
                <img v-else-if="jokerMessage.type === 'reveal'" :src="jokerreveal" alt="Reveal Joker" class="w-16 h-16 mx-auto" />
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">{{ jokerMessage.title }}</h3>
              <p class="text-white text-lg leading-relaxed">{{ jokerMessage.text }}</p>
              <button
                @click="clearJokerMessage"
                class="mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all"
              >
                Weiter
              </button>
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
import { playerStore } from '../store/playerStore'
import { PasswordUtils } from '../utils/passwordUtils'
import joker50 from '../assets/5050.png'
import jokerrandom from '../assets/RandomPerson.png'
import jokerreveal from '../assets/RevealJoker.png'

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
    const needsPassword = ref(false)
    const currentQuestionIndex = ref(0)
    const gamePhase = ref('progress') // 'progress', 'reading', 'showing_answer'
    const showResults = ref(false)
    const showEventQuestion = ref(false)
    const showProgressScreen = ref(true)
    const currentEventQuestion = ref(null)
    const eventQueue = ref([])

    // Joker System
    const jokers = ref({
      fiftyFifty: { used: false },
      randomPerson: { used: false },
      reveal: { used: false }
    })
    const hiddenAnswers = ref([])
    const jokerMessage = ref(null)

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

    const checkGameAccess = () => {
      if (!game.value) return false
      
      // If game is not protected, allow access
      if (!game.value.isProtected) return true
      
      // Check if user has valid session
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

    const getProgressLevelClass = (level) => {
      const current = currentQuestionIndex.value + 1
      if (level === current) {
        return 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-2 border-orange-400 shadow-lg transform scale-105'
      } else if (level < current) {
        return 'bg-green-600/40 text-green-200 border border-green-400/50'
      } else {
        return 'bg-white/10 text-white/70 border border-white/20'
      }
    }

    const getAnswerDisplayClass = (index) => {
      const isHidden = hiddenAnswers.value.includes(index)
      
      if (gamePhase.value === 'reading') {
        if (isHidden) {
          return 'bg-white/5 text-white/30 border-2 border-white/10 opacity-30'
        }
        return 'bg-white/20 text-white border-2 border-white/30'
      } else if (gamePhase.value === 'showing_answer') {
        if (index === currentQuestion.value.correctAnswer) {
          return 'bg-green-600 text-white border-2 border-green-400 animate-pulse shadow-lg shadow-green-400/50'
        } else if (isHidden) {
          return 'bg-white/5 text-white/20 border-2 border-white/10 opacity-30'
        } else {
          return 'bg-white/10 text-white/50 border-2 border-white/20'
        }
      }
      return 'bg-white/20 text-white border-2 border-white/30'
    }

    const continueFromProgress = () => {
      showProgressScreen.value = false
      gamePhase.value = 'reading'
    }

    const showAnswer = () => {
      gamePhase.value = 'showing_answer'
    }

    const nextQuestion = () => {
      // Reset hidden answers for next question
      hiddenAnswers.value = []
      
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
      
      // Reset jokers
      jokers.value = {
        fiftyFifty: { used: false },
        randomPerson: { used: false },
        reveal: { used: false }
      }
      hiddenAnswers.value = []
      jokerMessage.value = null
    }

    // Joker Functions
    const use5050Joker = () => {
      if (jokers.value.fiftyFifty.used || gamePhase.value !== 'reading') return
      
      jokers.value.fiftyFifty.used = true
      
      // Find wrong answers (all except the correct one)
      const wrongAnswers = []
      for (let i = 0; i < 4; i++) {
        if (i !== currentQuestion.value.correctAnswer) {
          wrongAnswers.push(i)
        }
      }
      
      // Randomly select 2 wrong answers to hide
      const shuffled = wrongAnswers.sort(() => 0.5 - Math.random())
      hiddenAnswers.value = shuffled.slice(0, 2)
      
      jokerMessage.value = {
        type: 'fiftyFifty',
        title: '50/50 Joker aktiviert!',
        text: `Zwei falsche Antworten wurden entfernt. Es bleiben nur noch zwei Optionen übrig!`
      }
    }

    const useRandomPersonJoker = () => {
      if (jokers.value.randomPerson.used || gamePhase.value !== 'reading') return
      
      jokers.value.randomPerson.used = true
      
      // Get random player
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
      if (jokers.value.reveal.used || gamePhase.value !== 'reading') return
      
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

    const initializeGame = async () => {
      isLoading.value = true
      
      try {
        await hackeDichtStore.loadGames()
        await playerStore.loadPlayers() // Load players for random person joker
        const gameData = hackeDichtStore.getGame(parseInt(props.gameId))
        
        if (!gameData) {
          console.error('Game not found')
          return
        }

        game.value = gameData

        // Check if password protection blocks access
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
      getProgressLevelClass,
      getAnswerDisplayClass,
      continueFromProgress,
      showAnswer,
      nextQuestion,
      continueAfterEvent,
      restartGame,
      use5050Joker,
      useRandomPersonJoker,
      useRevealJoker,
      clearJokerMessage,
      joker50,
      jokerreveal,
      jokerrandom
    }
  }
}
</script>

<style scoped>
@keyframes slowPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes gentlePulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}
</style>