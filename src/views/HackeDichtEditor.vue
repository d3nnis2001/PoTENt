<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <button
            @click="$router.push('/hacke-dicht/gallery')"
            class="text-purple-200 hover:text-white mb-2 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Zurück zur Galerie
          </button>
          <h1 class="text-3xl font-bold text-white">{{ isEditing ? 'Quiz bearbeiten' : 'Neues Quiz erstellen' }}</h1>
          <p class="text-orange-200 text-sm">Erstelle dein eigenes Trinkquiz</p>
        </div>
        <div class="flex gap-4">
          <button
            @click="saveGame"
            :disabled="!isGameValid || isSaving"
            class="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg v-if="isSaving" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
            </svg>
            {{ isSaving ? 'Speichere...' : 'Spiel speichern' }}
          </button>
        </div>
      </div>

      <!-- Game Settings -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
        <h2 class="text-xl font-bold text-white mb-4">Spieleinstellungen</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-white font-medium mb-2">Spielname</label>
            <input
              v-model="gameData.name"
              type="text"
              class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="z.B. Klassentreffen Quiz"
              required
            />
          </div>
          <div>
            <label class="block text-white font-medium mb-2">Beschreibung</label>
            <input
              v-model="gameData.description"
              type="text"
              class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Kurze Beschreibung des Spiels"
            />
          </div>
        </div>

        <!-- Password Protection -->
        <div class="mt-6">
          <div class="flex items-center gap-3 mb-4">
            <input
              v-model="usePassword"
              type="checkbox"
              id="usePassword"
              class="w-5 h-5 bg-white/20 border-2 border-white/30 rounded text-orange-600 focus:ring-orange-500 focus:ring-2"
            />
            <label for="usePassword" class="text-white font-medium cursor-pointer">
              Quiz mit Passwort schützen
            </label>
            <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          
          <div v-if="usePassword" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-white font-medium mb-2">Passwort</label>
              <div class="relative">
                <input
                  v-model="gameData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400 pr-12"
                  placeholder="Passwort für das Quiz"
                  :required="usePassword"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-200 hover:text-white"
                >
                  <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="flex items-end">
              <div class="bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-3 text-sm">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <p class="text-yellow-200 font-medium">Passwortschutz</p>
                    <p class="text-yellow-300 text-xs mt-1">
                      Andere Spieler benötigen das Passwort, um das Quiz zu spielen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Belohnungen -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-white mb-4">Belohnungen (Getränke)</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              v-for="(reward, index) in gameData.rewards" 
              :key="index"
              class="bg-white/5 rounded-lg p-4"
            >
              <label class="block text-white font-medium mb-2">
                {{ getRewardLabel(index) }}
              </label>
              <input
                v-model="reward.name"
                type="text"
                class="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm mb-3"
                :placeholder="getRewardPlaceholder(index)"
                required
              />
              
              <!-- Bild Upload -->
              <div class="relative">
                <input
                  :ref="`fileInput${index}`"
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload($event, index)"
                  class="hidden"
                />
                <button
                  @click="$refs[`fileInput${index}`]?.[0]?.click()"
                  type="button"
                  class="w-full bg-white/10 border-2 border-dashed border-white/30 rounded-lg p-4 text-white hover:bg-white/20 transition-colors flex flex-col items-center gap-2"
                >
                  <div v-if="reward.image" class="w-full">
                    <img :src="reward.image" :alt="reward.name" class="w-full h-20 object-cover rounded-lg mb-2">
                    <p class="text-sm text-orange-200">Bild ändern</p>
                  </div>
                  <div v-else>
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p class="text-sm text-orange-200">Bild hochladen</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions Section -->
      <div class="space-y-6">
        <div 
          v-for="questionIndex in 15" 
          :key="`question-${questionIndex}`"
          class="space-y-4"
        >
          <!-- Main Question -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <span class="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-sm">
                  Frage {{ questionIndex }}
                </span>
                <span class="text-orange-200 text-sm">
                  ({{ getRewardForQuestion(questionIndex) }})
                </span>
              </h3>
              
              <!-- Add Event Question Button -->
              <button
                @click="addEventQuestion(questionIndex)"
                type="button"
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Ereignisfrage
              </button>
            </div>

            <div class="space-y-4">
              <!-- Question Text -->
              <div>
                <label class="block text-white font-medium mb-2">Frage</label>
                <textarea
                  v-model="gameData.questions[questionIndex - 1].question"
                  class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  rows="2"
                  :placeholder="`Frage ${questionIndex} eingeben...`"
                  required
                ></textarea>
              </div>

              <!-- Answer Options -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="(answer, answerIndex) in gameData.questions[questionIndex - 1].answers"
                  :key="`answer-${questionIndex}-${answerIndex}`"
                  class="flex items-center gap-3"
                >
                  <label class="flex items-center gap-2 flex-1">
                    <input
                      type="radio"
                      :name="`correct-${questionIndex}`"
                      :value="answerIndex"
                      v-model="gameData.questions[questionIndex - 1].correctAnswer"
                      class="w-4 h-4 text-green-600 bg-white/20 border-white/30 focus:ring-green-500 focus:ring-2"
                    />
                    <input
                      v-model="answer.text"
                      type="text"
                      class="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      :placeholder="`Antwort ${String.fromCharCode(65 + answerIndex)}`"
                      required
                    />
                  </label>
                </div>
              </div>
              
              <p class="text-orange-200 text-sm">
                ✓ Markiere die richtige Antwort mit dem Radio-Button
              </p>
            </div>
          </div>

          <!-- Event Questions for this level -->
          <div 
            v-for="(eventQuestion, eventIndex) in getEventQuestionsForLevel(questionIndex)"
            :key="`event-${questionIndex}-${eventIndex}`"
            class="bg-yellow-600/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-400/30 ml-8"
          >
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-lg font-bold text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Ereignisfrage nach Frage {{ questionIndex }}
              </h4>
              <button
                @click="removeEventQuestion(questionIndex, eventIndex)"
                type="button"
                class="text-red-400 hover:text-red-300"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>

            <div>
              <label class="block text-white font-medium mb-2">Ereignis/Aufgabe</label>
              <textarea
                v-model="eventQuestion.text"
                class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                rows="2"
                placeholder="z.B. Alle Spieler mit blauen Augen trinken einen Shot..."
                required
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Messages -->
      <div v-if="!isGameValid" class="mt-8 p-4 bg-red-600/20 border border-red-400/30 rounded-lg">
        <h3 class="text-red-400 font-semibold mb-2">Fehlende Angaben:</h3>
        <ul class="text-red-300 text-sm space-y-1">
          <li v-if="!gameData.name">• Spielname fehlt</li>
          <li v-if="usePassword && !gameData.password">• Passwort fehlt</li>
          <li v-if="gameData.rewards.some(r => !r.name)">• Alle Belohnungen müssen benannt werden</li>
          <li v-if="gameData.questions.some(q => !q.question)">• Alle Fragen müssen ausgefüllt werden</li>
          <li v-if="gameData.questions.some(q => q.answers.some(a => !a.text))">• Alle Antwortmöglichkeiten müssen ausgefüllt werden</li>
          <li v-if="gameData.questions.some(q => q.correctAnswer === null)">• Für jede Frage muss eine richtige Antwort markiert werden</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { hackeDichtStore } from '../store/hackeDichtStore'

