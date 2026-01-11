/**
 * Bildertitel Discipline Store
 * Handles all Bildertitel-specific game logic
 */

import { reactive } from 'vue'
import { ref as dbRef, set, update, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '@/firebase/config'
import { createDisciplineStore } from './disciplineStoreBase'

const base = createDisciplineStore('bildertitel')

export const bildertitelStore = reactive({
  ...base,

  /**
   * Initialize Bildertitel discipline (Host only)
   */
  async initialize(lobbyStore, roundImages, playerAssignments) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const updates = {}

      updates[`lobbies/${lobbyCode}/gameState/discipline`] = 'bildertitel'
      updates[`lobbies/${lobbyCode}/gameState/bildertitel`] = {
        phase: 'writing',
        currentRound: 0,
        roundImages,
        playerAssignments,
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

  /**
   * Submit title for assigned image (Player)
   */
  async submitTitle(lobbyStore, title) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const playerId = lobbyStore.currentPlayer.id

      // Find assigned image for this player
      const assignments = lobbyStore.currentLobby.gameState?.bildertitel?.playerAssignments || {}
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

      const submissionRef = dbRef(
        realtimeDb,
        `lobbies/${lobbyCode}/gameState/bildertitel/submissions/${playerId}`
      )

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

  /**
   * Submit vote for a title (Player)
   */
  async submitVote(lobbyStore, titleOwnerId, imageId) {
    if (!lobbyStore.currentPlayer || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const voterId = lobbyStore.currentPlayer.id

      // Can't vote on own image
      const assignments = lobbyStore.currentLobby.gameState?.bildertitel?.playerAssignments || {}
      const assignedPlayers = assignments[imageId] || []

      if (assignedPlayers.includes(voterId)) {
        throw new Error('Cannot vote on own image')
      }

      const voteRef = dbRef(
        realtimeDb,
        `lobbies/${lobbyCode}/gameState/bildertitel/votes/${imageId}/${voterId}`
      )

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

  /**
   * Update Bildertitel phase (Host only)
   */
  async updatePhase(lobbyStore, phase, additionalData = {}) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.updatePhase(lobbyCode, phase, additionalData)
    } catch (error) {
      console.error('Error updating Bildertitel phase:', error)
      throw error
    }
  },

  /**
   * Move to next image in reveal (Host only)
   */
  async nextImage(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const currentIndex = lobbyStore.currentLobby.gameState?.bildertitel?.currentRevealIndex || 0
      const totalImages = lobbyStore.currentLobby.gameState?.bildertitel?.roundImages?.length || 0

      if (currentIndex < totalImages - 1) {
        await set(
          dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/bildertitel/currentRevealIndex`),
          currentIndex + 1
        )
        await set(
          dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/bildertitel/phase`),
          'reveal'
        )
      }
    } catch (error) {
      console.error('Error moving to next image:', error)
      throw error
    }
  },

  /**
   * Calculate and save round scores (Host only)
   */
  async calculateScores(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const bildertitel = lobbyStore.currentLobby.gameState?.bildertitel || {}
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

      await set(
        dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/bildertitel/scores`),
        newScores
      )
      console.log('Scores calculated:', newScores)
    } catch (error) {
      console.error('Error calculating scores:', error)
      throw error
    }
  },

  /**
   * Start next Bildertitel round (Host only)
   */
  async nextRound(lobbyStore, roundImages, playerAssignments) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const currentRound = lobbyStore.currentLobby.gameState?.bildertitel?.currentRound || 0
      const scores = lobbyStore.currentLobby.gameState?.bildertitel?.scores || {}

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

  /**
   * Finish Bildertitel discipline (Host only)
   */
  async finish(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await base.finish(lobbyCode)
    } catch (error) {
      console.error('Error finishing Bildertitel:', error)
      throw error
    }
  },

  // ====================
  // Getter methods
  // ====================

  getState(lobbyStore) {
    return lobbyStore.currentLobby?.gameState?.bildertitel || null
  },

  getPlayerAssignedImage(lobbyStore, playerId) {
    const assignments = lobbyStore.currentLobby?.gameState?.bildertitel?.playerAssignments || {}
    const roundImages = lobbyStore.currentLobby?.gameState?.bildertitel?.roundImages || []

    for (const [imageId, playerIds] of Object.entries(assignments)) {
      if (playerIds.includes(playerId)) {
        return roundImages.find(img => img.id === imageId)
      }
    }
    return null
  },

  canPlayerVoteOnImage(lobbyStore, playerId, imageId) {
    const assignments = lobbyStore.currentLobby?.gameState?.bildertitel?.playerAssignments || {}
    const assignedPlayers = assignments[imageId] || []
    return !assignedPlayers.includes(playerId)
  },

  getSubmissionCount(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.bildertitel?.submissions || {}
    return Object.keys(submissions).length
  },

  getTitlesForImage(lobbyStore, imageId) {
    const submissions = lobbyStore.currentLobby?.gameState?.bildertitel?.submissions || {}
    const assignments = lobbyStore.currentLobby?.gameState?.bildertitel?.playerAssignments || {}
    const votes = lobbyStore.currentLobby?.gameState?.bildertitel?.votes || {}
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
  }
})
