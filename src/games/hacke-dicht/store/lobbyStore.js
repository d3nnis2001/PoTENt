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
import { realtimeDb } from '@/firebase/config'

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
        gameId: typeof gameId === 'string' && isNaN(parseInt(gameId)) ? gameId : parseInt(gameId),
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
          currentEventQuestion: null,
          eventQueue: [],
          showEventQuestion: false,
          showProgressScreen: true,
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
  async joinLobby(lobbyCode, playerName, playerIcon = '🎮', iconIndex = 0) {
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

      // Character-Index Validierung
      const existingIconIndexes = Object.values(lobbyData.players || {})
        .filter(p => p.iconIndex !== undefined)
        .map(p => p.iconIndex)
      if (existingIconIndexes.includes(iconIndex)) {
        throw new Error('Character bereits vergeben')
      }
      
      // Spieler hinzufügen
      const playerId = this.generatePlayerId()
      const playerData = {
        id: playerId,
        name: playerName,
        isHost: false,
        isOnline: true,
        icon: playerIcon,
        iconIndex: iconIndex,
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
        const currentIndex = this.currentLobby.gameState.currentQuestionIndex
        const nextIndex = currentIndex + 1
        const lobbyCode = this.currentLobby.code
        
        if (nextIndex >= 15) {
        // Spiel beenden
        const updates = {}
        updates[`lobbies/${lobbyCode}/status`] = 'finished'
        updates[`lobbies/${lobbyCode}/gameState/phase`] = 'finished'
        updates[`lobbies/${lobbyCode}/gameState/finishedAt`] = serverTimestamp()
        updates[`lobbies/${lobbyCode}/gameState/showProgressScreen`] = false
        updates[`lobbies/${lobbyCode}/gameState/showEventQuestion`] = false
        
        await update(dbRef(realtimeDb), updates)
        } else {
        // Prüfe auf Event-Fragen für die kommende Frage
        const gameData = this.currentLobby.gameData
        const eventQuestions = gameData.eventQuestions?.[nextIndex] || []
        
        if (eventQuestions.length > 0) {
            // Event-Fragen für nächste Frage gefunden
            const updates = {}
            updates[`lobbies/${lobbyCode}/gameState/currentQuestionIndex`] = nextIndex
            updates[`lobbies/${lobbyCode}/gameState/phase`] = 'event'
            updates[`lobbies/${lobbyCode}/gameState/currentEventQuestion`] = eventQuestions[0]
            updates[`lobbies/${lobbyCode}/gameState/eventQueue`] = eventQuestions.slice(1)
            updates[`lobbies/${lobbyCode}/gameState/showEventQuestion`] = true
            updates[`lobbies/${lobbyCode}/gameState/showProgressScreen`] = false
            
            await update(dbRef(realtimeDb), updates)
            console.log(`Event-Fragen für Frage ${nextIndex} gestartet`)
        } else {
            // Direkt zur nächsten Frage (Progress Screen)
            const updates = {}
            updates[`lobbies/${lobbyCode}/gameState/currentQuestionIndex`] = nextIndex
            updates[`lobbies/${lobbyCode}/gameState/phase`] = 'progress'
            updates[`lobbies/${lobbyCode}/gameState/showProgressScreen`] = true
            updates[`lobbies/${lobbyCode}/gameState/showEventQuestion`] = false
            updates[`lobbies/${lobbyCode}/gameState/currentEventQuestion`] = null
            updates[`lobbies/${lobbyCode}/gameState/eventQueue`] = []
            
            await update(dbRef(realtimeDb), updates)
            console.log(`Progress Screen für Frage ${nextIndex} gestartet`)
        }
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
  
  // Event fortsetzen (nur Host)
  async continueEvent() {
    if (!this.isHost || !this.currentLobby) return
    
    try {
      const lobbyCode = this.currentLobby.code
      const eventQueue = this.currentLobby.gameState.eventQueue || []
      
      if (eventQueue.length > 0) {
        // Nächstes Event aus der Queue
        const nextEvent = eventQueue[0]
        const remainingQueue = eventQueue.slice(1)
        
        const updates = {}
        updates[`lobbies/${lobbyCode}/gameState/currentEventQuestion`] = nextEvent
        updates[`lobbies/${lobbyCode}/gameState/eventQueue`] = remainingQueue
        
        await update(dbRef(realtimeDb), updates)
        console.log('Nächstes Event gestartet')
      } else {
        // Keine Events mehr - zur Progress Screen wechseln
        const updates = {}
        updates[`lobbies/${lobbyCode}/gameState/phase`] = 'progress'
        updates[`lobbies/${lobbyCode}/gameState/showEventQuestion`] = false
        updates[`lobbies/${lobbyCode}/gameState/showProgressScreen`] = true
        updates[`lobbies/${lobbyCode}/gameState/currentEventQuestion`] = null
        
        await update(dbRef(realtimeDb), updates)
        console.log('Events beendet - Progress Screen gestartet')
      }
    } catch (error) {
      console.error('Fehler beim Event fortsetzen:', error)
      throw error
    }
  },

  // Progress Screen fortsetzen (nur Host)
  async continueFromProgress() {
    if (!this.isHost || !this.currentLobby) return
    
    try {
      const lobbyCode = this.currentLobby.code
      const updates = {}
      
      updates[`lobbies/${lobbyCode}/gameState/phase`] = 'voting'
      updates[`lobbies/${lobbyCode}/gameState/showProgressScreen`] = false
      updates[`lobbies/${lobbyCode}/gameState/questionStartTime`] = serverTimestamp()
      
      // Votes für aktuelle Frage löschen
      const currentIndex = this.currentLobby.gameState.currentQuestionIndex
      updates[`lobbies/${lobbyCode}/votes/${currentIndex}`] = null
      
      await update(dbRef(realtimeDb), updates)
      console.log('Von Progress Screen zur Voting Phase gewechselt')
    } catch (error) {
      console.error('Fehler beim Progress fortsetzen:', error)
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
  },

  // ============================================
  // AI TAKES OVER - BILDERTITEL DISCIPLINE
  // ============================================

  // Initialize Bildertitel round (Host only)
  async initializeBildertitel(roundImages, playerAssignments) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {}

      updates[`lobbies/${lobbyCode}/gameState/discipline`] = 'bildertitel'
      updates[`lobbies/${lobbyCode}/gameState/bildertitel`] = {
        phase: 'writing',
        currentRound: 0,
        roundImages: roundImages,
        playerAssignments: playerAssignments,
        submissions: {},
        votes: {},
        scores: {},
        currentRevealIndex: 0,
        timeRemaining: 60
      }
      updates[`lobbies/${lobbyCode}/gameState/phase`] = 'discipline'

      await update(dbRef(realtimeDb), updates)
      console.log('Bildertitel initialized')
    } catch (error) {
      console.error('Error initializing Bildertitel:', error)
      throw error
    }
  },

  // Submit title for assigned image (Player)
  async submitBildertitelTitle(title) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const playerId = this.currentPlayer.id

      // Find assigned image for this player
      const assignments = this.currentLobby.gameState?.bildertitel?.playerAssignments || {}
      let assignedImageId = null

      for (const [imageId, playerIds] of Object.entries(assignments)) {
        if (playerIds.includes(playerId)) {
          assignedImageId = imageId
          break
        }
      }

      if (!assignedImageId) {
        throw new Error('No image assigned to player')
      }

      const submissionRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/bildertitel/submissions/${playerId}`)
      await set(submissionRef, {
        imageId: assignedImageId,
        title: title.trim(),
        timestamp: serverTimestamp()
      })

      console.log('Title submitted:', title)
    } catch (error) {
      console.error('Error submitting title:', error)
      throw error
    }
  },

  // Update Bildertitel phase (Host only)
  async updateBildertitelPhase(phase, additionalData = {}) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {}

      updates[`lobbies/${lobbyCode}/gameState/bildertitel/phase`] = phase

      // Add any additional data
      for (const [key, value] of Object.entries(additionalData)) {
        updates[`lobbies/${lobbyCode}/gameState/bildertitel/${key}`] = value
      }

      await update(dbRef(realtimeDb), updates)
      console.log('Bildertitel phase updated to:', phase)
    } catch (error) {
      console.error('Error updating Bildertitel phase:', error)
      throw error
    }
  },

  // Submit vote for a title (Player)
  async submitBildertitelVote(titleOwnerId, imageId) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const voterId = this.currentPlayer.id

      // Can't vote on own image
      const assignments = this.currentLobby.gameState?.bildertitel?.playerAssignments || {}
      const assignedPlayers = assignments[imageId] || []

      if (assignedPlayers.includes(voterId)) {
        throw new Error('Cannot vote on own image')
      }

      const voteRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/bildertitel/votes/${imageId}/${voterId}`)
      await set(voteRef, {
        votedFor: titleOwnerId,
        timestamp: serverTimestamp()
      })

      console.log('Vote submitted for:', titleOwnerId)
    } catch (error) {
      console.error('Error submitting vote:', error)
      throw error
    }
  },

  // Move to next image in reveal (Host only)
  async nextBildertitelImage() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const currentIndex = this.currentLobby.gameState?.bildertitel?.currentRevealIndex || 0
      const totalImages = this.currentLobby.gameState?.bildertitel?.roundImages?.length || 0

      if (currentIndex < totalImages - 1) {
        await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/bildertitel/currentRevealIndex`), currentIndex + 1)
        await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/bildertitel/phase`), 'reveal')
      }
    } catch (error) {
      console.error('Error moving to next image:', error)
      throw error
    }
  },

  // Calculate and save round scores (Host only)
  async calculateBildertitelScores() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const bildertitel = this.currentLobby.gameState?.bildertitel || {}
      const votes = bildertitel.votes || {}
      const currentScores = bildertitel.scores || {}

      // Count votes for each player
      const newScores = { ...currentScores }

      for (const imageVotes of Object.values(votes)) {
        for (const vote of Object.values(imageVotes)) {
          const votedFor = vote.votedFor
          if (votedFor) {
            newScores[votedFor] = (newScores[votedFor] || 0) + 1
          }
        }
      }

      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/bildertitel/scores`), newScores)
      console.log('Scores calculated:', newScores)
    } catch (error) {
      console.error('Error calculating scores:', error)
      throw error
    }
  },

  // Start next Bildertitel round (Host only)
  async nextBildertitelRound(roundImages, playerAssignments) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const currentRound = this.currentLobby.gameState?.bildertitel?.currentRound || 0
      const scores = this.currentLobby.gameState?.bildertitel?.scores || {}

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/bildertitel/currentRound`] = currentRound + 1
      updates[`lobbies/${lobbyCode}/gameState/bildertitel/phase`] = 'writing'
      updates[`lobbies/${lobbyCode}/gameState/bildertitel/roundImages`] = roundImages
      updates[`lobbies/${lobbyCode}/gameState/bildertitel/playerAssignments`] = playerAssignments
      updates[`lobbies/${lobbyCode}/gameState/bildertitel/submissions`] = {}
      updates[`lobbies/${lobbyCode}/gameState/bildertitel/votes`] = {}
      updates[`lobbies/${lobbyCode}/gameState/bildertitel/currentRevealIndex`] = 0
      updates[`lobbies/${lobbyCode}/gameState/bildertitel/timeRemaining`] = 60
      // Keep scores across rounds
      updates[`lobbies/${lobbyCode}/gameState/bildertitel/scores`] = scores

      await update(dbRef(realtimeDb), updates)
      console.log('Next Bildertitel round started')
    } catch (error) {
      console.error('Error starting next round:', error)
      throw error
    }
  },

  // Finish Bildertitel discipline (Host only)
  async finishBildertitel() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code

      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/bildertitel/phase`), 'finished')
      console.log('Bildertitel finished')
    } catch (error) {
      console.error('Error finishing Bildertitel:', error)
      throw error
    }
  },

  // Get Bildertitel state helpers
  getBildertitelState() {
    return this.currentLobby?.gameState?.bildertitel || null
  },

  getPlayerAssignedImage(playerId) {
    const assignments = this.currentLobby?.gameState?.bildertitel?.playerAssignments || {}
    const roundImages = this.currentLobby?.gameState?.bildertitel?.roundImages || []

    for (const [imageId, playerIds] of Object.entries(assignments)) {
      if (playerIds.includes(playerId)) {
        return roundImages.find(img => img.id === imageId)
      }
    }
    return null
  },

  canPlayerVoteOnImage(playerId, imageId) {
    const assignments = this.currentLobby?.gameState?.bildertitel?.playerAssignments || {}
    const assignedPlayers = assignments[imageId] || []
    return !assignedPlayers.includes(playerId)
  },

  getBildertitelSubmissionCount() {
    const submissions = this.currentLobby?.gameState?.bildertitel?.submissions || {}
    return Object.keys(submissions).length
  },

  getTitlesForImage(imageId) {
    const submissions = this.currentLobby?.gameState?.bildertitel?.submissions || {}
    const assignments = this.currentLobby?.gameState?.bildertitel?.playerAssignments || {}
    const votes = this.currentLobby?.gameState?.bildertitel?.votes || {}
    const playerIds = assignments[imageId] || []

    return playerIds
      .filter(playerId => submissions[playerId])
      .map(playerId => {
        // Count votes for this player's title on this image
        const imageVotes = votes[imageId] || {}
        let voteCount = 0
        for (const vote of Object.values(imageVotes)) {
          if (vote.votedFor === playerId) voteCount++
        }

        return {
          playerId,
          title: submissions[playerId].title,
          votes: voteCount
        }
      })
  },

  // ============================================
  // AI TAKES OVER - 3-WORT-CHAOS DISCIPLINE
  // ============================================

  // Initialize 3-Wort-Chaos (Host only)
  async initializeDreiWortChaos(prompts) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {}

      updates[`lobbies/${lobbyCode}/gameState/discipline`] = 'dreiWortChaos'
      updates[`lobbies/${lobbyCode}/gameState/dreiWortChaos`] = {
        phase: 'writing',
        currentRound: 0,
        totalRounds: prompts.length,
        prompts: prompts,
        currentPrompt: prompts[0],
        submissions: {},
        votes: {},
        scores: {},
        timeRemaining: 45
      }
      updates[`lobbies/${lobbyCode}/gameState/phase`] = 'discipline'

      await update(dbRef(realtimeDb), updates)
      console.log('DreiWortChaos initialized')
    } catch (error) {
      console.error('Error initializing DreiWortChaos:', error)
      throw error
    }
  },

  // Submit answer for current prompt (Player)
  async submitDreiWortChaosAnswer(answer) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const playerId = this.currentPlayer.id

      const submissionRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/dreiWortChaos/submissions/${playerId}`)
      await set(submissionRef, {
        answer: answer.trim(),
        timestamp: serverTimestamp()
      })

      console.log('Answer submitted:', answer)
    } catch (error) {
      console.error('Error submitting answer:', error)
      throw error
    }
  },

  // Update DreiWortChaos phase (Host only)
  async updateDreiWortChaosPhase(phase, additionalData = {}) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {}

      updates[`lobbies/${lobbyCode}/gameState/dreiWortChaos/phase`] = phase

      for (const [key, value] of Object.entries(additionalData)) {
        updates[`lobbies/${lobbyCode}/gameState/dreiWortChaos/${key}`] = value
      }

      await update(dbRef(realtimeDb), updates)
      console.log('DreiWortChaos phase updated to:', phase)
    } catch (error) {
      console.error('Error updating DreiWortChaos phase:', error)
      throw error
    }
  },

  // Submit vote for an answer (Player)
  async submitDreiWortChaosVote(answerId) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const voterId = this.currentPlayer.id
      const currentRound = this.currentLobby.gameState?.dreiWortChaos?.currentRound || 0

      // Can't vote for own answer
      if (answerId === voterId) {
        throw new Error('Cannot vote for own answer')
      }

      const voteRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/dreiWortChaos/votes/${currentRound}/${voterId}`)
      await set(voteRef, {
        votedFor: answerId,
        timestamp: serverTimestamp()
      })

      console.log('Vote submitted for:', answerId)
    } catch (error) {
      console.error('Error submitting vote:', error)
      throw error
    }
  },

  // Calculate scores for current round (Host only)
  async calculateDreiWortChaosScores() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const dreiWortChaos = this.currentLobby.gameState?.dreiWortChaos || {}
      const currentRound = dreiWortChaos.currentRound || 0
      const votes = dreiWortChaos.votes?.[currentRound] || {}
      const currentScores = dreiWortChaos.scores || {}

      const newScores = { ...currentScores }

      for (const vote of Object.values(votes)) {
        const votedFor = vote.votedFor
        if (votedFor) {
          newScores[votedFor] = (newScores[votedFor] || 0) + 1
        }
      }

      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/dreiWortChaos/scores`), newScores)
      console.log('DreiWortChaos scores calculated:', newScores)
    } catch (error) {
      console.error('Error calculating scores:', error)
      throw error
    }
  },

  // Start next round (Host only)
  async nextDreiWortChaosRound() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const dreiWortChaos = this.currentLobby.gameState?.dreiWortChaos || {}
      const currentRound = dreiWortChaos.currentRound || 0
      const prompts = dreiWortChaos.prompts || []
      const scores = dreiWortChaos.scores || {}

      const nextRound = currentRound + 1

      if (nextRound >= prompts.length) {
        // Game finished
        await this.updateDreiWortChaosPhase('finished')
        return false
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/dreiWortChaos/currentRound`] = nextRound
      updates[`lobbies/${lobbyCode}/gameState/dreiWortChaos/currentPrompt`] = prompts[nextRound]
      updates[`lobbies/${lobbyCode}/gameState/dreiWortChaos/phase`] = 'writing'
      updates[`lobbies/${lobbyCode}/gameState/dreiWortChaos/submissions`] = {}
      updates[`lobbies/${lobbyCode}/gameState/dreiWortChaos/timeRemaining`] = 45
      updates[`lobbies/${lobbyCode}/gameState/dreiWortChaos/scores`] = scores

      await update(dbRef(realtimeDb), updates)
      console.log('Next DreiWortChaos round started:', nextRound)
      return true
    } catch (error) {
      console.error('Error starting next round:', error)
      throw error
    }
  },

  // Get DreiWortChaos state helpers
  getDreiWortChaosState() {
    return this.currentLobby?.gameState?.dreiWortChaos || null
  },

  getDreiWortChaosSubmissionCount() {
    const submissions = this.currentLobby?.gameState?.dreiWortChaos?.submissions || {}
    return Object.keys(submissions).length
  },

  getDreiWortChaosSubmissions() {
    const submissions = this.currentLobby?.gameState?.dreiWortChaos?.submissions || {}
    const players = this.players || {}
    const currentRound = this.currentLobby?.gameState?.dreiWortChaos?.currentRound || 0
    const votes = this.currentLobby?.gameState?.dreiWortChaos?.votes?.[currentRound] || {}

    return Object.entries(submissions).map(([playerId, data]) => {
      const player = players[playerId] || {}
      let voteCount = 0

      for (const vote of Object.values(votes)) {
        if (vote.votedFor === playerId) voteCount++
      }

      return {
        playerId,
        playerName: player.name || 'Unknown',
        playerIcon: player.icon || '',
        answer: data.answer,
        votes: voteCount
      }
    })
  },

  // ========================================
  // CONSPIRACY CORNER METHODS
  // ========================================

  async initializeConspiracyCorner(topics) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const conspiracyCornerData = {
        phase: 'writing',
        currentRound: 0,
        totalRounds: topics.length,
        topics: topics,
        currentTopic: topics[0],
        submissions: {},
        votes: {},
        scores: {},
        timeRemaining: 90
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/discipline`] = 'conspiracyCorner'
      updates[`lobbies/${lobbyCode}/gameState/conspiracyCorner`] = conspiracyCornerData

      await update(dbRef(realtimeDb), updates)
      console.log('Conspiracy Corner initialized')
    } catch (error) {
      console.error('Error initializing Conspiracy Corner:', error)
      throw error
    }
  },

  async submitConspiracyCornerTheory(theory) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const playerId = this.currentPlayer.id
      const currentRound = this.currentLobby.gameState?.conspiracyCorner?.currentRound || 0

      const submissionRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/conspiracyCorner/submissions/${playerId}`)
      await set(submissionRef, {
        theory,
        round: currentRound,
        timestamp: serverTimestamp()
      })

      console.log('Theory submitted:', theory.substring(0, 50) + '...')
    } catch (error) {
      console.error('Error submitting theory:', error)
      throw error
    }
  },

  async updateConspiracyCornerPhase(phase, additionalData = {}) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {
        [`lobbies/${lobbyCode}/gameState/conspiracyCorner/phase`]: phase,
        ...Object.fromEntries(
          Object.entries(additionalData).map(([key, value]) => [
            `lobbies/${lobbyCode}/gameState/conspiracyCorner/${key}`,
            value
          ])
        )
      }

      await update(dbRef(realtimeDb), updates)
      console.log('Conspiracy Corner phase updated to:', phase)
    } catch (error) {
      console.error('Error updating phase:', error)
      throw error
    }
  },

  async submitConspiracyCornerVote(theoryOwnerId) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const voterId = this.currentPlayer.id
      const currentRound = this.currentLobby.gameState?.conspiracyCorner?.currentRound || 0

      if (theoryOwnerId === voterId) {
        throw new Error('Cannot vote for own theory')
      }

      const voteRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/conspiracyCorner/votes/${currentRound}/${voterId}`)
      await set(voteRef, {
        votedFor: theoryOwnerId,
        timestamp: serverTimestamp()
      })

      console.log('Vote submitted for:', theoryOwnerId)
    } catch (error) {
      console.error('Error submitting vote:', error)
      throw error
    }
  },

  async calculateConspiracyCornerScores() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const conspiracyCorner = this.currentLobby.gameState?.conspiracyCorner || {}
      const currentRound = conspiracyCorner.currentRound || 0
      const votes = conspiracyCorner.votes?.[currentRound] || {}
      const currentScores = conspiracyCorner.scores || {}

      const newScores = { ...currentScores }

      for (const vote of Object.values(votes)) {
        const votedFor = vote.votedFor
        if (votedFor) {
          newScores[votedFor] = (newScores[votedFor] || 0) + 100
        }
      }

      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/conspiracyCorner/scores`), newScores)
      console.log('Conspiracy Corner scores calculated:', newScores)
    } catch (error) {
      console.error('Error calculating scores:', error)
      throw error
    }
  },

  async nextConspiracyCornerRound() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const conspiracyCorner = this.currentLobby.gameState?.conspiracyCorner || {}
      const currentRound = conspiracyCorner.currentRound || 0
      const topics = conspiracyCorner.topics || []
      const scores = conspiracyCorner.scores || {}

      const nextRound = currentRound + 1

      if (nextRound >= topics.length) {
        await this.updateConspiracyCornerPhase('finished')
        return false
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/conspiracyCorner/currentRound`] = nextRound
      updates[`lobbies/${lobbyCode}/gameState/conspiracyCorner/currentTopic`] = topics[nextRound]
      updates[`lobbies/${lobbyCode}/gameState/conspiracyCorner/phase`] = 'writing'
      updates[`lobbies/${lobbyCode}/gameState/conspiracyCorner/submissions`] = {}
      updates[`lobbies/${lobbyCode}/gameState/conspiracyCorner/timeRemaining`] = 90
      updates[`lobbies/${lobbyCode}/gameState/conspiracyCorner/scores`] = scores

      await update(dbRef(realtimeDb), updates)
      console.log('Next Conspiracy Corner round started:', nextRound)
      return true
    } catch (error) {
      console.error('Error starting next round:', error)
      throw error
    }
  },

  async finishConspiracyCorner() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/conspiracyCorner/phase`), 'finished')
      console.log('Conspiracy Corner finished')
    } catch (error) {
      console.error('Error finishing Conspiracy Corner:', error)
      throw error
    }
  },

  getConspiracyCornerSubmissionCount() {
    const submissions = this.currentLobby?.gameState?.conspiracyCorner?.submissions || {}
    return Object.keys(submissions).length
  },

  getConspiracyCornerSubmissions() {
    const submissions = this.currentLobby?.gameState?.conspiracyCorner?.submissions || {}
    const players = this.players || {}
    const currentRound = this.currentLobby?.gameState?.conspiracyCorner?.currentRound || 0
    const votes = this.currentLobby?.gameState?.conspiracyCorner?.votes?.[currentRound] || {}

    return Object.entries(submissions).map(([playerId, data]) => {
      const player = players[playerId] || {}
      let voteCount = 0

      for (const vote of Object.values(votes)) {
        if (vote.votedFor === playerId) voteCount++
      }

      return {
        playerId,
        playerName: player.name || 'Unknown',
        playerIcon: player.icon || '',
        theory: data.theory,
        votes: voteCount
      }
    })
  },

  // ========================================
  // WERBUNG FÜR MÜLL METHODS
  // ========================================

  async initializeWerbungFuerMuell(products) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const werbungData = {
        phase: 'writing',
        currentRound: 0,
        totalRounds: products.length,
        products: products,
        currentProduct: products[0],
        submissions: {},
        votes: {},
        scores: {},
        timeRemaining: 120
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/discipline`] = 'werbungFuerMuell'
      updates[`lobbies/${lobbyCode}/gameState/werbungFuerMuell`] = werbungData

      await update(dbRef(realtimeDb), updates)
      console.log('Werbung für Müll initialized')
    } catch (error) {
      console.error('Error initializing Werbung für Müll:', error)
      throw error
    }
  },

  async submitWerbungFuerMuellPitch(pitch) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const playerId = this.currentPlayer.id
      const currentRound = this.currentLobby.gameState?.werbungFuerMuell?.currentRound || 0

      const submissionRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/werbungFuerMuell/submissions/${playerId}`)
      await set(submissionRef, {
        pitch,
        round: currentRound,
        timestamp: serverTimestamp()
      })

      console.log('Pitch submitted:', pitch.substring(0, 50) + '...')
    } catch (error) {
      console.error('Error submitting pitch:', error)
      throw error
    }
  },

  async updateWerbungFuerMuellPhase(phase, additionalData = {}) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {
        [`lobbies/${lobbyCode}/gameState/werbungFuerMuell/phase`]: phase,
        ...Object.fromEntries(
          Object.entries(additionalData).map(([key, value]) => [
            `lobbies/${lobbyCode}/gameState/werbungFuerMuell/${key}`,
            value
          ])
        )
      }

      await update(dbRef(realtimeDb), updates)
      console.log('Werbung für Müll phase updated to:', phase)
    } catch (error) {
      console.error('Error updating phase:', error)
      throw error
    }
  },

  async submitWerbungFuerMuellVote(pitchOwnerId) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const voterId = this.currentPlayer.id
      const currentRound = this.currentLobby.gameState?.werbungFuerMuell?.currentRound || 0

      if (pitchOwnerId === voterId) {
        throw new Error('Cannot vote for own pitch')
      }

      const voteRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/werbungFuerMuell/votes/${currentRound}/${voterId}`)
      await set(voteRef, {
        votedFor: pitchOwnerId,
        timestamp: serverTimestamp()
      })

      console.log('Vote submitted for:', pitchOwnerId)
    } catch (error) {
      console.error('Error submitting vote:', error)
      throw error
    }
  },

  async calculateWerbungFuerMuellScores() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const werbung = this.currentLobby.gameState?.werbungFuerMuell || {}
      const currentRound = werbung.currentRound || 0
      const votes = werbung.votes?.[currentRound] || {}
      const currentScores = werbung.scores || {}

      const newScores = { ...currentScores }

      for (const vote of Object.values(votes)) {
        const votedFor = vote.votedFor
        if (votedFor) {
          newScores[votedFor] = (newScores[votedFor] || 0) + 100
        }
      }

      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/werbungFuerMuell/scores`), newScores)
      console.log('Werbung für Müll scores calculated:', newScores)
    } catch (error) {
      console.error('Error calculating scores:', error)
      throw error
    }
  },

  async nextWerbungFuerMuellRound() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const werbung = this.currentLobby.gameState?.werbungFuerMuell || {}
      const currentRound = werbung.currentRound || 0
      const products = werbung.products || []
      const scores = werbung.scores || {}

      const nextRound = currentRound + 1

      if (nextRound >= products.length) {
        await this.updateWerbungFuerMuellPhase('finished')
        return false
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/werbungFuerMuell/currentRound`] = nextRound
      updates[`lobbies/${lobbyCode}/gameState/werbungFuerMuell/currentProduct`] = products[nextRound]
      updates[`lobbies/${lobbyCode}/gameState/werbungFuerMuell/phase`] = 'writing'
      updates[`lobbies/${lobbyCode}/gameState/werbungFuerMuell/submissions`] = {}
      updates[`lobbies/${lobbyCode}/gameState/werbungFuerMuell/timeRemaining`] = 120
      updates[`lobbies/${lobbyCode}/gameState/werbungFuerMuell/scores`] = scores

      await update(dbRef(realtimeDb), updates)
      console.log('Next Werbung für Müll round started:', nextRound)
      return true
    } catch (error) {
      console.error('Error starting next round:', error)
      throw error
    }
  },

  async finishWerbungFuerMuell() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/werbungFuerMuell/phase`), 'finished')
      console.log('Werbung für Müll finished')
    } catch (error) {
      console.error('Error finishing Werbung für Müll:', error)
      throw error
    }
  },

  getWerbungFuerMuellSubmissionCount() {
    const submissions = this.currentLobby?.gameState?.werbungFuerMuell?.submissions || {}
    return Object.keys(submissions).length
  },

  getWerbungFuerMuellSubmissions() {
    const submissions = this.currentLobby?.gameState?.werbungFuerMuell?.submissions || {}
    const players = this.players || {}
    const currentRound = this.currentLobby?.gameState?.werbungFuerMuell?.currentRound || 0
    const votes = this.currentLobby?.gameState?.werbungFuerMuell?.votes?.[currentRound] || {}

    return Object.entries(submissions).map(([playerId, data]) => {
      const player = players[playerId] || {}
      let voteCount = 0

      for (const vote of Object.values(votes)) {
        if (vote.votedFor === playerId) voteCount++
      }

      return {
        playerId,
        playerName: player.name || 'Unknown',
        playerIcon: player.icon || '',
        pitch: data.pitch,
        votes: voteCount
      }
    })
  },

  // ========================================
  // AUTOCOMPLETE CHAOS METHODS
  // ========================================

  async initializeAutocompleteChaos(prompts) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const autocompleteData = {
        phase: 'writing',
        currentRound: 0,
        totalRounds: prompts.length,
        prompts: prompts,
        currentPrompt: prompts[0],
        submissions: {},
        votes: {},
        scores: {},
        timeRemaining: 45
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/discipline`] = 'autocompleteChaos'
      updates[`lobbies/${lobbyCode}/gameState/autocompleteChaos`] = autocompleteData

      await update(dbRef(realtimeDb), updates)
      console.log('Autocomplete Chaos initialized')
    } catch (error) {
      console.error('Error initializing Autocomplete Chaos:', error)
      throw error
    }
  },

  async submitAutocompleteChaosCompletion(completion) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const playerId = this.currentPlayer.id
      const currentRound = this.currentLobby.gameState?.autocompleteChaos?.currentRound || 0

      const submissionRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/autocompleteChaos/submissions/${playerId}`)
      await set(submissionRef, {
        completion,
        round: currentRound,
        timestamp: serverTimestamp()
      })

      console.log('Completion submitted:', completion.substring(0, 50) + '...')
    } catch (error) {
      console.error('Error submitting completion:', error)
      throw error
    }
  },

  async updateAutocompleteChaosPhase(phase, additionalData = {}) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {
        [`lobbies/${lobbyCode}/gameState/autocompleteChaos/phase`]: phase,
        ...Object.fromEntries(
          Object.entries(additionalData).map(([key, value]) => [
            `lobbies/${lobbyCode}/gameState/autocompleteChaos/${key}`,
            value
          ])
        )
      }

      await update(dbRef(realtimeDb), updates)
      console.log('Autocomplete Chaos phase updated to:', phase)
    } catch (error) {
      console.error('Error updating phase:', error)
      throw error
    }
  },

  async submitAutocompleteChaosVote(completionOwnerId) {
    if (!this.currentPlayer || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const voterId = this.currentPlayer.id
      const currentRound = this.currentLobby.gameState?.autocompleteChaos?.currentRound || 0

      if (completionOwnerId === voterId) {
        throw new Error('Cannot vote for own completion')
      }

      const voteRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/autocompleteChaos/votes/${currentRound}/${voterId}`)
      await set(voteRef, {
        votedFor: completionOwnerId,
        timestamp: serverTimestamp()
      })

      console.log('Vote submitted for:', completionOwnerId)
    } catch (error) {
      console.error('Error submitting vote:', error)
      throw error
    }
  },

  async calculateAutocompleteChaosScores() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const autocomplete = this.currentLobby.gameState?.autocompleteChaos || {}
      const currentRound = autocomplete.currentRound || 0
      const votes = autocomplete.votes?.[currentRound] || {}
      const currentScores = autocomplete.scores || {}

      const newScores = { ...currentScores }

      for (const vote of Object.values(votes)) {
        const votedFor = vote.votedFor
        if (votedFor) {
          newScores[votedFor] = (newScores[votedFor] || 0) + 100
        }
      }

      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/autocompleteChaos/scores`), newScores)
      console.log('Autocomplete Chaos scores calculated:', newScores)
    } catch (error) {
      console.error('Error calculating scores:', error)
      throw error
    }
  },

  async nextAutocompleteChaosRound() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const autocomplete = this.currentLobby.gameState?.autocompleteChaos || {}
      const currentRound = autocomplete.currentRound || 0
      const prompts = autocomplete.prompts || []
      const scores = autocomplete.scores || {}

      const nextRound = currentRound + 1

      if (nextRound >= prompts.length) {
        await this.updateAutocompleteChaosPhase('finished')
        return false
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/autocompleteChaos/currentRound`] = nextRound
      updates[`lobbies/${lobbyCode}/gameState/autocompleteChaos/currentPrompt`] = prompts[nextRound]
      updates[`lobbies/${lobbyCode}/gameState/autocompleteChaos/phase`] = 'writing'
      updates[`lobbies/${lobbyCode}/gameState/autocompleteChaos/submissions`] = {}
      updates[`lobbies/${lobbyCode}/gameState/autocompleteChaos/timeRemaining`] = 45
      updates[`lobbies/${lobbyCode}/gameState/autocompleteChaos/scores`] = scores

      await update(dbRef(realtimeDb), updates)
      console.log('Next Autocomplete Chaos round started:', nextRound)
      return true
    } catch (error) {
      console.error('Error starting next round:', error)
      throw error
    }
  },

  async finishAutocompleteChaos() {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/autocompleteChaos/phase`), 'finished')
      console.log('Autocomplete Chaos finished')
    } catch (error) {
      console.error('Error finishing Autocomplete Chaos:', error)
      throw error
    }
  },

  getAutocompleteChaosSubmissionCount() {
    const submissions = this.currentLobby?.gameState?.autocompleteChaos?.submissions || {}
    return Object.keys(submissions).length
  },

  getAutocompleteChaosSubmissions() {
    const submissions = this.currentLobby?.gameState?.autocompleteChaos?.submissions || {}
    const players = this.players || {}
    const currentRound = this.currentLobby?.gameState?.autocompleteChaos?.currentRound || 0
    const votes = this.currentLobby?.gameState?.autocompleteChaos?.votes?.[currentRound] || {}

    return Object.entries(submissions).map(([playerId, data]) => {
      const player = players[playerId] || {}
      let voteCount = 0

      for (const vote of Object.values(votes)) {
        if (vote.votedFor === playerId) voteCount++
      }

      return {
        playerId,
        playerName: player.name || 'Unknown',
        playerIcon: player.icon || '',
        completion: data.completion,
        votes: voteCount
      }
    })
  },

  // ===== DUELL SYSTEM =====

  /**
   * Initialize a duell event
   * @param {Object} playerA - First duelist
   * @param {Object} playerB - Second duelist
   * @param {Object} game - Selected duell game
   */
  async initializeDuell(playerA, playerB, game) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const duellId = `duell_${Date.now()}`

      const duellData = {
        id: duellId,
        phase: 'intro', // intro, playing, results
        playerA: {
          id: playerA.id,
          name: playerA.name,
          icon: playerA.icon,
          score: 0,
          ready: false
        },
        playerB: {
          id: playerB.id,
          name: playerB.name,
          icon: playerB.icon,
          score: 0,
          ready: false
        },
        game: {
          id: game.id,
          name: game.name,
          icon: game.icon,
          description: game.description
        },
        winner: null,
        startedAt: serverTimestamp()
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/discipline`] = 'duell'
      updates[`lobbies/${lobbyCode}/gameState/duell`] = duellData

      await update(dbRef(realtimeDb), updates)
      console.log('Duell initialized:', duellId)
      return duellId
    } catch (error) {
      console.error('Error initializing duell:', error)
      throw error
    }
  },

  /**
   * Update duell phase
   */
  async updateDuellPhase(phase, additionalData = {}) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {
        [`lobbies/${lobbyCode}/gameState/duell/phase`]: phase,
        ...Object.fromEntries(
          Object.entries(additionalData).map(([key, value]) => [
            `lobbies/${lobbyCode}/gameState/duell/${key}`,
            value
          ])
        )
      }

      await update(dbRef(realtimeDb), updates)
      console.log('Duell phase updated:', phase)
    } catch (error) {
      console.error('Error updating duell phase:', error)
      throw error
    }
  },

  /**
   * Set duell winner
   */
  async setDuellWinner(winnerId, scores = {}) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/duell/winner`] = winnerId
      updates[`lobbies/${lobbyCode}/gameState/duell/phase`] = 'results'

      if (scores.playerA !== undefined) {
        updates[`lobbies/${lobbyCode}/gameState/duell/playerA/score`] = scores.playerA
      }
      if (scores.playerB !== undefined) {
        updates[`lobbies/${lobbyCode}/gameState/duell/playerB/score`] = scores.playerB
      }

      await update(dbRef(realtimeDb), updates)
      console.log('Duell winner set:', winnerId)
    } catch (error) {
      console.error('Error setting duell winner:', error)
      throw error
    }
  },

  /**
   * Submit duell action (for players participating in the duell)
   */
  async submitDuellAction(action, data) {
    if (!this.currentLobby || !this.currentPlayer) return

    try {
      const lobbyCode = this.currentLobby.code
      const playerId = this.currentPlayer.id

      const actionRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/duell/actions/${playerId}`)
      await set(actionRef, {
        action,
        data,
        timestamp: serverTimestamp()
      })

      console.log('Duell action submitted:', action)
    } catch (error) {
      console.error('Error submitting duell action:', error)
      throw error
    }
  },

  /**
   * Mark player as ready for duell
   */
  async setDuellPlayerReady(isPlayerA) {
    if (!this.currentLobby || !this.currentPlayer) return

    try {
      const lobbyCode = this.currentLobby.code
      const playerKey = isPlayerA ? 'playerA' : 'playerB'

      await set(
        dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/duell/${playerKey}/ready`),
        true
      )

      console.log('Player marked as ready for duell')
    } catch (error) {
      console.error('Error setting player ready:', error)
      throw error
    }
  },

  /**
   * Finish the duell and add winner points to global scores
   */
  async finishDuell(winnerPoints = 300) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const duellState = this.currentLobby?.gameState?.duell
      const winnerId = duellState?.winner

      if (winnerId) {
        // Get current global scores
        const globalScoresRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/globalScores`)
        const snapshot = await get(globalScoresRef)
        const currentScores = snapshot.val() || {}

        // Add winner points
        const newScore = (currentScores[winnerId] || 0) + winnerPoints
        currentScores[winnerId] = newScore

        await set(globalScoresRef, currentScores)
        console.log('Duell winner points added:', winnerId, winnerPoints)
      }

      // Mark duell as finished
      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/duell/phase`), 'finished')
    } catch (error) {
      console.error('Error finishing duell:', error)
      throw error
    }
  },

  /**
   * Clear duell state and return to previous discipline flow
   */
  async clearDuell(nextDiscipline) {
    if (!this.isHost || !this.currentLobby) return

    try {
      const lobbyCode = this.currentLobby.code
      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/duell`] = null
      updates[`lobbies/${lobbyCode}/gameState/discipline`] = nextDiscipline

      await update(dbRef(realtimeDb), updates)
      console.log('Duell cleared, moving to:', nextDiscipline)
    } catch (error) {
      console.error('Error clearing duell:', error)
      throw error
    }
  },

  /**
   * Get current duell state
   */
  getDuellState() {
    return this.currentLobby?.gameState?.duell || null
  },

  /**
   * Check if current player is a duelist
   */
  isCurrentPlayerInDuell() {
    const duellState = this.getDuellState()
    if (!duellState || !this.currentPlayer) return false

    return (
      duellState.playerA?.id === this.currentPlayer.id ||
      duellState.playerB?.id === this.currentPlayer.id
    )
  },

  /**
   * Check if current player is Player A in the duell
   */
  isCurrentPlayerDuellA() {
    const duellState = this.getDuellState()
    if (!duellState || !this.currentPlayer) return false
    return duellState.playerA?.id === this.currentPlayer.id
  }
})