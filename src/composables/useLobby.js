import { ref, computed, onMounted, onUnmounted } from 'vue'
import { lobbyStore } from '../store/lobbyStore'
import { isValidLobbyCode, isValidPlayerName, calculateVoteStats } from '../utils/lobbyUtils'

export function useLobby() {
  const error = ref('')
  const isLoading = ref(false)
  
  // Reactive getters
  const currentLobby = computed(() => lobbyStore.currentLobby)
  const isHost = computed(() => lobbyStore.isHost)
  const currentPlayer = computed(() => lobbyStore.currentPlayer)
  const players = computed(() => lobbyStore.players)
  const gameState = computed(() => lobbyStore.gameState)
  const connectionStatus = computed(() => lobbyStore.connectionStatus)
  
  const onlinePlayers = computed(() => lobbyStore.getOnlinePlayers())
  const playerCount = computed(() => lobbyStore.getPlayerCount())
  const canStartGame = computed(() => lobbyStore.canStartGame())
  
    const createLobby = async (gameId, hostName, gameData) => {
    try {
        error.value = ''
        isLoading.value = true
        
        if (!isValidPlayerName(hostName)) {
        throw new Error('Ungültiger Name')
        }
        if (!gameData) {
        throw new Error('Spieldaten fehlen')
        }
        
        const lobbyCode = await lobbyStore.createLobby(gameId, hostName, gameData)
        return lobbyCode
        
    } catch (err) {
        error.value = err.message
        throw err
    } finally {
        isLoading.value = false
    }
    }
  
  // Lobby beitreten
  const joinLobby = async (lobbyCode, playerName, playerIcon) => {
    try {
      error.value = ''
      isLoading.value = true
      
      if (!isValidLobbyCode(lobbyCode)) {
        throw new Error('Ungültiger Lobby-Code')
      }
      
      if (!isValidPlayerName(playerName)) {
        throw new Error('Ungültiger Name (2-20 Zeichen)')
      }
      
      const lobby = await lobbyStore.joinLobby(lobbyCode, playerName, playerIcon)
      return lobby
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Spiel starten
  const startGame = async () => {
    try {
      error.value = ''
      await lobbyStore.startGame()
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  // Vote abgeben
  const submitVote = async (questionIndex, answerIndex) => {
    try {
      error.value = ''
      await lobbyStore.submitVote(questionIndex, answerIndex)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  // Joker aktivieren
  const activateJoker = async (jokerType) => {
    try {
      error.value = ''
      await lobbyStore.activateJoker(jokerType)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  // Lobby verlassen
  const leaveLobby = async () => {
    try {
      await lobbyStore.leaveLobby()
    } catch (err) {
      console.error('Fehler beim Verlassen:', err)
    }
  }
  
  // Voting-Statistiken für eine Frage
  const getVoteStats = (questionIndex) => {
    const votes = lobbyStore.getVotesForQuestion(questionIndex)
    return calculateVoteStats(votes)
  }
  
  // Hat Spieler für Frage gestimmt
  const hasVoted = (questionIndex, playerId = null) => {
    return lobbyStore.hasPlayerVoted(questionIndex, playerId)
  }
  
  // Cleanup bei Component Unmount
  onUnmounted(() => {
    // Hier könnten wir Listener entfernen, aber Firebase macht das automatisch
  })
  
  return {
    // State
    currentLobby,
    isHost,
    currentPlayer,
    players,
    gameState,
    connectionStatus,
    error,
    isLoading,
    
    // Computed
    onlinePlayers,
    playerCount,
    canStartGame,
    
    // Methods
    createLobby,
    joinLobby,
    startGame,
    submitVote,
    activateJoker,
    leaveLobby,
    getVoteStats,
    hasVoted,
    
    // Utils
    clearError: () => { error.value = '' }
  }
}