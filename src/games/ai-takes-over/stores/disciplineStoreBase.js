/**
 * Base Store Pattern für AI Takes Over Disciplines
 * Shared logic und helper methods für alle Discipline Stores
 */

import { ref as dbRef, set, update, get, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '@/firebase/config'

/**
 * Creates a base store with common discipline patterns
 * @param {string} disciplineName - Name of the discipline (e.g., 'bildertitel')
 */
export function createDisciplineStore(disciplineName) {
  return {
    disciplineName,

    /**
     * Generic phase update
     */
    async updatePhase(lobbyCode, phase, additionalData = {}) {
      if (!lobbyCode) {
        throw new Error('Lobby code required')
      }

      try {
        const updates = {
          [`lobbies/${lobbyCode}/gameState/${disciplineName}/phase`]: phase,
          ...Object.fromEntries(
            Object.entries(additionalData).map(([key, value]) => [
              `lobbies/${lobbyCode}/gameState/${disciplineName}/${key}`,
              value
            ])
          )
        }

        await update(dbRef(realtimeDb), updates)
        console.log(`${disciplineName} phase updated:`, phase)
      } catch (error) {
        console.error(`Error updating ${disciplineName} phase:`, error)
        throw error
      }
    },

    /**
     * Generic submission handler
     */
    async submitToPath(path, data) {
      try {
        const ref = dbRef(realtimeDb, path)
        await set(ref, {
          ...data,
          timestamp: serverTimestamp()
        })
        console.log(`${disciplineName} submission saved to:`, path)
      } catch (error) {
        console.error(`Error submitting to ${path}:`, error)
        throw error
      }
    },

    /**
     * Generic getter for discipline state
     */
    getState(currentLobby) {
      return currentLobby?.gameState?.[disciplineName] || null
    },

    /**
     * Generic submission count getter
     */
    getSubmissionCount(currentLobby) {
      const submissions = currentLobby?.gameState?.[disciplineName]?.submissions || {}
      return Object.keys(submissions).length
    },

    /**
     * Generic finish method
     */
    async finish(lobbyCode) {
      try {
        await set(
          dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/${disciplineName}/phase`),
          'finished'
        )
        console.log(`${disciplineName} finished`)
      } catch (error) {
        console.error(`Error finishing ${disciplineName}:`, error)
        throw error
      }
    },

    /**
     * Helper to build Firebase path
     */
    getPath(lobbyCode, ...segments) {
      return `lobbies/${lobbyCode}/gameState/${disciplineName}/${segments.join('/')}`
    },

    /**
     * Helper to get data at path
     */
    async getData(path) {
      try {
        const snapshot = await get(dbRef(realtimeDb, path))
        return snapshot.val()
      } catch (error) {
        console.error(`Error getting data from ${path}:`, error)
        throw error
      }
    }
  }
}

/**
 * Common vote handling pattern
 */
export const voteHelpers = {
  /**
   * Submit a vote for any discipline
   */
  async submitVote(lobbyCode, disciplineName, playerId, votedFor, currentRound) {
    const path = `lobbies/${lobbyCode}/gameState/${disciplineName}/votes/${currentRound}/${playerId}`
    const ref = dbRef(realtimeDb, path)

    await set(ref, {
      votedFor,
      timestamp: serverTimestamp()
    })
  },

  /**
   * Calculate votes for submissions
   */
  calculateVoteCounts(votes, submissions) {
    const voteCounts = {}

    // Initialize vote counts
    Object.keys(submissions).forEach(id => {
      voteCounts[id] = 0
    })

    // Count votes
    Object.values(votes || {}).forEach(vote => {
      if (vote.votedFor && voteCounts[vote.votedFor] !== undefined) {
        voteCounts[vote.votedFor]++
      }
    })

    return voteCounts
  },

  /**
   * Find winner(s) from vote counts
   */
  findWinners(voteCounts) {
    if (Object.keys(voteCounts).length === 0) return []

    const maxVotes = Math.max(...Object.values(voteCounts))
    return Object.entries(voteCounts)
      .filter(([_, count]) => count === maxVotes)
      .map(([id]) => id)
  }
}

/**
 * Common scoring pattern
 */
export const scoringHelpers = {
  /**
   * Add points to a player's score
   */
  addPoints(scores, playerId, points) {
    return {
      ...scores,
      [playerId]: (scores[playerId] || 0) + points
    }
  },

  /**
   * Award points based on votes received
   */
  awardVotePoints(scores, voteCounts, pointsPerVote) {
    const newScores = { ...scores }

    Object.entries(voteCounts).forEach(([playerId, voteCount]) => {
      newScores[playerId] = (newScores[playerId] || 0) + (voteCount * pointsPerVote)
    })

    return newScores
  },

  /**
   * Award bonus to winner(s)
   */
  awardWinnerBonus(scores, winners, bonusPoints) {
    const newScores = { ...scores }

    winners.forEach(playerId => {
      newScores[playerId] = (newScores[playerId] || 0) + bonusPoints
    })

    return newScores
  }
}

export default {
  createDisciplineStore,
  voteHelpers,
  scoringHelpers
}
