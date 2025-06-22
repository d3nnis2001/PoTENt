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
        :game-name="game?.name || 'AI Takes Over - Multiplayer'"
        @back="handleBackToGallery"
      />

      <LoadingView v-if="isLoading" message="Erstelle Multiplayer-Spiel..." />

      <GameNotFoundView v-else-if="!game" />

      <!-- Lobby Setup (vor Spielstart) -->
      <LobbySetupForm
        v-if="!currentLobby"
        :is-creating-lobby="isCreatingLobby"
        :game-loaded="!!game"
        @create-lobby="createLobby"
      />

      <!-- Warten auf Spieler (nach Lobby-Erstellung) -->
      <LobbyWaitingArea
        v-else-if="currentLobby && currentLobby.status === 'waiting'"
        :lobby-code="currentLobby.code"
        :join-url="joinUrl"
        :player-list="playerList"
        :player-count="realPlayerCount"
        :is-starting-game="isStartingGame"
        @copy-lobby-code="copyLobbyCode"
        @copy-join-url="copyJoinUrl"
        @start-game="startGame"
      />

      <!-- Progress Screen (wie Single-Player) -->
      <ProgressScreen 
        v-else-if="showProgressScreen"
        :game="game"
        :current-question-index="currentQuestionIndex"
        @continue="continueFromProgress"
      />

      <!-- Event Question (wie Single-Player) -->
      <EventQuestionView
        v-else-if="showEventQuestion"
        :event-question="currentEventQuestion"
        @continue="continueAfterEvent"
      />

      <!-- Leaderboard -->
      <LeaderboardView
        v-else-if="showResults"
        :player-stats="playerStats"
        @restart="restartGame"
        @back-to-gallery="handleBackToGallery"
      />

      <!-- Question View (Multiplayer Version) -->
      <div v-else-if="currentQuestion" class="space-y-6">
        <!-- Jokers Display (Host only) -->
        <JokersPanel 
          v-if="currentPlayer?.isHost"
          :jokers="jokers"
          :game-phase="gamePhase"
          @use-joker="handleJokerUse"
        />

        <!-- Question Header -->
        <QuestionHeader 
          :question-index="currentQuestionIndex"
          :current-reward="currentReward"
          :is-host="currentPlayer?.isHost || false"
          :real-player-count="realPlayerCount"
          :voted-player-count="votedPlayerCount"
        />

        <!-- Question Card mit integrierten Votes -->
        <QuestionCard
          :question="currentQuestion"
          :game-phase="gamePhase"
          :hidden-answers="hiddenAnswers"
          :is-last-question="isLastQuestion"
          :is-host="currentPlayer?.isHost || false"
          :selected-answer="null"
          :has-voted-final="false"
          :submitting-vote="false"
          :vote-stats="currentVoteStats"
          :show-votes="gamePhase === 'showing_answer'"
          :real-player-count="realPlayerCount"
          :voted-player-count="votedPlayerCount"
          :all-players-voted="allPlayersVoted"
          :is-disconnected="connectionStatus !== 'connected'"
          @show-answer="showAnswer"
          @next-question="nextQuestion"
          @select-answer="() => {}"
          @submit-final-vote="() => {}"
        />

        <!-- Answer Feedback -->
        <AnswerFeedback
          v-if="gamePhase === 'showing_answer'"
          :correct-answer="currentQuestion.correctAnswer"
          :current-reward="currentReward"
          :is-host="currentPlayer?.isHost || false"
          :wrong-player-count="getWrongPlayerCount()"
          :selected-answer="null"
        />
      </div>

      <!-- Joker Message Modal (wie Single-Player) -->
      <JokerMessageModal
        v-if="jokerMessage"
        :joker-message="jokerMessage"
        @close="clearJokerMessage"
      />
      
      <!-- Teaser Modal (nur für Host) -->
      <TeaserModal
        v-if="currentPlayer?.isHost"
        :visible="teaserModal.visible"
        :message="teaserModal.message"
        :category="teaserModal.category"
        :duration="10"
        @close="closeTeaserModal"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'
import { aiTakesOverStore } from '../store/aiTakesOverStore'
import { useAudio } from '../composables/useAudio'
import { globalToast } from '../composables/useToast'

