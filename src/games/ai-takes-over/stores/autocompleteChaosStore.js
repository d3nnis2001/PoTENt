/**
 * AutocompleteChaos Discipline Store
 * Handles all AutocompleteChaos-specific game logic
 */

import { reactive } from 'vue'
import { ref as dbRef, set, update, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '@/firebase/config'
import { createDisciplineStore } from './disciplineStoreBase'

const base = createDisciplineStore('autocompleteChaos')

export const autocompleteChaosStore = reactive({
  ...base,

  /**
   * Initialize AutocompleteChaos discipline (Host only)
   */
  async initialize(lobbyStore, prompts) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
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

  /**
   * Submit completion for current prompt (Player)
   */
  async submitCompletion(lobbyStore, completion) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const playerId = lobbyStore.currentPlayer.id
      const currentRound = lobbyStore.currentLobby.gameState?.autocompleteChaos?.currentRound || 0

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

  /**
   * Update AutocompleteChaos phase (Host only)
   */
  async updatePhase(lobbyStore, phase, additionalData = {}) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.updatePhase(lobbyCode, phase, additionalData)
    } catch (error) {
      console.error('Error updating AutocompleteChaos phase:', error)
      throw error
    }
  },

  /**
   * Submit vote for a completion (Player)
   */
  async submitVote(lobbyStore, completionOwnerId) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const voterId = lobbyStore.currentPlayer.id
      const currentRound = lobbyStore.currentLobby.gameState?.autocompleteChaos?.currentRound || 0

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

  /**
   * Calculate scores for current round (Host only)
   */
  async calculateScores(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const autocomplete = lobbyStore.currentLobby.gameState?.autocompleteChaos || {}
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

  /**
   * Start next round (Host only)
   */
  async nextRound(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const autocomplete = lobbyStore.currentLobby.gameState?.autocompleteChaos || {}
      const currentRound = autocomplete.currentRound || 0
      const prompts = autocomplete.prompts || []
      const scores = autocomplete.scores || {}

      const nextRound = currentRound + 1

      if (nextRound >= prompts.length) {
        await this.updatePhase(lobbyStore, 'finished')
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

  /**
   * Finish AutocompleteChaos discipline (Host only)
   */
  async finish(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.finish(lobbyCode)
    } catch (error) {
      console.error('Error finishing AutocompleteChaos:', error)
      throw error
    }
  },

  // ====================
  // Getter methods
  // ====================

  getState(lobbyStore) {
    return lobbyStore.currentLobby?.gameState?.autocompleteChaos || null
  },

  getSubmissionCount(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.autocompleteChaos?.submissions || {}
    return Object.keys(submissions).length
  },

  getSubmissions(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.autocompleteChaos?.submissions || {}
    const players = lobbyStore.players || {}
    const currentRound = lobbyStore.currentLobby?.gameState?.autocompleteChaos?.currentRound || 0
    const votes = lobbyStore.currentLobby?.gameState?.autocompleteChaos?.votes?.[currentRound] || {}

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
  }
})
