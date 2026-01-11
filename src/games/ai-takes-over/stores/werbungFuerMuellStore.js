/**
 * WerbungFuerMuell Discipline Store
 * Handles all WerbungFuerMuell-specific game logic
 */

import { reactive } from 'vue'
import { ref as dbRef, set, update, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '@/firebase/config'
import { createDisciplineStore } from './disciplineStoreBase'

const base = createDisciplineStore('werbungFuerMuell')

export const werbungFuerMuellStore = reactive({
  ...base,

  /**
   * Initialize WerbungFuerMuell discipline (Host only)
   */
  async initialize(lobbyStore, products) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
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

  /**
   * Submit pitch for current product (Player)
   */
  async submitPitch(lobbyStore, pitch) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const playerId = lobbyStore.currentPlayer.id
      const currentRound = lobbyStore.currentLobby.gameState?.werbungFuerMuell?.currentRound || 0

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

  /**
   * Update WerbungFuerMuell phase (Host only)
   */
  async updatePhase(lobbyStore, phase, additionalData = {}) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.updatePhase(lobbyCode, phase, additionalData)
    } catch (error) {
      console.error('Error updating WerbungFuerMuell phase:', error)
      throw error
    }
  },

  /**
   * Submit vote for a pitch (Player)
   */
  async submitVote(lobbyStore, pitchOwnerId) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const voterId = lobbyStore.currentPlayer.id
      const currentRound = lobbyStore.currentLobby.gameState?.werbungFuerMuell?.currentRound || 0

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

  /**
   * Calculate scores for current round (Host only)
   */
  async calculateScores(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const werbung = lobbyStore.currentLobby.gameState?.werbungFuerMuell || {}
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

  /**
   * Start next round (Host only)
   */
  async nextRound(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const werbung = lobbyStore.currentLobby.gameState?.werbungFuerMuell || {}
      const currentRound = werbung.currentRound || 0
      const products = werbung.products || []
      const scores = werbung.scores || {}

      const nextRound = currentRound + 1

      if (nextRound >= products.length) {
        await this.updatePhase(lobbyStore, 'finished')
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

  /**
   * Finish WerbungFuerMuell discipline (Host only)
   */
  async finish(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.finish(lobbyCode)
    } catch (error) {
      console.error('Error finishing WerbungFuerMuell:', error)
      throw error
    }
  },

  // ====================
  // Getter methods
  // ====================

  getState(lobbyStore) {
    return lobbyStore.currentLobby?.gameState?.werbungFuerMuell || null
  },

  getSubmissionCount(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.werbungFuerMuell?.submissions || {}
    return Object.keys(submissions).length
  },

  getSubmissions(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.werbungFuerMuell?.submissions || {}
    const players = lobbyStore.players || {}
    const currentRound = lobbyStore.currentLobby?.gameState?.werbungFuerMuell?.currentRound || 0
    const votes = lobbyStore.currentLobby?.gameState?.werbungFuerMuell?.votes?.[currentRound] || {}

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
  }
})
