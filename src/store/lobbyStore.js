import { reactive } from 'vue'
import { 
  ref as dbRef, 
  set, 
  get, 
  onValue, 
  remove,
  serverTimestamp,
  onDisconnect,
  update
} from 'firebase/database'
import { realtimeDb } from '../firebase/config'

export const lobbyStore = reactive({
  currentLobby: null,
  isHost: false,
  currentPlayer: null,
  players: {},
  gameState: null,
  connectionStatus: 'disconnected',
  unsubscribeListener: null,
  
  // Vereinfachte Lobby-Erstellung (direkt beim Multiplayer-Start)
  async createLobby(gameId, hostName, gameData) {
    try {
      this.connectionStatus = 'connecting'
      
      const lobbyCode = this.generateLobbyCode()
      const hostId = this.generatePlayerId()
      
      const lobbyData = {
        code: lobbyCode,
        gameId: parseInt(gameId),
        gameData: gameData, // Game-Daten für mobile Clients
        hostId: hostId,
        status: 'waiting',
        createdAt: serverTimestamp(),
        settings: {
          maxPlayers: 20,
          questionTimer: 30,
        },
        gameState: {
          currentQuestionIndex: 0,
          phase: 'lobby',
          questionStartTime: null,
          jokers: {
            fiftyFifty: { used: false },
            randomPerson: { used: false },
            reveal: { used: false }
          }
        },
        players: {
          [hostId]: {
            id: hostId,
            name: hostName,
            isHost: true,
            isOnline: true,
            icon: '👑',
            joinedAt: serverTimestamp(),
            lastSeen: serverTimestamp(),
            isModerator: true
          }
        },
        votes: {}
      }
      
      const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
      await set(lobbyRef, lobbyData)
      
      // Disconnect-Handler
      const hostPresenceRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/players/${hostId}/isOnline`)
      onDisconnect(hostPresenceRef).set(false)
      
      // Lokalen State setzen
      this.currentLobby = { ...lobbyData, code: lobbyCode }
      this.isHost = true
      this.currentPlayer = lobbyData.players[hostId]
      this.players = lobbyData.players
      this.gameState = lobbyData.gameState
      this.connectionStatus = 'connected'
      
      // Updates abonnieren
      this.subscribeToLobby(lobbyCode)
      
      return lobbyCode
      
    } catch (error) {
      console.error('Fehler beim Erstellen der Lobby:', error)
      this.connectionStatus = 'disconnected'
      throw error
    }
  },
  
  // Vereinfachtes Beitreten (nur für mobile Spieler)
  async joinLobby(lobbyCode, playerName, playerIcon = '🎮') {
    try {
      this.connectionStatus = 'connecting'
      
      const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
      const lobbySnapshot = await get(lobbyRef)
      
      if (!lobbySnapshot.exists()) {
        throw new Error('Lobby nicht gefunden')
      }
      
      const lobbyData = lobbySnapshot.val()
      
      // Validierung
      const playerCount = Object.keys(lobbyData.players || {}).length
      if (playerCount >= lobbyData.settings.maxPlayers) {
        throw new Error('Lobby ist voll')
      }
      
      const existingNames = Object.values(lobbyData.players || {}).map(p => p.name.toLowerCase())
      if (existingNames.includes(playerName.toLowerCase())) {
        throw new Error('Name bereits vergeben')
      }
      
      // Spieler hinzufügen
      const playerId = this.generatePlayerId()
      const playerData = {
        id: playerId,
        name: playerName,
        isHost: false,
        isOnline: true,
        icon: playerIcon,
        joinedAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      }
      
      const playerRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/players/${playerId}`)
      await set(playerRef, playerData)
      
      // Disconnect-Handler
      const presenceRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/players/${playerId}/isOnline`)
      onDisconnect(presenceRef).set(false)
      
      this.currentLobby = lobbyData
      this.currentPlayer = playerData
      this.isHost = false
      this.connectionStatus = 'connected'
      
      this.subscribeToLobby(lobbyCode)
      
      return lobbyData
      
    } catch (error) {
      console.error('Fehler beim Beitreten:', error)
      this.connectionStatus = 'disconnected'
      throw error
    }
  },
  
  // Updates abonnieren
  subscribeToLobby(lobbyCode) {
    if (this.unsubscribeListener) {
      this.unsubscribeListener()
    }
    
    const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
    
    this.unsubscribeListener = onValue(lobbyRef, (snapshot) => {
      if (snapshot.exists()) {
        const lobbyData = snapshot.val()
        this.currentLobby = lobbyData
        this.players = lobbyData.players || {}
        this.gameState = lobbyData.gameState || null
      } else {
        this.reset()
      }
    })
  },
  
  // Spiel starten (nur Host)
  async startGame() {
    if (!this.isHost || !this.currentLobby) return
    
    try {
      const lobbyCode = this.currentLobby.code
      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/status`), 'playing')
      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/phase`), 'voting')
      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/questionStartTime`), serverTimestamp())
    } catch (error) {
      console.error('Fehler beim Starten:', error)
      throw error
    }
  },
  
  // Vote abgeben
  async submitVote(questionIndex, answerIndex) {
    if (!this.currentPlayer || !this.currentLobby) return
    
    try {
      const voteRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/votes/${questionIndex}/${this.currentPlayer.id}`)
      await set(voteRef, {
        answer: answerIndex,
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Fehler beim Voten:', error)
      throw error
    }
  },
  
    async nextQuestion() {
    if (!this.isHost || !this.currentLobby) return
    
    try {
        const nextIndex = this.currentLobby.gameState.currentQuestionIndex + 1
        const lobbyCode = this.currentLobby.code
        
        if (nextIndex >= 15) {
        // Spiel beenden
        const updates = {}
        updates[`lobbies/${lobbyCode}/status`] = 'finished'
        updates[`lobbies/${lobbyCode}/gameState/phase`] = 'finished'
        updates[`lobbies/${lobbyCode}/gameState/finishedAt`] = serverTimestamp()
        
        await update(dbRef(realtimeDb), updates)
        } else {
        // Nächste Frage - ATOMIC UPDATE für Synchronisation
        const updates = {}
        updates[`lobbies/${lobbyCode}/gameState/currentQuestionIndex`] = nextIndex
        updates[`lobbies/${lobbyCode}/gameState/phase`] = 'voting'
        updates[`lobbies/${lobbyCode}/gameState/questionStartTime`] = serverTimestamp()
        
        // Votes für neue Frage löschen (wichtig für clean state)
        updates[`lobbies/${lobbyCode}/votes/${nextIndex}`] = null
        
        // ATOMIC UPDATE - alle Änderungen gleichzeitig
        await update(dbRef(realtimeDb), updates)
        
        console.log(`Frage ${nextIndex} gestartet`)
        }
    } catch (error) {
        console.error('Fehler bei nächster Frage:', error)
        throw error
    }
    },
  
  // Antwort zeigen (nur Host)
  async showAnswer() {
    if (!this.isHost || !this.currentLobby) return
    
    try {
      await set(dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/gameState/phase`), 'results')
    } catch (error) {
      console.error('Fehler beim Antwort zeigen:', error)
      throw error
    }
  },
  
  // Joker aktivieren (nur Host)
  async activateJoker(jokerType) {
    if (!this.isHost || !this.currentLobby) return
    
    try {
      const jokerRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/gameState/jokers/${jokerType}`)
      await set(jokerRef, {
        used: true,
        activatedBy: this.currentPlayer.id,
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Fehler beim Joker:', error)
      throw error
    }
  },
  
  // Lobby verlassen
  async leaveLobby() {
    if (!this.currentLobby || !this.currentPlayer) return
    
    try {
      if (this.isHost) {
        // Host löscht ganze Lobby
        const lobbyRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}`)
        await remove(lobbyRef)
      } else {
        // Spieler entfernt sich selbst
        const playerRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/players/${this.currentPlayer.id}`)
        await remove(playerRef)
      }
      
      this.reset()
    } catch (error) {
      console.error('Fehler beim Verlassen:', error)
      this.reset()
    }
  },
  
  // State zurücksetzen
  reset() {
    if (this.unsubscribeListener) {
      this.unsubscribeListener()
      this.unsubscribeListener = null
    }
    this.currentLobby = null
    this.isHost = false
    this.currentPlayer = null
    this.players = {}
    this.gameState = null
    this.connectionStatus = 'disconnected'
  },
  
  // Hilfsfunktionen
  generateLobbyCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },
  
  generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },
  
  // Getter
  getOnlinePlayers() {
    return Object.values(this.players).filter(player => player.isOnline)
  },
  
  getRealPlayerCount() {
    return Object.values(this.players).filter(p => p.isOnline && !p.isModerator).length
  },
  
  // Vote-Statistiken
  getVoteStats(questionIndex) {
    const votes = this.currentLobby?.votes?.[questionIndex] || {}
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
  },
  
  hasPlayerVoted(questionIndex, playerId = null) {
    const pid = playerId || this.currentPlayer?.id
    return !!this.currentLobby?.votes?.[questionIndex]?.[pid]
  },
  
  allPlayersVoted(questionIndex) {
    const realPlayers = this.getRealPlayerCount()
    const votes = Object.keys(this.currentLobby?.votes?.[questionIndex] || {}).length
    return votes >= realPlayers
  }
})