// Import Komponenten
import GameHeader from '../components/hacke-dicht/GameHeader.vue'
import LoadingView from '../components/hacke-dicht/LoadingView.vue'
import GameNotFoundView from '../components/hacke-dicht/GameNotFoundView.vue'
import ProgressScreen from '../components/hacke-dicht/ProgressScreen.vue'
import EventQuestionView from '../components/hacke-dicht/EventQuestionView.vue'
import LeaderboardView from '../components/hacke-dicht/LeaderboardView.vue'
import JokerMessageModal from '../components/hacke-dicht/JokerMessageModal.vue'
import AudioControls from '../components/AudioControls.vue'
import JokersPanel from '../components/hacke-dicht/JokersPanel.vue'

// Multiplayer Komponenten
import QuestionCard from '../components/hacke-dicht-multiplayer/QuestionCard.vue'
import QuestionHeader from '../components/hacke-dicht-multiplayer/QuestionHeader.vue'
import AnswerFeedback from '../components/hacke-dicht-multiplayer/AnswerFeedback.vue'
import LobbySetupForm from '../components/hacke-dicht-multiplayer/LobbySetupForm.vue'
import LobbyWaitingArea from '../components/hacke-dicht-multiplayer/LobbyWaitingArea.vue'
import TeaserModal from '../components/hacke-dicht-multiplayer/TeaserModal.vue'

// Import Teaser Messages
import teaserMessages from '../data/teaserMessages.json'

