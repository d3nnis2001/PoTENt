<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Gallery Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <button
            @click="$router.push('/games')"
            class="text-purple-200 hover:text-white mb-2 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Zurück zur Spielauswahl
          </button>
          <h1 class="text-3xl font-bold text-white">AI Takes Over</h1>
          <p class="text-blue-200 text-sm">Deine KI-Übernahme Quiz-Spiele</p>
        </div>
        
        <div class="flex gap-4">
          <!-- Migration Button -->
          <button
            v-if="hasLocalData"
            @click="migrateData"
            class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 flex items-center gap-2"
          >
            <span>📤</span>
            Lokale Daten übertragen
          </button>
          
          <!-- Create New Game Button -->
          <button
            @click="createNewGame"
            class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Neues Quiz erstellen
          </button>
        </div>
      </div>

      <!-- Games Grid or Empty State -->
      <div v-if="aiTakesOverStore.games.length > 0">
        <!-- Games Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="game in aiTakesOverStore.games"
            :key="game.id"
            class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
          >
            <!-- Game Header -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors">
                    {{ game.name }}
                  </h3>
                  <!-- Password Protection Indicator -->
                  <svg 
                    v-if="game.isProtected"
                    class="w-5 h-5 text-yellow-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    title="Passwortgeschützt"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <p v-if="game.description" class="text-blue-200 text-sm mt-1">
                  {{ game.description }}
                </p>
              </div>
              <!-- Delete Button -->
              <button
                @click="deleteGame(game.id)"
                class="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>

            <!-- Game Stats -->
            <div class="flex justify-between items-center mb-4 text-sm">
              <span class="text-blue-200">
                {{ getCompletedQuestions(game) }}/15 Fragen
              </span>
              <span class="text-blue-200">
                {{ getEventQuestionsCount(game) }} Events
              </span>
            </div>

            <!-- Rewards Preview -->
            <div class="flex gap-2 mb-4">
              <div
                v-for="(reward, index) in game.rewards"
                :key="index"
                class="flex-1 bg-white/5 rounded-lg p-2 text-center"
              >
                <div v-if="reward.image" class="w-8 h-8 mx-auto mb-1">
                  <img :src="reward.image" :alt="reward.name" class="w-full h-full object-cover rounded">
                </div>
                <div v-else class="w-8 h-8 mx-auto mb-1 bg-white/20 rounded flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <span class="text-xs text-blue-200">{{ reward.name || 'Belohnung' }}</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-white/20 rounded-full h-2 mb-4">
              <div 
                class="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${getGameProgress(game)}%` }"
              ></div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-3 gap-2">
              <!-- Solo Play Button -->
              <button
                @click="playGame(game)"
                :disabled="!isGamePlayable(game)"
                class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
              >
                <svg v-if="game.isProtected" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Solo
              </button>
              
              <!-- Multiplayer Button -->
              <button
                @click="playMultiplayer(game)"
                :disabled="!isGamePlayable(game)"
                class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                Multi
              </button>
              
              <!-- Edit Button -->
              <button
                @click="editGame(game)"
                class="bg-white/20 text-white py-2 px-3 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-1 text-sm"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
            </div>

            <!-- Game Status -->
            <div class="mt-3 text-center">
              <span 
                :class="[
                  'inline-block px-3 py-1 rounded-full text-xs font-medium',
                  getStatusClass(game)
                ]"
              >
                {{ getStatusText(game) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 text-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
        <h2 class="text-xl font-semibold text-white mb-2">Noch keine AI Takes Over Spiele</h2>
        <p class="text-blue-200 mb-6">Erstelle dein erstes "AI Takes Over" Quiz!</p>
        <button
          @click="createNewGame"
          class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
        >
          Quiz erstellen
        </button>
      </div>

      <!-- Password Modal -->
      <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click="closePasswordModal">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 w-full max-w-md border border-white/20" @click.stop>
          <div class="text-center mb-6">
            <svg class="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <h2 class="text-xl font-bold text-white mb-2">{{ selectedGame?.name }} entsperren</h2>
            <p class="text-purple-200 text-sm">Dieses Quiz ist passwortgeschützt</p>
          </div>
          
          <form @submit.prevent="verifyPassword" class="space-y-4">
            <div>
              <label class="block text-white font-medium mb-2">Passwort</label>
              <input
                v-model="passwordInput"
                :type="showPassword ? 'text' : 'password'"
                class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Passwort eingeben..."
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 text-purple-200 hover:text-white"
                style="margin-top: 1.5rem; position: relative; float: right; margin-right: 0.75rem; margin-top: -2.25rem;"
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
            
            <div v-if="passwordError" class="text-red-300 text-sm text-center">
              {{ passwordError }}
            </div>
            
            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="!passwordInput.trim() || isVerifying"
                class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isVerifying ? 'Überprüfe...' : 'Entsperren' }}
              </button>
              <button
                type="button"
                @click="closePasswordModal"
                :disabled="isVerifying"
                class="bg-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/30 disabled:opacity-50"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { aiTakesOverStore } from '../store/aiTakesOverStore'
