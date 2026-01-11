/**
 * Discipline Player Composable
 * Generic composable for managing player-side discipline logic
 * Works with any discipline store that follows the base pattern
 */

import { computed } from 'vue'

/**
 * @param {string} disciplineName - Name of the discipline (for logging)
 * @param {Object} store - The discipline store (e.g., bildertitelStore)
 * @param {Object} lobbyStore - The lobby store
 * @param {Object} toast - Toast notification system { success, error }
 * @param {Object} translations - i18n translations object
 * @returns {Object} Discipline state and handlers
 */
export function useDisciplinePlayer(disciplineName, store, lobbyStore, toast, translations) {
  // ====================
  // Computed State
  // ====================

  const state = computed(() => store.getState(lobbyStore))

  const voteOptions = computed(() => {
    return store.getSubmissions ? store.getSubmissions(lobbyStore) : []
  })

  const playerScore = computed(() => {
    if (!lobbyStore.currentPlayer || !state.value) return 0
    return state.value.scores?.[lobbyStore.currentPlayer.id] || 0
  })

  // ====================
  // Handlers
  // ====================

  /**
   * Submit player's answer/submission
   * @param {any} data - The submission data (answer, title, theory, etc.)
   */
  const handleSubmit = async (data) => {
    try {
      // Different stores have different submit methods
      // Try to call the appropriate one based on what's available
      if (store.submitAnswer) {
        await store.submitAnswer(lobbyStore, data)
      } else if (store.submitTitle) {
        await store.submitTitle(lobbyStore, data)
      } else if (store.submitTheory) {
        await store.submitTheory(lobbyStore, data)
      } else if (store.submitPitch) {
        await store.submitPitch(lobbyStore, data)
      } else if (store.submitCompletion) {
        await store.submitCompletion(lobbyStore, data)
      } else {
        throw new Error(`No submit method found for ${disciplineName}`)
      }

      toast.success(translations.voteTransmitted)
    } catch (err) {
      console.error(`Error submitting for ${disciplineName}:`, err)
      toast.error(translations.errors?.transmission?.replace('{message}', err.message) || err.message)
    }
  }

  /**
   * Submit player's vote
   * @param {string} votedForId - ID of the player/submission being voted for
   * @param {string} additionalData - Optional additional data (e.g., imageId for bildertitel)
   */
  const handleVote = async (votedForId, additionalData = null) => {
    try {
      if (additionalData) {
        // Some stores need additional data (like bildertitel needs imageId)
        await store.submitVote(lobbyStore, votedForId, additionalData)
      } else {
        await store.submitVote(lobbyStore, votedForId)
      }

      toast.success(translations.voteTransmitted)
    } catch (err) {
      console.error(`Error voting for ${disciplineName}:`, err)
      toast.error(translations.errors?.transmission?.replace('{message}', err.message) || err.message)
    }
  }

  return {
    // State
    state,
    voteOptions,
    playerScore,

    // Handlers
    handleSubmit,
    handleVote
  }
}