export default {
  name: 'AiTakesOverPlayMultiplayer',
  components: {
    GameHeader,
    LoadingView,
    GameNotFoundView,
    ProgressScreen,
    EventQuestionView,
    LeaderboardView,
    JokerMessageModal,
    AudioControls,
    JokersPanel,
    QuestionCard,
    QuestionHeader,
    AnswerFeedback,
    LobbySetupForm,
    LobbyWaitingArea,
    TeaserModal
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
    
    // Lobby Management
    const {
      currentLobby, currentPlayer, players, gameState, connectionStatus,
      createLobby: createLobbyAction, startGame: startGameAction,
      nextQuestion: nextQuestionAction, showAnswer: showAnswerAction,
      continueEvent: continueEventAction, continueFromProgress: continueFromProgressAction
    } = useLobby()
    
    // Audio System
    const {
      isAudioEnabled, isPlaying, stopAudio, toggleAudio, toggleAudioEnabled,
      playQuestionAudio, playCorrectAnswerAudio, playJokerAudio, playGameStartAudio, initAudio
    } = useAudio()

    // Game State
    const isLoading = ref(true)
    const game = ref(null)
    const gamePhase = ref('progress')
    const showResults = ref(false)
    const showEventQuestion = ref(false)
    const showProgressScreen = ref(true)
    const currentEventQuestion = ref(null)
    const eventQueue = ref([])

    // Lobby Setup State
    const isCreatingLobby = ref(false)
    const isStartingGame = ref(false)

    // Joker System
    const jokers = ref({
      fiftyFifty: { used: false },
      randomPerson: { used: false },
      reveal: { used: false }
    })
    const hiddenAnswers = ref([])
    const jokerMessage = ref(null)
    
    // Teaser System
    const playerStats = ref({})
    const teaserModal = ref({
      visible: false,
      message: '',
      category: 'middle'
    })
    const questionsSinceLastTeaser = ref(0)
    const nextTeaserInterval = ref(Math.random() < 0.5 ? 2 : 3) // Random 2 oder 3

    // Computed Properties
    const currentQuestionIndex = computed(() => {
      return gameState.value?.currentQuestionIndex || 0
    })

    const currentQuestion = computed(() => {
      if (!currentLobby.value?.gameData || showResults.value) return null
      return currentLobby.value.gameData.questions[currentQuestionIndex.value]
    })

    const currentReward = computed(() => {
      if (!currentLobby.value?.gameData) return null
      const questionNumber = currentQuestionIndex.value + 1
      if (questionNumber <= 5) return currentLobby.value.gameData.rewards[0]
      if (questionNumber <= 10) return currentLobby.value.gameData.rewards[1]
      return currentLobby.value.gameData.rewards[2]
    })

    const isLastQuestion = computed(() => {
      return currentQuestionIndex.value >= 14
    })

    // Multiplayer Computed
    const realPlayerList = computed(() => {
      const playerList = Object.values(players.value || {})
        .filter(p => p.isOnline && !p.isModerator)
      console.log('🤖 RealPlayerList:', playerList)
      return playerList
    })

    const playerList = computed(() => {
      const allPlayers = Object.values(players.value || {})
        .filter(p => p.isOnline && !p.isHost && !p.isModerator)
      console.log('🤖 PlayerList for Display:', allPlayers)
      return allPlayers
    })

    const realPlayerCount = computed(() => realPlayerList.value.length)

    // Vote Statistics
    const currentVoteStats = computed(() => {
      if (!currentLobby.value) return { answerCounts: {}, percentages: {} }
      
      const votes = currentLobby.value.votes?.[currentQuestionIndex.value] || {}
      const totalVotes = Object.keys(votes).length
      const answerCounts = { 0: 0, 1: 0, 2: 0, 3: 0 }
      
      Object.values(votes).forEach(vote => {
        if (typeof vote.answer === 'number' && vote.answer >= 0 && vote.answer <= 3) {
          answerCounts[vote.answer]++
        }
      })
      
      const percentages = {}
      Object.keys(answerCounts).forEach(answer => {
        percentages[answer] = totalVotes > 0 ? 
          Math.round((answerCounts[answer] / totalVotes) * 100) : 0
      })
      
      return { totalVotes, answerCounts, percentages }
    })

    const votedPlayerCount = computed(() => {
      if (!currentLobby.value) return 0
      const votes = currentLobby.value.votes?.[currentQuestionIndex.value] || {}
      return Object.keys(votes).length
    })

    const allPlayersVoted = computed(() => {
      return votedPlayerCount.value >= realPlayerCount.value && realPlayerCount.value > 0
    })

    const getWrongPlayerCount = () => {
      const votes = currentLobby.value?.votes?.[currentQuestionIndex.value] || {}
      const correctAnswer = currentQuestion.value?.correctAnswer
      return Object.values(votes).filter(vote => vote.answer !== correctAnswer).length
    }

    // Computed für Join URL
    const joinUrl = computed(() => {
      if (!currentLobby.value) return ''
      return `${window.location.origin}/#/play-mobile-ai/${currentLobby.value.code}`
    })

    // Copy Methods
    const copyLobbyCode = async () => {
      if (!currentLobby.value) return
      
      try {
        await navigator.clipboard.writeText(currentLobby.value.code)
        success('Lobby-Code kopiert!')
      } catch (error) {
        showError('Kopieren fehlgeschlagen')
      }
    }

    const copyJoinUrl = async () => {
      try {
        await navigator.clipboard.writeText(joinUrl.value)
        success('Join-Link kopiert!')
      } catch (error) {
        showError('Kopieren fehlgeschlagen')
      }
    }

    // Lobby Methods
    const createLobby = async (hostName) => {
      if (!hostName.trim() || !game.value) {
        showError('Spiel wird noch geladen...')
        return
      }
      
      isCreatingLobby.value = true
      try {
        await createLobbyAction(props.gameId, hostName.trim(), game.value)
        success(`Lobby ${currentLobby.value.code} erstellt!`)
      } catch (error) {
        showError('Fehler beim Erstellen der Lobby: ' + error.message)
      } finally {
        isCreatingLobby.value = false
      }
    }

    const startGame = async () => {
      isStartingGame.value = true
      try {
        await startGameAction()
        success('Spiel gestartet!')
        
        setTimeout(() => {
          playGameStartAudio()
        }, 1000)
        
      } catch (error) {
        showError('Fehler beim Starten: ' + error.message)
      } finally {
        isStartingGame.value = false
      }
    }

    // Game Flow Methods
    const continueFromProgress = async () => {
      console.log('▶️ Continue from progress')
      try {
        await continueFromProgressAction()
        playQuestionAudio(currentQuestionIndex.value + 1)
      } catch (error) {
        showError('Fehler beim Fortsetzen: ' + error.message)
      }
    }

    const showAnswer = async () => {
      console.log('🔍 Show Answer')
      try {
        await showAnswerAction()
        stopAudio()
        playCorrectAnswerAudio()
      } catch (error) {
        showError('Fehler beim Anzeigen der Antwort: ' + error.message)
      }
    }

    const nextQuestion = async () => {
      console.log('➡️ Next Question')
      try {
        hiddenAnswers.value = []
        await nextQuestionAction()
      } catch (error) {
        showError('Fehler bei nächster Frage: ' + error.message)
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

    const continueAfterEvent = async () => {
      console.log('📄 Continue after event')
      try {
        await continueEventAction()
      } catch (error) {
        showError('Fehler beim Event fortsetzen: ' + error.message)
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
      
      if (realPlayerList.value.length === 0) {
        jokerMessage.value = {
          type: 'randomPerson',
          title: 'Zufällige KI-Analyse aktiviert!',
          text: 'Keine Spieler verfügbar. Die KI kann keine Analyse durchführen!'
        }
        return
      }
      
      const randomPlayer = realPlayerList.value[Math.floor(Math.random() * realPlayerList.value.length)]
      
      jokerMessage.value = {
        type: 'randomPerson',
        title: 'Zufällige KI-Analyse aktiviert!',
        text: `${randomPlayer.name} wurde von der KI ausgewählt und muss ihre/seine Antwort preisgeben!`
      }
    }

    const useRevealJoker = () => {
      if (jokers.value.reveal.used) return
      
      jokers.value.reveal.used = true
      
      jokerMessage.value = {
        type: 'reveal',
        title: 'KI-Überwachung aktiviert!',
        text: 'Die KI überwacht jetzt alle Spieler! Alle müssen ihre gewählten Antworten zeigen!'
      }
    }

    const clearJokerMessage = () => {
      jokerMessage.value = null
    }
    
    // Teaser System Methods
    const initializePlayerStats = () => {
      const players = Object.values(currentLobby.value?.players || {})
        .filter(p => !p.isHost && !p.isModerator && p.isOnline)
      
      players.forEach(player => {
        if (!playerStats.value[player.id]) {
          playerStats.value[player.id] = {
            name: player.name,
            correct: 0,
            wrong: 0,
            total: 0
          }
        }
      })
    }
    
    const updatePlayerStats = () => {
      if (!currentLobby.value || !currentQuestion.value) return
      
      const votes = currentLobby.value.votes?.[currentQuestionIndex.value] || {}
      const correctAnswer = currentQuestion.value.correctAnswer
      
      Object.entries(votes).forEach(([playerId, vote]) => {
        if (!playerStats.value[playerId]) {
          const player = Object.values(currentLobby.value.players || {}).find(p => p.id === playerId)
          playerStats.value[playerId] = {
            name: player?.name || 'Unknown',
            correct: 0,
            wrong: 0,
            total: 0
          }
        }
        
        const stat = playerStats.value[playerId]
        stat.total++
        
        if (vote.answer === correctAnswer) {
          stat.correct++
        } else {
          stat.wrong++
        }
      })
      
      console.log('🤖 Updated player stats:', playerStats.value)
    }
    
    const getRandomMessage = (category, playerName) => {
      const messages = teaserMessages[category] || []
      if (messages.length === 0) return ''
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      return randomMessage.replace('{playerName}', playerName)
    }
    
    const shouldShowTeaser = () => {
      questionsSinceLastTeaser.value++
      return questionsSinceLastTeaser.value >= nextTeaserInterval.value
    }
    
    const resetTeaserCounter = () => {
      questionsSinceLastTeaser.value = 0
      nextTeaserInterval.value = Math.random() < 0.5 ? 2 : 3
    }
    
    const showTeaser = () => {
      if (!currentPlayer.value?.isHost || !shouldShowTeaser()) return
      
      const stats = Object.values(playerStats.value).filter(stat => stat.total > 0)
      if (stats.length === 0) return
      
      const playersWithRates = stats.map(stat => ({
        ...stat,
        successRate: stat.total > 0 ? stat.correct / stat.total : 0
      })).sort((a, b) => b.successRate - a.successRate)
      
      if (playersWithRates.length === 0) return
      
      let targetPlayer
      let category
      
      const showBest = Math.random() < 0.5
      
      if (showBest && playersWithRates[0].successRate > 0.5) {
        targetPlayer = playersWithRates[0]
        category = 'best'
      } else if (!showBest && playersWithRates[playersWithRates.length - 1].successRate < 0.5) {
        targetPlayer = playersWithRates[playersWithRates.length - 1]
        category = 'worst'
      } else {
        const middleIndex = Math.floor(playersWithRates.length / 2)
        targetPlayer = playersWithRates[middleIndex]
        category = 'middle'
      }
      
      if (!targetPlayer) return
      
      const message = getRandomMessage(category, targetPlayer.name)
      if (!message) return
      
      teaserModal.value = {
        visible: true,
        message,
        category
      }
      
      resetTeaserCounter()
      console.log('🤖 Showing teaser:', { player: targetPlayer.name, category, message })
    }
    
    const closeTeaserModal = () => {
      teaserModal.value.visible = false
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

        game.value = gameData
        initAudio()
        
      } catch (error) {
        console.error('Error loading game:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Watchers für Lobby-Sync
    watch(() => gameState.value, (newState) => {
      if (!newState) return
      
      console.log('🔄 GameState Update:', {
        phase: newState.phase,
        questionIndex: newState.currentQuestionIndex,
        showProgressScreen: newState.showProgressScreen,
        showEventQuestion: newState.showEventQuestion
      })
      
      if (newState.phase === 'event') {
        console.log('🎭 Switching to event phase')
        if (newState.currentEventQuestion) {
          currentEventQuestion.value = newState.currentEventQuestion
          eventQueue.value = newState.eventQueue || []
          showEventQuestion.value = true
          showProgressScreen.value = false
          gamePhase.value = 'event'
          stopAudio()
        }
      }
      else if (newState.phase === 'progress') {
        console.log('📊 Switching to progress phase')
        showProgressScreen.value = true
        showEventQuestion.value = false
        gamePhase.value = 'progress'
        stopAudio()
      }
      else if (newState.phase === 'voting' && gamePhase.value !== 'reading') {
        console.log('🎯 Switching to reading phase')
        gamePhase.value = 'reading'
        showProgressScreen.value = false
        showEventQuestion.value = false
        
        if (Object.keys(playerStats.value).length === 0) {
          initializePlayerStats()
        }
      } 
      else if (newState.phase === 'results') {
        console.log('📊 Switching to results phase') 
        gamePhase.value = 'showing_answer'
        
        updatePlayerStats()
        setTimeout(() => {
          showTeaser()
        }, 2000)
      } 
      else if (newState.phase === 'finished') {
        console.log('🏁 Game finished')
        showResults.value = true
        showProgressScreen.value = false
        showEventQuestion.value = false
      }
    }, { deep: true })

    // Keyboard Handler
    const handleKeyPress = (event) => {
      if (!currentPlayer.value?.isHost) return
      
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
        else if (gamePhase.value === 'reading') {
          showAnswer()
        }
      }
    }

    onMounted(() => {
      initializeGame()
      window.addEventListener('keydown', handleKeyPress)
    })
    
    // Provide player list for tag parsing
    provide('playerList', computed(() => {
      return realPlayerList.value.map(player => player.name)
    }))

    // Auto-reveal when all players voted
    watch(() => allPlayersVoted.value, (newValue) => {
      if (newValue && 
          currentPlayer.value?.isHost && 
          gamePhase.value === 'reading') {
        console.log('🤖 Alle Spieler haben abgestimmt - zeige Antwort automatisch')
        
        setTimeout(() => {
          showAnswer()
        }, 1500)
      }
    })

    onUnmounted(() => {
      stopAudio()
      window.removeEventListener('keydown', handleKeyPress)
    })

    return {
      // State
      isLoading, game, currentLobby, currentPlayer, players, connectionStatus,
      isCreatingLobby, isStartingGame,
      currentQuestion, currentQuestionIndex, gamePhase,
      showResults, showEventQuestion, showProgressScreen,
      currentEventQuestion, currentReward, isLastQuestion,
      jokers, hiddenAnswers, jokerMessage,
      teaserModal,
      
      // Join URL
      joinUrl,
      
      // Audio
      isAudioEnabled, isPlaying,
      
      // Computed
      realPlayerCount, playerList, currentVoteStats, votedPlayerCount, allPlayersVoted,
      
      // Methods
      createLobby, startGame, copyLobbyCode, copyJoinUrl,
      continueFromProgress, showAnswer, nextQuestion,
      continueAfterEvent, restartGame, handleBackToGallery,
      handleJokerUse, clearJokerMessage, getWrongPlayerCount,
      closeTeaserModal,
      
      // Audio Methods
      toggleAudio, toggleAudioEnabled,
      
      // Utils
      window
    }
  }
}
</script>