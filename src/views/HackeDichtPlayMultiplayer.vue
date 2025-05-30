<template>
  <div class="min-h-screen p-4">
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
        </div>
      </div>

      <!-- Jokers Panel (Host only) -->
      <div class="fixed top-4 left-4 z-40 flex flex-col gap-3">
        <button
          v-for="(joker, type) in availableJokers"
          :key="type"
          @click="activateJoker(type)"
          :disabled="joker.used || gamePhase !== 'voting'"
          :class="[
            'p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center w-16 h-16',
            joker.used ? 'bg-gray-600/30 border-gray-400/30 opacity-50 cursor-not-allowed' : 'bg-blue-600/30 border-blue-400/50 hover:bg-blue-600/50 cursor-pointer'
          ]"
          :title="joker.name"
        >
          <div class="text-2xl">{{ joker.icon }}</div>
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
            
            <!-- Vote Count & Percentage -->
            <div v-if="showVotes" class="text-right">
              <div class="text-lg font-bold">{{ getVoteCount(index) }}</div>
              <div class="text-sm opacity-75">{{ getVotePercentage(index) }}%</div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="text-center">
          <button
            v-if="gamePhase === 'voting'"
            @click="showAnswer"
            :disabled="!allPlayersVoted && timeRemaining > 0"
            class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {{ allPlayersVoted ? 'Antwort zeigen' : `Warten auf Spieler (${votedPlayerCount}/${onlinePlayerCount})` }}
          </button>
          
          <button
            v-else-if="gamePhase === 'results'"
            @click="nextQuestion"
            class="bg-white text-orange-600 py-4 px-8 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors"
          >
            {{ isLastQuestion ? 'Quiz beenden' : 'Nächste Frage' }}
          </button>
        </div>

        <!-- Answer Feedback -->
        <div v-if="gamePhase === 'results'" class="text-center mt-6">
          <div class="text-green-400 text-2xl font-bold mb-2">
            ✅ Die richtige Antwort ist {{ String.fromCharCode(65 + currentQuestion.correctAnswer) }}!
          </div>
          <div class="text-orange-200 text-lg">
            Wer falsch lag, trinkt: {{ currentReward?.name }}! 🍻
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
      
      <!-- Player Header -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-white mb-1">Frage {{ currentQuestionIndex + 1 }}/15</h1>
        <div class="text-orange-200 text-sm">
          {{ timeRemaining > 0 ? `${timeRemaining}s verbleibend` : 'Zeit abgelaufen' }}
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
            :disabled="submittingVote"
            class="w-full p-4 bg-white/20 border-2 border-white/30 rounded-lg text-white font-medium text-left hover:bg-white/30 hover:border-orange-400/50 transition-all disabled:opacity-50"
          >
            <span class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold text-sm">
                {{ String.fromCharCode(65 + index) }}
              </span>
              {{ answer.text }}
            </span>
          </button>
        </div>

        <!-- Waiting State -->
        <div v-else-if="hasVoted" class="text-center py-8">
          <div class="text-6xl mb-4">✓</div>
          <h3 class="text-xl font-bold text-white mb-2">Antwort abgegeben!</h3>
          <p class="text-orange-200">Warte auf andere Spieler...</p>
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
              'text-lg font-medium',
              selectedAnswer === currentQuestion.correctAnswer ? 'text-green-400' : 'text-red-400'
            ]">
              {{ selectedAnswer === currentQuestion.correctAnswer ? '🎉 Richtig!' : '❌ Falsch!' }}
            </div>
          </div>

          <!-- Vote Results -->
          <div class="space-y-2">
            <div
              v-for="(answer, index) in currentQuestion.answers"
              :key="index"
              class="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <span class="text-white">{{ String.fromCharCode(65 + index) }}: {{ answer.text }}</span>
              <span class="text-orange-200 font-bold">{{ getVotePercentage(index) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Player Status -->
      <div class="bg-white/10 rounded-lg p-4 border border-white/20">
        <div class="flex items-center justify-center gap-3">
          <div class="text-2xl">{{ currentPlayer?.icon }}</div>
          <div>
            <div class="text-white font-medium">{{ currentPlayer?.name }}</div>
            <div class="text-orange-200 text-sm">
              {{ hasVoted ? '✓ Abgestimmt' : 'Wähle deine Antwort' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Finished -->
    <div v-if="gamePhase === 'finished'" class="max-w-2xl mx-auto text-center">
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        <div class="text-6xl mb-6">🎉</div>
        <h2 class="text-3xl font-bold text-white mb-4">Quiz beendet!</h2>
        <p class="text-orange-200 text-lg mb-6">Alle 15 Fragen geschafft!</p>
        
        <div class="flex gap-4 justify-center">
          <button
            @click="backToGallery"
            class="bg-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/30"
          >
            Zur Galerie
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'
import { hackeDichtStore } from '../store/hackeDichtStore'

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
      currentLobby,
      isHost,
      currentPlayer,
      players,
      gameState,
      submitVote,
      activateJoker: activateJokerAction,
      getVoteStats,
      hasVoted: hasPlayerVoted
    } = useLobby()

    const game = ref(null)
    const submittingVote = ref(false)
    const timeRemaining = ref(30)
    const selectedAnswer = ref(null)
    let timer = null

    // Computed Properties
    const currentQuestionIndex = computed(() => gameState.value?.currentQuestionIndex || 0)
    const gamePhase = computed(() => gameState.value?.phase || 'voting') // 'voting', 'results', 'finished'
    
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

    const voteStats = computed(() => {
      return getVoteStats(currentQuestionIndex.value)
    })

    const votedPlayerCount = computed(() => voteStats.value.totalVotes)
    
    const allPlayersVoted = computed(() => votedPlayerCount.value >= onlinePlayerCount.value)

    const hasVoted = computed(() => {
      return hasPlayerVoted(currentQuestionIndex.value, currentPlayer.value?.id)
    })

    const showVotes = computed(() => {
      return gamePhase.value === 'results' || (gamePhase.value === 'voting' && allPlayersVoted.value)
    })

    const availableJokers = computed(() => ({
      fiftyFifty: {
        name: '50/50 Joker',
        icon: '🎯',
        used: gameState.value?.jokers?.fiftyFifty?.used || false
      },
      publikum: {
        name: 'Publikums-Joker',
        icon: '👥',
        used: gameState.value?.jokers?.publikum?.used || false
      },
      telefon: {
        name: 'Telefon-Joker',
        icon: '📞',
        used: gameState.value?.jokers?.telefon?.used || false
      }
    }))

    // Methods
    const getVoteCount = (answerIndex) => {
      return voteStats.value.answerCounts[answerIndex] || 0
    }

    const getVotePercentage = (answerIndex) => {
      return voteStats.value.percentages[answerIndex] || 0
    }

    const getAnswerClasses = (index) => {
      if (gamePhase.value === 'voting') {
        return 'bg-white/20 text-white border-2 border-white/30'
      } else if (gamePhase.value === 'results') {
        if (index === currentQuestion.value.correctAnswer) {
          return 'bg-green-600 text-white border-2 border-green-400 animate-pulse shadow-lg shadow-green-400/50'
        } else {
          return 'bg-white/10 text-white/50 border-2 border-white/20'
        }
      }
      return 'bg-white/20 text-white border-2 border-white/30'
    }

    const submitPlayerVote = async (answerIndex) => {
      if (submittingVote.value || hasVoted.value) return
      
      submittingVote.value = true
      try {
        selectedAnswer.value = answerIndex
        await submitVote(currentQuestionIndex.value, answerIndex)
      } catch (error) {
        console.error('Vote error:', error)
        selectedAnswer.value = null
      } finally {
        submittingVote.value = false
      }
    }

    const showAnswer = async () => {
      // Host zeigt Antwort - Update game phase
      // TODO: Implement phase update in lobbyStore
      console.log('Show answer')
    }

    const nextQuestion = async () => {
      // Host geht zur nächsten Frage
      // TODO: Implement question progression in lobbyStore
      console.log('Next question')
    }

    const activateJoker = async (jokerType) => {
      try {
        await activateJokerAction(jokerType)
      } catch (error) {
        console.error('Joker error:', error)
      }
    }

    const backToGallery = () => {
      router.push('/hacke-dicht/gallery')
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
      } else {
        stopTimer()
      }
    })

    watch(() => allPlayersVoted.value, (allVoted) => {
      if (allVoted && isHost.value && gamePhase.value === 'voting') {
        setTimeout(() => {
          showAnswer()
        }, 2000) // 2 Sekunden Delay
      }
    })

    // Lifecycle
    onMounted(async () => {
      // Load game data
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
      game,
      currentLobby,
      isHost,
      currentPlayer,
      players,
      gameState,
      submittingVote,
      timeRemaining,
      selectedAnswer,
      
      // Computed
      currentQuestionIndex,
      gamePhase,
      currentQuestion,
      currentReward,
      isLastQuestion,
      playerList,
      onlinePlayerCount,
      voteStats,
      votedPlayerCount,
      allPlayersVoted,
      hasVoted,
      showVotes,
      availableJokers,
      
      // Methods
      getVoteCount,
      getVotePercentage,
      getAnswerClasses,
      submitVote: submitPlayerVote,
      showAnswer,
      nextQuestion,
      activateJoker,
      backToGallery,
      hasPlayerVoted
    }
  }
}
</script>