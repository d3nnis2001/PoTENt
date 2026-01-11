/**
 * ConspiracyCorner Discipline Store
 * Handles all ConspiracyCorner-specific game logic
 */

import { reactive } from 'vue'
import { ref as dbRef, set, update, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '@/firebase/config'
import { createDisciplineStore } from './disciplineStoreBase'

const base = createDisciplineStore('conspiracyCorner')

export const conspiracyCornerStore = reactive({
  ...base,

  /**
   * Initialize ConspiracyCorner discipline (Host only)
   */
  async initialize(lobbyStore, topics) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
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

  /**
   * Submit theory for current topic (Player)
   */
  async submitTheory(lobbyStore, theory) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const playerId = lobbyStore.currentPlayer.id
      const currentRound = lobbyStore.currentLobby.gameState?.conspiracyCorner?.currentRound || 0

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

  /**
   * Update ConspiracyCorner phase (Host only)
   */
  async updatePhase(lobbyStore, phase, additionalData = {}) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.updatePhase(lobbyCode, phase, additionalData)
    } catch (error) {
      console.error('Error updating ConspiracyCorner phase:', error)
      throw error
    }
  },

  /**
   * Submit vote for a theory (Player)
   */
  async submitVote(lobbyStore, theoryOwnerId) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const voterId = lobbyStore.currentPlayer.id
      const currentRound = lobbyStore.currentLobby.gameState?.conspiracyCorner?.currentRound || 0

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

  /**
   * Calculate scores for current round (Host only)
   */
  async calculateScores(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const conspiracyCorner = lobbyStore.currentLobby.gameState?.conspiracyCorner || {}
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

  /**
   * Start next round (Host only)
   */
  async nextRound(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const conspiracyCorner = lobbyStore.currentLobby.gameState?.conspiracyCorner || {}
      const currentRound = conspiracyCorner.currentRound || 0
      const topics = conspiracyCorner.topics || []
      const scores = conspiracyCorner.scores || {}

      const nextRound = currentRound + 1

      if (nextRound >= topics.length) {
        await this.updatePhase(lobbyStore, 'finished')
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

  /**
   * Finish ConspiracyCorner discipline (Host only)
   */
  async finish(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.finish(lobbyCode)
    } catch (error) {
      console.error('Error finishing ConspiracyCorner:', error)
      throw error
    }
  },

  // ====================
  // Getter methods
  // ====================

  getState(lobbyStore) {
    return lobbyStore.currentLobby?.gameState?.conspiracyCorner || null
  },

  getSubmissionCount(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.conspiracyCorner?.submissions || {}
    return Object.keys(submissions).length
  },

  getSubmissions(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.conspiracyCorner?.submissions || {}
    const players = lobbyStore.players || {}
    const currentRound = lobbyStore.currentLobby?.gameState?.conspiracyCorner?.currentRound || 0
    const votes = lobbyStore.currentLobby?.gameState?.conspiracyCorner?.votes?.[currentRound] || {}

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
  }
})