import { globalToast } from '../composables/useToast'

export default {
  name: 'AiTakesOverGallery',
  setup() {
    const router = useRouter()
    const { success, error: showError } = globalToast
    
    const selectedGame = ref(null)
    const pendingAction = ref(null) // 'play', 'edit', or 'multiplayer'
    const showPasswordModal = ref(false)
    const passwordInput = ref('')
    const passwordError = ref('')
    const isVerifying = ref(false)
    const showPassword = ref(false)
    
    // Computed properties
    const hasLocalData = computed(() => {
      return localStorage.getItem('cardDecks') !== null
    })

    // Helper methods
    const isGamePlayable = (game) => {
      const completedQuestions = getCompletedQuestions(game)
      return completedQuestions === 15 && 
             game.rewards.every(r => r.name) && 
             game.name
    }

    const getCompletedQuestions = (game) => {
      return game.questions.filter(q => 
        q.question && q.answers.every(a => a.text) && q.correctAnswer !== null
      ).length
    }

    const getEventQuestionsCount = (game) => {
      return Object.values(game.eventQuestions || {}).reduce((total, events) => total + events.length, 0)
    }

    const getGameProgress = (game) => {
      const completed = getCompletedQuestions(game)
      const hasRewards = game.rewards.every(r => r.name)
      const hasName = !!game.name
      
      let totalProgress = (completed / 15) * 80 // 80% für Fragen
      if (hasRewards) totalProgress += 15 // 15% für Belohnungen
      if (hasName) totalProgress += 5 // 5% für Name
      
      return Math.min(totalProgress, 100)
    }

    const getStatusText = (game) => {
      const progress = getGameProgress(game)
      if (progress === 100) return 'Bereit zum Spielen'
      if (progress >= 50) return 'In Bearbeitung'
      return 'Entwurf'
    }

    const getStatusClass = (game) => {
      const progress = getGameProgress(game)
      if (progress === 100) return 'bg-green-600/30 text-green-300 border border-green-400/30'
      if (progress >= 50) return 'bg-yellow-600/30 text-yellow-300 border border-yellow-400/30'
      return 'bg-gray-600/30 text-gray-300 border border-gray-400/30'
    }

    const checkGameAccess = (game) => {
      if (!game.isProtected) return true
      
      const sessionKey = `session_${game.id}`
      try {
        const sessionData = localStorage.getItem(sessionKey)
        if (sessionData) {
          const session = JSON.parse(sessionData)
          const now = Date.now()
          const sessionAge = now - session.timestamp
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours

          if (sessionAge < maxAge && session.gameId == game.id) {
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

    // Game actions
    const createNewGame = () => {
      router.push('/ai-takes-over/editor')
    }

    const editGame = async (game) => {
      if (game.isProtected && !checkGameAccess(game)) {
        selectedGame.value = game
        pendingAction.value = 'edit'
        showPasswordModal.value = true
      } else {
        router.push(`/ai-takes-over/editor/${game.id}`)
      }
    }

    const playGame = async (game) => {
      if (!isGamePlayable(game)) {
        showError('Spiel ist nicht vollständig! Bitte bearbeite es zuerst.')
        return
      }
      
      if (game.isProtected && !checkGameAccess(game)) {
        selectedGame.value = game
        pendingAction.value = 'play'
        showPasswordModal.value = true
      } else {
        router.push(`/ai-takes-over/play/${game.id}`)
      }
    }

    const playMultiplayer = async (game) => {
      if (!isGamePlayable(game)) {
        showError('Spiel ist nicht vollständig! Bitte bearbeite es zuerst.')
        return
      }
      
      if (game.isProtected && !checkGameAccess(game)) {
        selectedGame.value = game
        pendingAction.value = 'multiplayer'
        showPasswordModal.value = true
      } else {
        router.push(`/ai-takes-over/play-multiplayer/${game.id}`)
      }
    }

    const deleteGame = (gameId) => {
      if (confirm('Möchtest du dieses Quiz wirklich löschen?')) {
        aiTakesOverStore.deleteGame(gameId)
        success('Quiz gelöscht!')
      }
    }

    const migrateData = async () => {
      if (confirm('Möchtest du deine lokalen Daten in die Cloud übertragen?')) {
        try {
          await aiTakesOverStore.migrateFromLocalStorage()
          success('Migration erfolgreich! Deine Daten sind jetzt in der Cloud.')
        } catch (error) {
          showError('Fehler bei der Migration: ' + error.message)
        }
      }
    }

    // Password handling
    const verifyPassword = async () => {
      if (!selectedGame.value || !passwordInput.value.trim()) return

      isVerifying.value = true
      passwordError.value = ''

      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const isValid = aiTakesOverStore.verifyGamePassword(selectedGame.value.id, passwordInput.value)
        
        if (isValid) {
          const sessionData = {
            gameId: selectedGame.value.id,
            timestamp: Date.now()
          }
          localStorage.setItem(`session_${selectedGame.value.id}`, JSON.stringify(sessionData))
          
          if (pendingAction.value === 'play') {
            router.push(`/ai-takes-over/play/${selectedGame.value.id}`)
          } else if (pendingAction.value === 'edit') {
            router.push(`/ai-takes-over/editor/${selectedGame.value.id}`)
          } else if (pendingAction.value === 'multiplayer') {
            router.push(`/ai-takes-over/play-multiplayer/${selectedGame.value.id}`)
          }
          
          closePasswordModal()
        } else {
          passwordError.value = 'Falsches Passwort!'
        }
      } catch (error) {
        passwordError.value = 'Fehler beim Überprüfen des Passworts'
      } finally {
        isVerifying.value = false
      }
    }

    const closePasswordModal = () => {
      showPasswordModal.value = false
      passwordError.value = ''
      passwordInput.value = ''
      showPassword.value = false
      selectedGame.value = null
      pendingAction.value = null
    }

    onMounted(() => {
      aiTakesOverStore.loadGames()
    })

    return {
      aiTakesOverStore,
      selectedGame,
      showPasswordModal,
      passwordInput,
      passwordError,
      isVerifying,
      showPassword,
      hasLocalData,
      
      // Helper methods
      isGamePlayable,
      getCompletedQuestions,
      getEventQuestionsCount,
      getGameProgress,
      getStatusText,
      getStatusClass,
      
      // Game actions
      createNewGame,
      editGame,
      playGame,
      playMultiplayer,
      deleteGame,
      migrateData,
      
      // Password handling
      verifyPassword,
      closePasswordModal
    }
  }
}
</script>