import { reactive } from 'vue'
import { 
  ref as dbRef, 
  push, 
  set, 
  get, 
  onValue, 
  off, 
  remove,
  serverTimestamp,
  onDisconnect
} from 'firebase/database'
import { realtimeDb } from '../firebase/config'

export const lobbyStore = reactive({
  currentLobby: null,
  isHost: false,
  currentPlayer: null,
  players: {},
  gameState: null,
  connectionStatus: 'disconnected', // 'connected', 'connecting', 'disconnected'
  
  // Lobby erstellen (Host)
  async createLobby(gameId, hostName) {
    try {
      this.connectionStatus = 'connecting'
      
      // Eindeutige 6-stellige Lobby-ID generieren
      const lobbyCode = this.generateLobbyCode()
      const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
      
      // Host als ersten Spieler hinzufügen
      const hostId = this.generatePlayerId()
      
      const lobbyData = {
        code: lobbyCode,
        gameId: gameId,
        hostId: hostId,
        status: 'waiting', // 'waiting', 'playing', 'finished'
        createdAt: serverTimestamp(),
        settings: {
          maxPlayers: 8,
          questionTimer: 30, // Sekunden
        },
        gameState: {
          currentQuestionIndex: 0,
          phase: 'lobby', // 'lobby', 'question', 'voting', 'results', 'finished'
          questionStartTime: null,
          jokers: {
            fiftyFifty: { used: false, activatedBy: null },
            publikum: { used: false, activatedBy: null },
            telefon: { used: false, activatedBy: null }
          }
        },
        players: {
          [hostId]: {
            id: hostId,
            name: hostName,
            isHost: true,
            isOnline: true,
            icon: '👑', // Host bekommt Krone
            joinedAt: serverTimestamp(),
            lastSeen: serverTimestamp()
          }
        },
        votes: {}, // questionIndex: { playerId: answerIndex }
        chat: [] // Optional für späteren Chat
      }
      
      await set(lobbyRef, lobbyData)
      
      // Disconnect-Handler für Host
      const hostPresenceRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/players/${hostId}/isOnline`)
      onDisconnect(hostPresenceRef).set(false)
      
      this.currentLobby = lobbyData
      this.isHost = true
      this.currentPlayer = lobbyData.players[hostId]
      this.connectionStatus = 'connected'
      
      // Lobby-Updates abonnieren
      this.subscribeToLobby(lobbyCode)
      
      console.log('Lobby erstellt:', lobbyCode)
      return lobbyCode
      
    } catch (error) {
      console.error('Fehler beim Erstellen der Lobby:', error)
      this.connectionStatus = 'disconnected'
      throw error
    }
  },
  
  // Lobby beitreten (Spieler)
  async joinLobby(lobbyCode, playerName, playerIcon = '🎮') {
    try {
      this.connectionStatus = 'connecting'
      
      const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
      const lobbySnapshot = await get(lobbyRef)
      
      if (!lobbySnapshot.exists()) {
        throw new Error('Lobby nicht gefunden')
      }
      
      const lobbyData = lobbySnapshot.val()
      
      // Prüfen ob Lobby voll ist
      const playerCount = Object.keys(lobbyData.players || {}).length
      if (playerCount >= lobbyData.settings.maxPlayers) {
        throw new Error('Lobby ist voll')
      }
      
      // Prüfen ob Spiel bereits läuft
      if (lobbyData.status === 'playing') {
        throw new Error('Spiel läuft bereits')
      }
      
      // Prüfen ob Name bereits vergeben
      const existingNames = Object.values(lobbyData.players || {}).map(p => p.name.toLowerCase())
      if (existingNames.includes(playerName.toLowerCase())) {
        throw new Error('Name bereits vergeben')
      }
      
      // Neuen Spieler hinzufügen
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
      
      // Lobby-Updates abonnieren
      this.subscribeToLobby(lobbyCode)
      
      console.log('Lobby beigetreten:', lobbyCode, 'als', playerName)
      return lobbyData
      
    } catch (error) {
      console.error('Fehler beim Beitreten:', error)
      this.connectionStatus = 'disconnected'
      throw error
    }
  },
  
  // Real-time Updates abonnieren
  subscribeToLobby(lobbyCode) {
    const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
    
    onValue(lobbyRef, (snapshot) => {
      if (snapshot.exists()) {
        const lobbyData = snapshot.val()
        this.currentLobby = lobbyData
        this.players = lobbyData.players || {}
        this.gameState = lobbyData.gameState || null
        
        console.log('Lobby-Update erhalten:', lobbyData)
      } else {
        console.log('Lobby wurde gelöscht')
        this.leaveLobby()
      }
    })
  },
  
  // Spiel starten (nur Host)
  async startGame() {
    if (!this.isHost || !this.currentLobby) return
    
    try {
      const lobbyRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}`)
      await set(dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/status`), 'playing')
      await set(dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/gameState/phase`), 'question')
      await set(dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/gameState/questionStartTime`), serverTimestamp())
      
      console.log('Spiel gestartet')
    } catch (error) {
      console.error('Fehler beim Starten:', error)
      throw error
    }
  },
  
  // Antwort abgeben
  async submitVote(questionIndex, answerIndex) {
    if (!this.currentPlayer || !this.currentLobby) return
    
    try {
      const voteRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/votes/${questionIndex}/${this.currentPlayer.id}`)
      await set(voteRef, {
        answer: answerIndex,
        timestamp: serverTimestamp()
      })
      
      console.log('Vote abgegeben:', answerIndex)
    } catch (error) {
      console.error('Fehler beim Voten:', error)
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
      
      console.log('Joker aktiviert:', jokerType)
    } catch (error) {
      console.error('Fehler beim Joker:', error)
      throw error
    }
  },
  
  // Lobby verlassen
  async leaveLobby() {
    if (!this.currentLobby || !this.currentPlayer) return
    
    try {
      // Als Host: Lobby löschen
      if (this.isHost) {
        const lobbyRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}`)
        await remove(lobbyRef)
      } else {
        // Als Spieler: Sich selbst entfernen
        const playerRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/players/${this.currentPlayer.id}`)
        await remove(playerRef)
      }
      
      // Lokalen State zurücksetzen
      this.reset()
      
    } catch (error) {
      console.error('Fehler beim Verlassen:', error)
    }
  },
  
  // State zurücksetzen
  reset() {
    this.currentLobby = null
    this.isHost = false
    this.currentPlayer = null
    this.players = {}
    this.gameState = null
    this.connectionStatus = 'disconnected'
  },
  
  // Hilfsfunktionen
  generateLobbyCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase()
  },
  
  generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },
  
  // Getter für computed properties
  getOnlinePlayers() {
    return Object.values(this.players).filter(player => player.isOnline)
  },
  
  getPlayerCount() {
    return Object.keys(this.players).length
  },
  
  canStartGame() {
    return this.isHost && 
           this.getPlayerCount() >= 2 && 
           this.currentLobby?.status === 'waiting'
  },
  
  getVotesForQuestion(questionIndex) {
    return this.currentLobby?.votes?.[questionIndex] || {}
  },
  
  hasPlayerVoted(questionIndex, playerId = null) {
    const pid = playerId || this.currentPlayer?.id
    return !!this.currentLobby?.votes?.[questionIndex]?.[pid]
  }
})