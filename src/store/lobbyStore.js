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
  unsubscribeListener: null,
  heartbeatInterval: null,
  
  // Lobby erstellen (Host)
  async createLobby(gameId, hostName) {
    try {
      this.connectionStatus = 'connecting'
      
      const lobbyCode = this.generateLobbyCode()
      const hostId = this.generatePlayerId()
      
      const lobbyData = {
        code: lobbyCode,
        gameId: parseInt(gameId),
        hostId: hostId,
        status: 'waiting', // 'waiting', 'starting', 'playing', 'finished'
        createdAt: serverTimestamp(),
        settings: {
          maxPlayers: 8,
          questionTimer: 30, // Sekunden
        },
        gameState: {
          currentQuestionIndex: 0,
          phase: 'lobby', // 'lobby', 'voting', 'results', 'finished'
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
        votes: {}, // questionIndex: { playerId: { answer: answerIndex, timestamp } }
        chat: [] // Optional für späteren Chat
      }
      
      const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
      await set(lobbyRef, lobbyData)
      
      // Disconnect-Handler für Host
      const hostPresenceRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/players/${hostId}/isOnline`)
      onDisconnect(hostPresenceRef).set(false)
      
      this.currentLobby = lobbyData
      this.isHost = true
      this.currentPlayer = lobbyData.players[hostId]
      this.players = lobbyData.players
      this.gameState = lobbyData.gameState
      this.connectionStatus = 'connected'
      
      // Lobby-Updates abonnieren
      this.subscribeToLobby(lobbyCode)
      
      // Heartbeat starten
      this.startHeartbeat()
      
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
      
      // Heartbeat starten
      this.startHeartbeat()
      
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
    // Bestehenden Listener entfernen
    if (this.unsubscribeListener) {
      this.unsubscribeListener()
    }
    
    const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
    
    this.unsubscribeListener = onValue(lobbyRef, (snapshot) => {
      if (snapshot.exists()) {
        const lobbyData = snapshot.val()
        
        // Nur aktualisieren wenn es wirkliche Änderungen gibt
        if (JSON.stringify(this.currentLobby) !== JSON.stringify(lobbyData)) {
          this.currentLobby = lobbyData
          this.players = lobbyData.players || {}
          this.gameState = lobbyData.gameState || null
          
          console.log('Lobby-Update erhalten:', Object.keys(this.players).length, 'Spieler')
        }
      } else {
        console.log('Lobby wurde gelöscht')
        this.reset()
      }
    }, (error) => {
      console.error('Firebase Listener Fehler:', error)
      this.connectionStatus = 'disconnected'
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
  
  // Nächste Frage (nur Host)
  async nextQuestion() {
    if (!this.isHost || !this.currentLobby) return
    
    try {
      const nextIndex = this.currentLobby.gameState.currentQuestionIndex + 1
      const lobbyCode = this.currentLobby.code
      
      if (nextIndex >= 15) {
        // Spiel beenden
        await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/status`), 'finished')
        await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/phase`), 'finished')
      } else {
        // Nächste Frage
        await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/currentQuestionIndex`), nextIndex)
        await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/phase`), 'voting')
        await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/questionStartTime`), serverTimestamp())
      }
      
      console.log('Nächste Frage:', nextIndex)
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
      console.log('Antwort wird gezeigt')
    } catch (error) {
      console.error('Fehler beim Antwort zeigen:', error)
      throw error
    }
  },
  
  // Reconnect functionality
  async reconnectToLobby(lobbyCode) {
    if (!this.currentPlayer) return false
    
    try {
      this.connectionStatus = 'connecting'
      
      // Check if lobby still exists
      const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
      const lobbySnapshot = await get(lobbyRef)
      
      if (!lobbySnapshot.exists()) {
        throw new Error('Lobby existiert nicht mehr')
      }
      
      const lobbyData = lobbySnapshot.val()
      
      // Check if player still exists in lobby
      if (!lobbyData.players[this.currentPlayer.id]) {
        throw new Error('Du wurdest aus der Lobby entfernt')
      }
      
      // Update player online status
      const playerPresenceRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/players/${this.currentPlayer.id}/isOnline`)
      await set(playerPresenceRef, true)
      
      // Re-subscribe to lobby updates
      this.subscribeToLobby(lobbyCode)
      this.connectionStatus = 'connected'
      
      // Restart heartbeat
      this.startHeartbeat()
      
      console.log('Reconnected to lobby:', lobbyCode)
      return true
      
    } catch (error) {
      console.error('Reconnect failed:', error)
      this.connectionStatus = 'disconnected'
      return false
    }
  },
  
  // Check if current player can rejoin
  canRejoinLobby() {
    return this.currentPlayer && this.currentLobby?.code
  },
  
  // Heartbeat to maintain presence
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.currentPlayer && this.currentLobby) {
        const lastSeenRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/players/${this.currentPlayer.id}/lastSeen`)
        set(lastSeenRef, serverTimestamp()).catch(err => {
          console.warn('Heartbeat failed:', err)
          this.connectionStatus = 'disconnected'
        })
      }
    }, 30000) // Every 30 seconds
  },
  
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  },
  
  // Host migration (if host leaves)
  async promoteNewHost() {
    if (this.isHost || !this.currentLobby) return
    
    try {
      // Find first online player that's not host
      const onlinePlayers = Object.values(this.players).filter(p => p.isOnline && !p.isHost)
      if (onlinePlayers.length === 0) return
      
      const newHostId = onlinePlayers[0].id
      
      // Update host status
      await set(dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/hostId`), newHostId)
      await set(dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/players/${newHostId}/isHost`), true)
      
      // If we become the new host
      if (newHostId === this.currentPlayer?.id) {
        this.isHost = true
        console.log('Promoted to host')
      }
      
    } catch (error) {
      console.error('Host migration failed:', error)
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
        console.log('Lobby deleted by host')
      } else {
        // Als Spieler: Sich selbst entfernen
        const playerRef = dbRef(realtimeDb, `lobbies/${this.currentLobby.code}/players/${this.currentPlayer.id}`)
        await remove(playerRef)
        console.log('Left lobby as player')
      }
      
      // Lokalen State zurücksetzen
      this.reset()
      
    } catch (error) {
      console.error('Fehler beim Verlassen:', error)
      this.reset() // Reset anyway
    }
  },
  
  // State zurücksetzen
  reset() {
    this.stopHeartbeat()
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
  
  // Vote-Stats berechnen
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
    const onlinePlayers = Object.values(this.players).filter(p => p.isOnline).length
    const votes = Object.keys(this.currentLobby?.votes?.[questionIndex] || {}).length
    return votes >= onlinePlayers
  }
})