export default {
  name: 'HackeDichtEditor',
  props: {
    gameId: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const router = useRouter()
    const isSaving = ref(false)
    const usePassword = ref(false)
    const showPassword = ref(false)
    const isEditing = computed(() => !!props.gameId)

    const gameData = ref(hackeDichtStore.createEmptyGame())

    // Initialize or load game
    const initializeGame = () => {
      if (isEditing.value) {
        const existingGame = hackeDichtStore.getGame(parseInt(props.gameId))
        if (existingGame) {
          gameData.value = JSON.parse(JSON.stringify(existingGame)) // Deep copy
          usePassword.value = existingGame.isProtected || false
          // Don't show the hashed password
          if (existingGame.isProtected) {
            gameData.value.password = ''
          }
        } else {
          alert('Spiel nicht gefunden!')
          router.push('/hacke-dicht/gallery')
        }
      }
    }

    // Watch password checkbox
    watch(usePassword, (newVal) => {
      if (!newVal) {
        gameData.value.password = ''
      }
    })

    const getRewardLabel = (index) => {
      const ranges = ['Fragen 1-5', 'Fragen 6-10', 'Fragen 11-15']
      return ranges[index]
    }

    const getRewardPlaceholder = (index) => {
      const placeholders = ['z.B. Klopfer', 'z.B. Erdbeer Shots', 'z.B. Vodka Shots']
      return placeholders[index]
    }

    const getRewardForQuestion = (questionNumber) => {
      if (questionNumber <= 5) return gameData.value.rewards[0].name || 'Belohnung 1'
      if (questionNumber <= 10) return gameData.value.rewards[1].name || 'Belohnung 2'
      return gameData.value.rewards[2].name || 'Belohnung 3'
    }

    const handleImageUpload = (event, rewardIndex) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          gameData.value.rewards[rewardIndex].image = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const addEventQuestion = (afterQuestion) => {
      if (!gameData.value.eventQuestions[afterQuestion]) {
        gameData.value.eventQuestions[afterQuestion] = []
      }
      gameData.value.eventQuestions[afterQuestion].push({
        text: '',
        id: Date.now() + Math.random()
      })
    }

    const removeEventQuestion = (afterQuestion, eventIndex) => {
      if (gameData.value.eventQuestions[afterQuestion]) {
        gameData.value.eventQuestions[afterQuestion].splice(eventIndex, 1)
        if (gameData.value.eventQuestions[afterQuestion].length === 0) {
          delete gameData.value.eventQuestions[afterQuestion]
        }
      }
    }

    const getEventQuestionsForLevel = (questionNumber) => {
      return gameData.value.eventQuestions[questionNumber] || []
    }

    const isGameValid = computed(() => {
      // Check basic game info
      if (!gameData.value.name) return false
      
      // Check password if enabled
      if (usePassword.value && !gameData.value.password) return false
      
      // Check rewards
      if (gameData.value.rewards.some(reward => !reward.name)) return false
      
      // Check questions
      const questions = gameData.value.questions
      if (questions.some(q => !q.question)) return false
      if (questions.some(q => q.answers.some(a => !a.text))) return false
      if (questions.some(q => q.correctAnswer === null)) return false
      
      return true
    })

    const saveGame = async () => {
      if (!isGameValid.value) return
      
      isSaving.value = true
      try {
        // Set password protection flag
        if (usePassword.value && gameData.value.password) {
          gameData.value.isProtected = true
        } else {
          gameData.value.isProtected = false
          gameData.value.password = ''
        }

        if (isEditing.value) {
          hackeDichtStore.updateGame(props.gameId, gameData.value)
          alert('Spiel erfolgreich aktualisiert!')
        } else {
          hackeDichtStore.createGame(gameData.value)
          alert('Spiel erfolgreich erstellt!')
        }
        
        router.push('/hacke-dicht/gallery')
      } catch (error) {
        alert('Fehler beim Speichern: ' + error.message)
      } finally {
        isSaving.value = false
      }
    }

    onMounted(() => {
      hackeDichtStore.loadGames()
      initializeGame()
    })

    return {
      gameData,
      isSaving,
      isGameValid,
      isEditing,
      usePassword,
      showPassword,
      getRewardLabel,
      getRewardPlaceholder,
      getRewardForQuestion,
      handleImageUpload,
      addEventQuestion,
      removeEventQuestion,
      getEventQuestionsForLevel,
      saveGame
    }
  }
}
</script>