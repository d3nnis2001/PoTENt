<template>
  <div class="min-h-screen p-4">
    <!-- Connection Status -->
    <ConnectionStatus 
      :connection-status="connectionStatus"
      @retry="handleRetry"
    />
    
    <!-- Reconnecting Overlay -->
    <LoadingScreen
      v-if="showReconnecting"
      type="connecting"
      title="Verbindung wird wiederhergestellt"
      message="Einen Moment bitte..."
      :show-cancel="true"
      @cancel="$router.push('/hacke-dicht/gallery')"
    />
    
    <!-- Disconnected Warning -->
    <div v-if="isDisconnected && !showReconnecting" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <div class="bg-red-600/20 border border-red-400/30 rounded-lg p-4 max-w-md">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div class="flex-1">
            <p class="text-red-300 font-medium text-sm">Verbindung unterbrochen</p>
            <p class="text-red-200 text-xs">Deine Antworten werden möglicherweise nicht gespeichert</p>
          </div>
          <button 
            @click="handleRetry"
            class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    </div>

    <!-- Host View (Desktop) -->
    <div v-if="isHost" class="max-w-6xl mx-auto">
      
      <!-- Host Game Header -->
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-white mb-2">{{ game?.name || 'Quiz läuft' }}</h1>
        <div class="flex items-center justify-center gap-4 text-orange-200">
          <span>Frage {{ currentQuestionIndex + 1 }}/15</span>
          <span>•</span>
          <span>{{ onlinePlayerCount }} Spieler</span>
          <span>•</span>
          <span v-if="timeRemaining > 0">{{ timeRemaining }}s</span>
          <span v-else class="text-red-300">Zeit abgelaufen</span>
        </div>
      </div>

      <!-- Jokers Panel (Host only) -->
      <div class="fixed top-4 left-4 z-40 flex flex-col gap-2">
        <button
          v-for="(joker, type) in availableJokers"
          :key="type"
          @click="activateJoker(type)"
          :disabled="joker.used || gamePhase !== 'voting' || isDisconnected"
          :class="[
            'p-2 rounded-lg border transition-all flex items-center justify-center w-12 h-12 text-lg',
            joker.used ? 'bg-gray-600/30 border-gray-400/30 opacity-50' : 'bg-blue-600/30 border-blue-400/50 hover:bg-blue-600/50'
          ]"
          :title="joker.name"
        >
          {{ joker.icon }}
        </button>
      </div>

      <!-- Main Question Display -->
      <div v-if="currentQuestion" class="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 shadow-2xl border border-white/20 mb-8">
        <p class="text-white text-2xl leading-relaxed text-center mb-8">
          {{ currentQuestion.question }}
        </p>

        <!-- Answer Options for Host -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div
            v-for="(answer, index) in currentQuestion.answers"
            :key="index"
            :class="[
              'p-4 rounded-lg font-medium text-left flex items-center gap-3 min-h-[60px] transition-all duration-500',
              getAnswerClasses(index)
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
        </div>

        <!-- Action Button -->
        <div class="text-center">
          <button
            v-if="gamePhase === 'voting'"
            @click="showAnswer"
            :disabled="(!allPlayersVoted && timeRemaining > 0) || isDisconnected"
            class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {{ allPlayersVoted ? 'Antwort zeigen' : `Warten (${votedPlayerCount}/${onlinePlayerCount})` }}
          </button>
          
          <button
            v-else-if="gamePhase === 'results'"
            @click="nextQuestion"
            :disabled="isDisconnected"
            class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {{ isLastQuestion ? 'Quiz beenden' : 'Nächste Frage' }}
          </button>
        </div>

        <!-- Answer Feedback -->
        <div v-if="gamePhase === 'results'" class="text-center mt-6">
          <div class="text-green-400 text-2xl font-bold mb-2">
            ✅ Richtige Antwort: {{ String.fromCharCode(65 + currentQuestion.correctAnswer) }}
          </div>
          <div class="text-orange-200 text-lg">
            Wer falsch lag trinkt: {{ currentReward?.name }}! 🍻
          </div>
        </div>
      </div>

      <!-- Player Status Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="player in playerList"
          :key="player.id"
          :class="[
            'bg-white/10 rounded-lg p-3 border transition-all',
            player.isOnline ? 'border-green-400/30' : 'border-gray-400/30',
            hasPlayerVoted(player.id) ? 'bg-green-600/20' : 'bg-white/5'
          ]"
        >
          <div class="flex items-center gap-2">
            <div class="text-lg">{{ player.icon }}</div>
            <div class="flex-1 min-w-0">
              <div class="text-white font-medium truncate">{{ player.name }}</div>
              <div class="text-xs text-orange-200">
                {{ hasPlayerVoted(player.id) ? '✓ Abgestimmt' : 'Wartet...' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Player View (Mobile) -->
    <div v-else class="max-w-md mx-auto">
      
      <!-- Player Header with Connection Status -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-white mb-1">Frage {{ currentQuestionIndex + 1 }}/15</h1>
        <div class="flex items-center justify-center gap-2 text-orange-200 text-sm">
          <span v-if="timeRemaining > 0">{{ timeRemaining }}s verbleibend</span>
          <span v-else class="text-red-300">Zeit abgelaufen</span>
          <span v-if="isDisconnected" class="text-red-300">• Offline</span>
        </div>
      </div>

      <!-- Question for Players -->
      <div v-if="currentQuestion" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
        <p class="text-white text-lg leading-relaxed text-center mb-6">
          {{ currentQuestion.question }}
        </p>

        <!-- Answer Buttons for Players -->
        <div v-if="gamePhase === 'voting' && !hasVoted" class="space-y-3">
          <button
            v-for="(answer, index) in currentQuestion.answers"
            :key="index"
            @click="submitVote(index)"
            :disabled="submittingVote || isDisconnected"
            :class="[
              'w-full p-4 border-2 rounded-lg text-white font-medium text-left hover:bg-white/30 transition-all disabled:opacity-50 flex items-center gap-3',
              submittingVote || isDisconnected 
                ? 'bg-white/10 border-white/20 cursor-not-allowed' 
                : 'bg-white/20 border-white/30 hover:border-orange-400/50 active:bg-white/40'
            ]"
          >
            <span class="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold text-sm flex-shrink-0">
              {{ String.fromCharCode(65 + index) }}
            </span>
            <span class="flex-1">{{ answer.text }}</span>
            <div v-if="submittingVote" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
          </button>
        </div>

        <!-- Waiting State with Animation -->
        <div v-else-if="hasVoted" class="text-center py-8">
          <div class="text-6xl mb-4 animate-bounce">✓</div>
          <h3 class="text-xl font-bold text-white mb-2">Antwort abgegeben!</h3>
          <p class="text-orange-200 mb-4">Warte auf andere Spieler...</p>
          
          <!-- Vote Progress -->
          <div class="bg-white/10 rounded-full h-2 mb-2">
            <div 
              class="bg-green-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${(votedPlayerCount / onlinePlayerCount) * 100}%` }"
            ></div>
          </div>
          <div class="text-sm text-white/70">
            {{ votedPlayerCount }}/{{ onlinePlayerCount }} Spieler haben geantwortet
          </div>
          
          <div class="mt-4 text-sm text-white/70">
            Du hast {{ String.fromCharCode(65 + selectedAnswer) }} gewählt
          </div>
        </div>

        <!-- Results for Players -->
        <div v-else-if="gamePhase === 'results'" class="space-y-4">
          <div class="text-center mb-6">
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

          <!-- Simple Vote Results with Progress Bars -->
          <div class="space-y-3">
            <div
              v-for="(answer, index) in currentQuestion.answers"
              :key="index"
              :class="[
                'p-3 rounded-lg border transition-all',
                index === currentQuestion.correctAnswer 
                  ? 'bg-green-600/20 border-green-400/50' 
                  : 'bg-white/5 border-white/20'
              ]"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-white font-medium">{{ String.fromCharCode(65 + index) }}: {{ answer.text }}</span>
                <span class="text-orange-200 font-bold">{{ getVotePercentage(index) }}%</span>
              </div>
              <div class="bg-white/10 rounded-full h-1">
                <div 
                  :class="[
                    'h-1 rounded-full transition-all duration-1000',
                    index === currentQuestion.correctAnswer ? 'bg-green-400' : 'bg-white/30'
                  ]"
                  :style="{ width: `${getVotePercentage(index)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Joker Status for Players -->
      <div class="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <h3 class="text-white font-semibold mb-3 text-center">Joker Status</h3>
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="(joker, type) in availableJokers"
            :key="type"
            :class="[
              'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
              joker.used 
                ? 'bg-gray-600/30 border-gray-400/30 opacity-50' 
                : 'bg-blue-600/30 border-blue-400/50'
            ]"
          >
            <div class="text-2xl">{{ joker.icon }}</div>
            <div class="text-xs text-white text-center">{{ joker.name }}</div>
            <div :class="[
              'text-xs px-2 py-1 rounded-full',
              joker.used 
                ? 'bg-red-600/30 text-red-300' 
                : 'bg-green-600/30 text-green-300'
            ]">
              {{ joker.used ? 'Benutzt' : 'Verfügbar' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Player Status Card -->
      <div class="bg-white/10 rounded-lg p-4 border border-white/20">
        <div class="flex items-center justify-center gap-3">
          <div class="text-3xl">{{ currentPlayer?.icon }}</div>
          <div class="text-center">
            <div class="text-white font-medium">{{ currentPlayer?.name }}</div>
            <div :class="[
              'text-sm',
              hasVoted ? 'text-green-300' : 'text-orange-200'
            ]">
              {{ hasVoted ? '✓ Abgestimmt' : 'Wähle deine Antwort' }}
            </div>
            <div v-if="isDisconnected" class="text-red-300 text-xs mt-1">
              ⚠️ Verbindung unterbrochen
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Finished -->
    <div v-if="gamePhase === 'finished'" class="max-w-4xl mx-auto text-center">
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        
        <!-- Success Animation -->
        <div class="text-8xl mb-6 animate-bounce">🎉</div>
        <h2 class="text-4xl font-bold text-white mb-4">Quiz beendet!</h2>
        <p class="text-orange-200 text-xl mb-8">Alle 15 Fragen geschafft! Zeit für den finalen Drink! 🍻</p>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white/5 rounded-lg p-4">
            <div class="text-3xl font-bold text-green-400">{{ onlinePlayerCount }}</div>
            <div class="text-orange-200 text-sm">Spieler</div>
          </div>
          <div class="bg-white/5 rounded-lg p-4">
            <div class="text-3xl font-bold text-blue-400">15</div>
            <div class="text-orange-200 text-sm">Fragen</div>
          </div>
          <div class="bg-white/5 rounded-lg p-4">
            <div class="text-3xl font-bold text-purple-400">{{ Math.round(gameTime / 60) }}</div>
            <div class="text-orange-200 text-sm">Minuten</div>
          </div>
        </div>
        
        <!-- Player List with Icons -->
        <div class="mb-8">
          <h3 class="text-xl font-bold text-white mb-4">Mitspieler</h3>
          <div class="flex flex-wrap justify-center gap-4">
            <div 
              v-for="player in playerList"
              :key="player.id"
              class="bg-white/10 rounded-lg p-3 flex items-center gap-2"
            >
              <div class="text-2xl">{{ player.icon }}</div>
              <div class="text-white font-medium">{{ player.name }}</div>
              <div v-if="player.isHost" class="text-yellow-400 text-xs">👑</div>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-4 justify-center">
          <button
            v-if="isHost"
            @click="startNewGame"
            :disabled="isDisconnected"
            class="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
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
        
        <!-- Fun Closing Message -->
        <div class="mt-8 p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg border border-orange-400/30">
          <p class="text-orange-200 text-lg font-medium">
            Hoffentlich seid ihr jetzt richtig hacke! 🍺
          </p>
          <p class="text-orange-300 text-sm mt-1">
            Spielt verantwortungsvoll und passt aufeinander auf! ❤️
          </p>
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
import { ref as dbRef, set, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '../firebase/config'
import ConnectionStatus from '../components/ConnectionStatus.vue'
import LoadingScreen from '../components/LoadingScreen.vue'

export default {
  name: 'HackeDichtPlayMultiplayer',
  components: {
    ConnectionStatus,
    LoadingScreen
  },
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

    const game = ref(null)
    const submittingVote = ref(false)
    const timeRemaining = ref(30)
    const selectedAnswer = ref(null)
    const showReconnecting = ref(false)
    const gameTime = ref(0)
    let timer = null
    let gameStartTime = Date.now()

    // Computed Properties
    const currentQuestionIndex = computed(() => gameState.value?.currentQuestionIndex || 0)
    const gamePhase = computed(() => gameState.value?.phase || 'voting')
    
    const currentQuestion = computed(() => {
      if (!game.value) return null
      return game.value.questions[currentQuestionIndex.value]
    })

    const currentReward = computed(() => {
      if (!game.value) return null
      const questionNumber = currentQuestionIndex.value + 1
      if (questionNumber <= 5) return game.value.rewards[0]
      if (questionNumber <= 10) return game.value.rewards[1]
      return game.value.rewards[2]
    })

    const isLastQuestion = computed(() => currentQuestionIndex.value >= 14)

    const playerList = computed(() => {
      return Object.values(players.value || {})
        .filter(p => p.isOnline)
        .sort((a, b) => a.name.localeCompare(b.name))
    })

    const onlinePlayerCount = computed(() => playerList.value.length)

    // Vote Stats
    const voteStats = computed(() => lobbyStore.getVoteStats(currentQuestionIndex.value))
    const votedPlayerCount = computed(() => voteStats.value.totalVotes)
    const allPlayersVoted = computed(() => lobbyStore.allPlayersVoted(currentQuestionIndex.value))
    const hasVoted = computed(() => lobbyStore.hasPlayerVoted(currentQuestionIndex.value, currentPlayer.value?.id))
    const showVotes = computed(() => gamePhase.value === 'results' || (isHost.value && allPlayersVoted.value))

    // Joker Status
    const availableJokers = computed(() => ({
      fiftyFifty: {
        name: '50/50',
        icon: '🎯',
        used: gameState.value?.jokers?.fiftyFifty?.used || false
      },
      publikum: {
        name: 'Publikum',
        icon: '👥',
        used: gameState.value?.jokers?.publikum?.used || false
      },
      telefon: {
        name: 'Telefon',
        icon: '📞',
        used: gameState.value?.jokers?.telefon?.used || false
      }
    }))

    // Connection handling
    const isDisconnected = computed(() => connectionStatus.value === 'disconnected')
    const isConnecting = computed(() => connectionStatus.value === 'connecting')

    // Methods
    const getVoteCount = (answerIndex) => voteStats.value.answerCounts[answerIndex] || 0
    const getVotePercentage = (answerIndex) => voteStats.value.percentages[answerIndex] || 0

    const getAnswerClasses = (index) => {
      if (gamePhase.value === 'voting') {
        return 'bg-white/20 text-white border-2 border-white/30'
      } else if (gamePhase.value === 'results') {
        if (index === currentQuestion.value.correctAnswer) {
          return 'bg-green-600 text-white border-2 border-green-400 animate-pulse'
        } else {
          return 'bg-white/10 text-white/50 border-2 border-white/20'
        }
      }
      return 'bg-white/20 text-white border-2 border-white/30'
    }

    const submitPlayerVote = async (answerIndex) => {
      if (submittingVote.value || hasVoted.value || isDisconnected.value) return
      
      submittingVote.value = true
      try {
        selectedAnswer.value = answerIndex
        await submitVote(currentQuestionIndex.value, answerIndex)
      } catch (error) {
        console.error('Vote error:', error)
        selectedAnswer.value = null
        showError('Fehler beim Abstimmen')
      } finally {
        submittingVote.value = false
      }
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
      try {
        await lobbyStore.nextQuestion()
      } catch (error) {
        showError('Fehler bei der nächsten Frage')
      }
    }

    const activateJoker = async (jokerType) => {
      if (!isHost.value || isDisconnected.value) return
      try {
        await activateJokerAction(jokerType)
        success(`${availableJokers.value[jokerType].name} aktiviert!`)
      } catch (error) {
        console.error('Joker error:', error)
        showError('Fehler beim Aktivieren des Jokers')
      }
    }

    const hasPlayerVoted = (playerId) => {
      return lobbyStore.hasPlayerVoted(currentQuestionIndex.value, playerId)
    }

    const handleRetry = async () => {
      showReconnecting.value = true
      try {
        await manualRetry()
      } finally {
        showReconnecting.value = false
      }
    }

    const startNewGame = async () => {
      if (!isHost.value || isDisconnected.value) return
      
      try {
        // Reset game state
        await set(dbRef(realtimeDb, `lobbies/${currentLobby.value.code}/gameState/currentQuestionIndex`), 0)
        await set(dbRef(realtimeDb, `lobbies/${currentLobby.value.code}/gameState/phase`), 'voting')
        await set(dbRef(realtimeDb, `lobbies/${currentLobby.value.code}/gameState/jokers`), {
          fiftyFifty: { used: false, activatedBy: null },
          publikum: { used: false, activatedBy: null },
          telefon: { used: false, activatedBy: null }
        })
        await set(dbRef(realtimeDb, `lobbies/${currentLobby.value.code}/votes`), {})
        
        gameStartTime = Date.now()
        success('Neues Spiel gestartet!')
        
      } catch (error) {
        console.error('Failed to start new game:', error)
        showError('Fehler beim Starten des neuen Spiels')
      }
    }

    const startTimer = () => {
      timeRemaining.value = 30
      timer = setInterval(() => {
        timeRemaining.value--
        if (timeRemaining.value <= 0) {
          clearInterval(timer)
          if (isHost.value && gamePhase.value === 'voting') {
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
      if (newPhase === 'voting') {
        startTimer()
        selectedAnswer.value = null // Reset selection for new question
        if (currentQuestionIndex.value === 0) {
          gameStartTime = Date.now()
        }
      } else {
        stopTimer()
        if (newPhase === 'finished') {
          gameTime.value = (Date.now() - gameStartTime) / 1000
        }
      }
    })

    watch(() => allPlayersVoted.value, (allVoted) => {
      if (allVoted && isHost.value && gamePhase.value === 'voting') {
        setTimeout(showAnswer, 2000)
      }
    })

    // Handle disconnection
    watch(isDisconnected, (disconnected) => {
      if (disconnected) {
        stopTimer()
      }
    })

    // Lifecycle
    onMounted(async () => {
      if (currentLobby.value?.gameId) {
        game.value = hackeDichtStore.getGame(currentLobby.value.gameId)
      }
      
      if (gamePhase.value === 'voting') {
        startTimer()
      }
    })

    onUnmounted(() => {
      stopTimer()
    })

    return {
      // State
      game, currentLobby, isHost, currentPlayer, players, gameState,
      submittingVote, timeRemaining, selectedAnswer, showReconnecting, gameTime,
      
      // Computed
      currentQuestionIndex, gamePhase, currentQuestion, currentReward,
      isLastQuestion, playerList, onlinePlayerCount, voteStats,
      votedPlayerCount, allPlayersVoted, hasVoted, showVotes, availableJokers,
      isDisconnected, isConnecting, isOnline, connectionStatus,
      
      // Methods
      getVoteCount, getVotePercentage, getAnswerClasses, 
      submitVote: submitPlayerVote, showAnswer, nextQuestion, activateJoker, 
      hasPlayerVoted, handleRetry, startNewGame
    }
  }
}
</script>