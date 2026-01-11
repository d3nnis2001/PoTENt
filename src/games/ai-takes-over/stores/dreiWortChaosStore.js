/**
 * DreiWortChaos Discipline Store
 * Handles all DreiWortChaos-specific game logic
 */

import { reactive } from 'vue'
import { ref as dbRef, set, update, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '@/firebase/config'
import { createDisciplineStore } from './disciplineStoreBase'

const base = createDisciplineStore('dreiWortChaos')

export const dreiWortChaosStore = reactive({
  ...base,

  /**
   * Initialize DreiWortChaos discipline (Host only)
   */
  async initialize(lobbyStore, prompts) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
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

  /**
   * Submit answer for current prompt (Player)
   */
  async submitAnswer(lobbyStore, answer) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const playerId = lobbyStore.currentPlayer.id

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

  /**
   * Update DreiWortChaos phase (Host only)
   */
  async updatePhase(lobbyStore, phase, additionalData = {}) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.updatePhase(lobbyCode, phase, additionalData)
    } catch (error) {
      console.error('Error updating DreiWortChaos phase:', error)
      throw error
    }
  },

  /**
   * Submit vote for an answer (Player)
   */
  async submitVote(lobbyStore, answerId) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const voterId = lobbyStore.currentPlayer.id
      const currentRound = lobbyStore.currentLobby.gameState?.dreiWortChaos?.currentRound || 0

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

  /**
   * Calculate scores for current round (Host only)
   */
  async calculateScores(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const dreiWortChaos = lobbyStore.currentLobby.gameState?.dreiWortChaos || {}
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

  /**
   * Start next round (Host only)
   */
  async nextRound(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const dreiWortChaos = lobbyStore.currentLobby.gameState?.dreiWortChaos || {}
      const currentRound = dreiWortChaos.currentRound || 0
      const prompts = dreiWortChaos.prompts || []
      const scores = dreiWortChaos.scores || {}

      const nextRound = currentRound + 1

      if (nextRound >= prompts.length) {
        // Game finished
        await this.updatePhase(lobbyStore, 'finished')
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

  /**
   * Finish DreiWortChaos discipline (Host only)
   */
  async finish(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.finish(lobbyCode)
    } catch (error) {
      console.error('Error finishing DreiWortChaos:', error)
      throw error
    }
  },

  // ====================
  // Getter methods
  // ====================

  getState(lobbyStore) {
    return lobbyStore.currentLobby?.gameState?.dreiWortChaos || null
  },

  getSubmissionCount(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.dreiWortChaos?.submissions || {}
    return Object.keys(submissions).length
  },

  getSubmissions(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.dreiWortChaos?.submissions || {}
    const players = lobbyStore.players || {}
    const currentRound = lobbyStore.currentLobby?.gameState?.dreiWortChaos?.currentRound || 0
    const votes = lobbyStore.currentLobby?.gameState?.dreiWortChaos?.votes?.[currentRound] || {}

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
  }
})
