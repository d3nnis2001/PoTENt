<template>
  <div class="min-h-screen p-4">
    <div class="max-w-4xl mx-auto">
      
      <!-- Game Header -->
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
        <h1 class="text-2xl font-bold text-white mb-2">{{ game?.name || 'Quiz läuft' }}</h1>
        <p class="text-orange-200">Frage {{ currentQuestionIndex + 1 }}/15</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="text-white mt-2">Lade Quiz...</p>
      </div>

      <!-- Game Not Found -->
      <div v-else-if="!game" class="text-center py-12">
        <h2 class="text-xl font-semibold text-white mb-2">Quiz nicht gefunden</h2>
        <p class="text-orange-200">Das angeforderte Quiz existiert nicht.</p>
      </div>

      <!-- Progress Screen -->
      <div v-else-if="showProgressScreen" class="text-center py-12">
        <h2 class="text-2xl font-bold text-white mb-4">Bereit für Frage {{ currentQuestionIndex + 1 }}?</h2>
        <button
          @click="continueFromProgress"
          class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-lg font-bold text-xl hover:from-orange-700 hover:to-red-700 transition-all"
        >
          {{ currentQuestionIndex === 0 ? 'Spiel starten' : 'Weiter zur nächsten Frage' }}
        </button>
      </div>

      <!-- Results View -->
      <div v-else-if="showResults" class="text-center py-12">
        <div class="text-8xl mb-6 animate-bounce">🎉</div>
        <h2 class="text-4xl font-bold text-white mb-4">Quiz beendet!</h2>
        <p class="text-orange-200 text-xl mb-8">Alle 15 Fragen geschafft!</p>
        
        <div class="flex gap-4 justify-center">
          <button
            v-if="isHost"
            @click="restartGame"
            class="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            Neues Spiel starten
          </button>
          <button
            @click="$router.push('/hacke-dicht/gallery')"
            class="bg-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/30 transition-all"
          >
            Zur Galerie
          </button>
        </div>
      </div>

      <!-- Main Game View -->
      <div v-else-if="currentQuestion">
        
        <!-- Jokers Panel (Host only) -->
        <div v-if="isHost" class="fixed top-4 left-4 z-40 flex flex-col gap-2">
          <button
            v-for="(joker, type) in availableJokers"
            :key="type"
            @click="activateJoker(type)"
            :disabled="joker.used || gamePhase !== 'reading' || isDisconnected"
            :class="[
              'p-3 rounded-lg border transition-all flex items-center justify-center w-16 h-16 text-2xl',
              joker.used ? 'bg-gray-600/30 border-gray-400/30 opacity-50' : 'bg-blue-600/30 border-blue-400/50 hover:bg-blue-600/50'
            ]"
            :title="joker.name"
          >
            {{ joker.icon }}
          </button>
        </div>

        <!-- Question Header -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-white mb-2">Frage {{ currentQuestionIndex + 1 }}</h2>
          
          <!-- Host View -->
          <div v-if="isHost" class="flex items-center justify-center gap-2">
            <span class="text-orange-200">Moderierst das Quiz</span>
            <span class="text-orange-300">•</span>
            <span class="text-orange-200">{{ realPlayerCount }} Spieler</span>
            <span class="text-orange-300">•</span>
            <span v-if="timeRemaining > 0" class="text-orange-200">{{ timeRemaining }}s</span>
            <span v-else class="text-red-300">Zeit abgelaufen</span>
            <span class="text-orange-300">•</span>
            <span class="text-green-300">{{ votedPlayerCount }}/{{ realPlayerCount }} abgestimmt</span>
          </div>
          
          <!-- Player View -->
          <div v-else>
            <div class="flex items-center justify-center gap-2 text-orange-200 text-sm mb-2">
              <span v-if="timeRemaining > 0">{{ timeRemaining }}s verbleibend</span>
              <span v-else class="text-red-300">Zeit abgelaufen</span>
            </div>
            
            <div class="flex items-center justify-center gap-2">
              <span class="text-orange-200">Bei falscher Antwort trinken:</span>
              <div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <img 
                  v-if="currentReward?.image" 
                  :src="currentReward.image" 
                  :alt="currentReward.name" 
                  class="w-6 h-6 object-cover rounded-full"
                >
                <span class="text-white font-bold">{{ currentReward?.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 shadow-2xl border border-white/20">
          <p class="text-white text-2xl leading-relaxed text-center mb-8">
            {{ currentQuestion.question }}
          </p>

          <!-- Answer Options -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <!-- Host View -->
            <div
              v-if="isHost"
              v-for="(answer, index) in currentQuestion.answers"
              :key="`host-${index}`"
              :class="[
                'p-4 rounded-lg font-medium text-left flex items-center gap-3 min-h-[60px] transition-all duration-500',
                getHostAnswerClasses(index)
              ]"
            >
              <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">
                {{ String.fromCharCode(65 + index) }}
              </span>
              <span class="flex-1">{{ answer.text }}</span>
              
              <!-- Vote Count & Progress Bar -->
              <div v-if="showVotes" class="text-right min-w-[60px]">
                <div class="text-lg font-bold">{{ getVoteCount(index) }}</div>
                <div class="text-sm opacity-75">{{ getVotePercentage(index) }}%</div>
                <div class="w-12 bg-black/20 rounded-full h-1 mt-1">
                  <div 
                    class="bg-white h-1 rounded-full transition-all duration-1000"
                    :style="{ width: `${getVotePercentage(index)}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Player View -->
            <button
              v-else
              v-for="(answer, index) in currentQuestion.answers"
              :key="`player-${index}`"
              @click="selectAnswer(index)"
              :disabled="hasVotedFinal || isDisconnected || timeRemaining <= 0"
              :class="[
                'p-4 rounded-lg font-medium text-left transition-all flex items-center gap-3 min-h-[60px]',
                getPlayerAnswerClasses(index)
              ]"
            >
              <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">
                {{ String.fromCharCode(65 + index) }}
              </span>
              <span class="flex-1">{{ answer.text }}</span>
              <div v-if="selectedAnswer === index" class="text-blue-300 text-xl">
                ✓
              </div>
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="text-center">
            <!-- Host Actions -->
            <button
              v-if="isHost && gamePhase === 'reading'"
              @click="showAnswer"
              :disabled="(!allPlayersVoted && timeRemaining > 0) || isDisconnected"
              class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {{ allPlayersVoted ? 'Antwort zeigen' : `Warten (${votedPlayerCount}/${realPlayerCount})` }}
            </button>
            
            <button
              v-else-if="isHost && gamePhase === 'showing_answer'"
              @click="nextQuestion"
              :disabled="isDisconnected"
              class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {{ isLastQuestion ? 'Quiz beenden' : 'Nächste Frage' }}
            </button>

            <!-- Player Actions -->
            <div v-else-if="!isHost">
              <!-- Submit Button for Players -->
              <button
                v-if="selectedAnswer !== null && !hasVotedFinal && gamePhase === 'reading'"
                @click="submitFinalVote"
                :disabled="submittingVote || isDisconnected"
                class="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-lg font-bold text-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all"
              >
                {{ submittingVote ? 'Wird gesendet...' : 'Antwort bestätigen' }}
              </button>
              
              <!-- Waiting State -->
              <div v-else-if="hasVotedFinal" class="text-center py-4">
                <div class="text-6xl mb-4 animate-bounce">✓</div>
                <h3 class="text-xl font-bold text-white mb-2">Antwort bestätigt!</h3>
                <p class="text-orange-200 mb-4">Warte auf andere Spieler...</p>
                
                <!-- Vote Progress -->
                <div class="bg-white/10 rounded-full h-2 mb-2 max-w-md mx-auto">
                  <div 
                    class="bg-green-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${(votedPlayerCount / realPlayerCount) * 100}%` }"
                  ></div>
                </div>
                <div class="text-sm text-white/70">
                  {{ votedPlayerCount }}/{{ realPlayerCount }} Spieler haben geantwortet
                </div>
                
                <div class="mt-4 text-sm text-white/70">
                  Du hast {{ String.fromCharCode(65 + selectedAnswer) }} gewählt
                </div>
              </div>
              
              <!-- Instructions for Players -->
              <div v-else-if="gamePhase === 'reading'" class="text-center text-orange-200">
                {{ selectedAnswer !== null ? 'Du kannst deine Auswahl bis zur Bestätigung ändern' : 'Wähle deine Antwort' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Answer Feedback -->
        <div v-if="gamePhase === 'showing_answer'" class="text-center mt-6">
          <!-- Host View -->
          <div v-if="isHost">
            <div class="text-green-400 text-2xl font-bold mb-2">
              ✅ Die richtige Antwort ist {{ String.fromCharCode(65 + currentQuestion.correctAnswer) }}!
            </div>
            <div class="text-orange-200 text-lg">
              {{ getWrongPlayerCount() }} Spieler trinken: {{ currentReward?.name }}! 🍻
            </div>
          </div>
          
          <!-- Player View -->
          <div v-else>
            <div class="text-green-400 text-xl font-bold mb-2">
              Richtige Antwort: {{ String.fromCharCode(65 + currentQuestion.correctAnswer) }}
            </div>
            <div :class="[
              'text-lg font-medium mb-2',
              selectedAnswer === currentQuestion.correctAnswer ? 'text-green-400' : 'text-red-400'
            ]">
              {{ selectedAnswer === currentQuestion.correctAnswer ? '🎉 Richtig!' : '❌ Falsch!' }}
            </div>
            <div v-if="selectedAnswer !== currentQuestion.correctAnswer" class="text-orange-200 text-sm">
              Du trinkst: {{ currentReward?.name }}! 🍻
            </div>
          </div>
        </div>

        <!-- Player Status (Host only) -->
        <div v-if="isHost && realPlayerList.length > 0" class="mt-8">
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 class="text-xl font-bold text-white mb-4">Spieler Status</h3>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="player in realPlayerList"
                :key="player.id"
                :class="[
                  'bg-white/5 rounded-lg p-4 border transition-all',
                  player.isOnline ? 'border-green-400/30' : 'border-gray-400/30',
                  hasPlayerVoted(player.id) ? 'bg-green-600/20' : 'bg-white/5'
                ]"
              >
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ player.icon }}</div>
                  <div class="flex-1 min-w-0">
                    <div class="text-white font-medium truncate">{{ player.name }}</div>
                    <div class="text-xs text-orange-200">
                      {{ hasPlayerVoted(player.id) ? '✓ Abgestimmt' : 'Wartet...' }}
                    </div>
                    <div v-if="showPlayerAnswers && hasPlayerVoted(player.id)" class="text-xs text-green-300 mt-1">
                      Antwort: {{ getPlayerAnswer(player.id) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Joker Message Modal -->
      <div v-if="jokerMessage" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click="clearJokerMessage">
        <div class="bg-gradient-to-br from-purple-600/40 to-blue-600/40 backdrop-blur-lg rounded-xl p-8 border-2 border-purple-400/50 max-w-2xl shadow-2xl animate-pulse" @click.stop>
          <div class="text-center">
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
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'
import { useConnection } from '../composables/useConnection'
import { hackeDichtStore } from '../store/hackeDichtStore'
import { lobbyStore } from '../store/lobbyStore'
import { globalToast } from '../composables/useToast'

export default {
  name: 'HackeDichtPlayMultiplayer',
  props: {
    lobbyCode: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const {
      currentLobby, isHost, currentPlayer, players, gameState,
      submitVote, activateJoker: activateJokerAction, connectionStatus
    } = useLobby()
    
    const { isOnline, manualRetry } = useConnection()
    const { success, error: showError } = globalToast

    // State
    const game = ref(null)
    const isLoading = ref(true)
    const currentQuestionIndex = ref(0)
    const gamePhase = ref('progress')
    const showResults = ref(false)
    const showProgressScreen = ref(true)
    const timeRemaining = ref(30)
    let timer = null

    // Multiplayer specific state
    const selectedAnswer = ref(null)
    const hasVotedFinal = ref(false)
    const submittingVote = ref(false)

    // Joker system
    const jokerMessage = ref(null)
    const hiddenAnswers = ref([])

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

    // Multiplayer computed
    const realPlayerList = computed(() => {
      return Object.values(players.value || {})
        .filter(p => p.isOnline && !p.isModerator)
        .sort((a, b) => a.name.localeCompare(b.name))
    })

    const realPlayerCount = computed(() => realPlayerList.value.length)

    const voteStats = computed(() => lobbyStore.getVoteStats(currentQuestionIndex.value))
    const votedPlayerCount = computed(() => voteStats.value.totalVotes)
    const allPlayersVoted = computed(() => lobbyStore.allPlayersVoted(currentQuestionIndex.value))
    const showVotes = computed(() => gamePhase.value === 'showing_answer' || (isHost.value && allPlayersVoted.value))
    const showPlayerAnswers = computed(() => gamePhase.value === 'showing_answer')

    // Connection
    const isDisconnected = computed(() => connectionStatus.value === 'disconnected')

    // Available Jokers
    const availableJokers = computed(() => ({
      fiftyFifty: {
        name: '50/50',
        icon: '🎯',
        used: gameState.value?.jokers?.fiftyFifty?.used || false
      },
      randomPerson: {
        name: 'Random Person',
        icon: '👥',
        used: gameState.value?.jokers?.randomPerson?.used || false
      },
      reveal: {
        name: 'Reveal',
        icon: '📞',
        used: gameState.value?.jokers?.reveal?.used || false
      }
    }))

    // Sync with lobby gameState
    watch(() => gameState.value, (newState) => {
      if (!newState) return
      
      currentQuestionIndex.value = newState.currentQuestionIndex || 0
      
      // Map Firebase phases to local phases
      if (newState.phase === 'voting') {
        gamePhase.value = 'reading'
        showProgressScreen.value = false
      } else if (newState.phase === 'results') {
        gamePhase.value = 'showing_answer'
      } else if (newState.phase === 'finished') {
        showResults.value = true
      }
    }, { deep: true })

    // Methods
    const continueFromProgress = () => {
      showProgressScreen.value = false
      gamePhase.value = 'reading'
    }

    const showAnswer = async () => {
      if (!isHost.value || isDisconnected.value) return
      try {
        await lobbyStore.showAnswer()
      } catch (error) {
        showError('Fehler beim Anzeigen der Antwort')
      }
    }

    const nextQuestion = async () => {
      if (!isHost.value || isDisconnected.value) return
      
      selectedAnswer.value = null
      hasVotedFinal.value = false
      hiddenAnswers.value = []
      
      try {
        await lobbyStore.nextQuestion()
      } catch (error) {
        showError('Fehler bei der nächsten Frage')
      }
    }

    const restartGame = async () => {
      if (!isHost.value) return
      // Implement restart logic
    }

    // Player voting
    const selectAnswer = (answerIndex) => {
      if (isHost.value || hasVotedFinal.value || isDisconnected.value || timeRemaining.value <= 0) return
      selectedAnswer.value = answerIndex
    }

    const submitFinalVote = async () => {
      if (isHost.value || submittingVote.value || hasVotedFinal.value || selectedAnswer.value === null || isDisconnected.value) return
      
      submittingVote.value = true
      try {
        await submitVote(currentQuestionIndex.value, selectedAnswer.value)
        hasVotedFinal.value = true
        success('Antwort bestätigt!')
      } catch (error) {
        console.error('Vote error:', error)
        showError('Fehler beim Abstimmen')
      } finally {
        submittingVote.value = false
      }
    }

    // Joker handling
    const activateJoker = async (jokerType) => {
      if (!isHost.value || gamePhase.value !== 'reading') return
      
      try {
        await activateJokerAction(jokerType)
        
        if (jokerType === 'fiftyFifty') {
          const wrongAnswers = []
          for (let i = 0; i < 4; i++) {
            if (i !== currentQuestion.value.correctAnswer) {
              wrongAnswers.push(i)
            }
          }
          const shuffled = wrongAnswers.sort(() => 0.5 - Math.random())
          hiddenAnswers.value = shuffled.slice(0, 2)
        }
        
        jokerMessage.value = {
          title: `${availableJokers.value[jokerType].name} aktiviert!`,
          text: 'Der Joker wurde erfolgreich aktiviert!'
        }
      } catch (error) {
        showError('Fehler beim Aktivieren des Jokers')
      }
    }

    const clearJokerMessage = () => {
      jokerMessage.value = null
    }

    // Helper functions
    const getVoteCount = (answerIndex) => voteStats.value.answerCounts[answerIndex] || 0
    const getVotePercentage = (answerIndex) => voteStats.value.percentages[answerIndex] || 0

    const getWrongPlayerCount = () => {
      const votes = lobbyStore.currentLobby?.votes?.[currentQuestionIndex.value] || {}
      const correctAnswer = currentQuestion.value.correctAnswer
      return Object.values(votes).filter(vote => vote.answer !== correctAnswer).length
    }

    const hasPlayerVoted = (playerId) => {
      return lobbyStore.hasPlayerVoted(currentQuestionIndex.value, playerId)
    }

    const getPlayerAnswer = (playerId) => {
      const vote = lobbyStore.currentLobby?.votes?.[currentQuestionIndex.value]?.[playerId]
      return vote ? String.fromCharCode(65 + vote.answer) : '?'
    }

    // Style methods
    const getHostAnswerClasses = (index) => {
      if (gamePhase.value === 'reading') {
        if (hiddenAnswers.value.includes(index)) {
          return 'bg-white/5 text-white/30 border-2 border-white/10 opacity-30'
        }
        return 'bg-white/20 text-white border-2 border-white/30'
      } else if (gamePhase.value === 'showing_answer') {
        if (index === currentQuestion.value.correctAnswer) {
          return 'bg-green-600 text-white border-2 border-green-400 animate-pulse shadow-lg shadow-green-400/50'
        } else if (hiddenAnswers.value.includes(index)) {
          return 'bg-white/5 text-white/20 border-2 border-white/10 opacity-30'
        } else {
          return 'bg-white/10 text-white/50 border-2 border-white/20'
        }
      }
      return 'bg-white/20 text-white border-2 border-white/30'
    }

    const getPlayerAnswerClasses = (index) => {
      if (gamePhase.value === 'reading') {
        if (hiddenAnswers.value.includes(index)) {
          return 'bg-white/5 text-white/30 border-2 border-white/10 opacity-30 cursor-not-allowed'
        }
        if (selectedAnswer.value === index) {
          return 'bg-blue-600/50 text-white border-2 border-blue-400 shadow-lg'
        }
        if (hasVotedFinal.value || isDisconnected.value || timeRemaining.value <= 0) {
          return 'bg-white/10 text-white/50 border-2 border-white/20 cursor-not-allowed'
        }
        return 'bg-white/20 text-white border-2 border-white/30 hover:border-orange-400/50 hover:bg-white/30 cursor-pointer'
      } else if (gamePhase.value === 'showing_answer') {
        if (index === currentQuestion.value.correctAnswer) {
          return 'bg-green-600 text-white border-2 border-green-400 animate-pulse'
        } else if (hiddenAnswers.value.includes(index)) {
          return 'bg-white/5 text-white/20 border-2 border-white/10 opacity-30'
        } else {
          return 'bg-white/10 text-white/50 border-2 border-white/20'
        }
      }
      return 'bg-white/20 text-white border-2 border-white/30 cursor-not-allowed'
    }

    // Timer functions
    const startTimer = () => {
      timeRemaining.value = 30
      timer = setInterval(() => {
        timeRemaining.value--
        if (timeRemaining.value <= 0) {
          clearInterval(timer)
          if (isHost.value && gamePhase.value === 'reading') {
            showAnswer()
          }
        }
      }, 1000)
    }

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    // Watchers
    watch(() => gamePhase.value, (newPhase) => {
      if (newPhase === 'reading') {
        startTimer()
        selectedAnswer.value = null
        hasVotedFinal.value = false
      } else {
        stopTimer()
      }
    })

    watch(() => allPlayersVoted.value, (allVoted) => {
      if (allVoted && isHost.value && gamePhase.value === 'reading') {
        setTimeout(showAnswer, 2000)
      }
    })

    // Lifecycle
    onMounted(async () => {
      console.log('Component mounted, lobby data:', currentLobby.value)
      
      // Versuche Game-Daten zu laden
      if (currentLobby.value?.gameData) {
        // Aus Lobby-Daten laden (für Mitspieler)
        console.log('Loading game from lobby data')
        game.value = currentLobby.value.gameData
      } else if (currentLobby.value?.gameId) {
        // Aus Store laden (für Host)
        console.log('Loading game from store')
        game.value = hackeDichtStore.getGame(currentLobby.value.gameId)
      } else {
        console.error('No game data available')
      }
      
      console.log('Game loaded:', !!game.value, game.value?.name)
      
      if (gamePhase.value === 'reading') {
        startTimer()
      }
      
      isLoading.value = false
    })

    // Watch für Lobby-Updates
    watch(() => currentLobby.value, (newLobby) => {
      console.log('Lobby updated:', newLobby)
      
      // Game-Daten aus Lobby laden wenn verfügbar
      if (newLobby?.gameData && !game.value) {
        console.log('Loading game data from updated lobby')
        game.value = newLobby.gameData
      }
    }, { deep: true })

    onUnmounted(() => {
      stopTimer()
    })

    return {
      // State
      game, isLoading, currentQuestionIndex, gamePhase, showResults,
      showProgressScreen, selectedAnswer, hasVotedFinal, submittingVote,
      jokerMessage, hiddenAnswers, timeRemaining,
      
      // Lobby state
      currentLobby, isHost, currentPlayer, players, gameState, connectionStatus,
      
      // Computed
      currentQuestion, currentReward, isLastQuestion, realPlayerList,
      realPlayerCount, voteStats, votedPlayerCount, allPlayersVoted,
      showVotes, showPlayerAnswers, isDisconnected, availableJokers,
      
      // Methods
      continueFromProgress, showAnswer, nextQuestion, restartGame,
      selectAnswer, submitFinalVote, activateJoker, clearJokerMessage,
      getVoteCount, getVotePercentage, getWrongPlayerCount,
      hasPlayerVoted, getPlayerAnswer, getHostAnswerClasses, getPlayerAnswerClasses
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .max-w-4xl {
    max-width: 100%;
  }
  
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .text-2xl {
    font-size: 1.5rem;
  }
  
  .p-8 {
    padding: 1.5rem;
  }
  
  .fixed.top-4.left-4 {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    top: auto;
    transform: translateX(-50%);
    flex-direction: row;
  }
  
  .w-16.h-16 {
    width: 3rem;
    height: 3rem;
  }
}

@media (max-width: 640px) {
  .text-xl {
    font-size: 1.125rem;
  }
  
  .py-4 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
  
  .px-8 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>