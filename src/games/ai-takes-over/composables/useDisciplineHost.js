/**
 * Discipline Host Composable
 * Generic composable for managing host-side discipline logic
 * Works with any discipline store that follows the base pattern
 */

import { computed } from 'vue'

/**
 * @param {string} disciplineName - Name of the discipline (for logging)
 * @param {Object} store - The discipline store (e.g., bildertitelStore)
 * @param {Object} lobbyStore - The lobby store
 * @param {Object} config - Discipline configuration (with timings, rounds, etc.)
 * @param {Object} timer - Timer composable { startTimer, stopTimer }
 * @returns {Object} Discipline state and handlers
 */
export function useDisciplineHost(disciplineName, store, lobbyStore, config, timer) {
  // ====================
  // Computed State
  // ====================

  const state = computed(() => store.getState(lobbyStore))

  const submissionCount = computed(() => {
    return store.getSubmissionCount ? store.getSubmissionCount(lobbyStore) : 0
  })

  const submissions = computed(() => {
    return store.getSubmissions ? store.getSubmissions(lobbyStore) : []
  })

  const allSubmitted = computed(() => {
    const playerCount = Object.keys(lobbyStore.players || {}).length
    return submissionCount.value >= playerCount
  })

  // ====================
  // Phase Handlers
  // ====================

  /**
   * Start reveal phase
   */
  const handleStartReveal = async () => {
    try {
      timer.stopTimer()
      await store.updatePhase(lobbyStore, 'reveal')
    } catch (error) {
      console.error(`Error starting ${disciplineName} reveal:`, error)
      throw error
    }
  }

  /**
   * Start voting phase
   */
  const handleStartVoting = async () => {
    try {
      await store.updatePhase(lobbyStore, 'voting')
      if (config.voteTime) {
        timer.startTimer(config.voteTime)
      }
    } catch (error) {
      console.error(`Error starting ${disciplineName} voting:`, error)
      throw error
    }
  }

  /**
   * Finish voting and either move to next or show results
   */
  const handleFinishVoting = async () => {
    try {
      timer.stopTimer()
      await store.calculateScores(lobbyStore)
      await store.updatePhase(lobbyStore, 'results')
    } catch (error) {
      console.error(`Error finishing ${disciplineName} voting:`, error)
      throw error
    }
  }

  /**
   * Move to next round or finish discipline
   * @returns {boolean} - True if there's another round, false if finished
   */
  const handleNextRound = async () => {
    try {
      const hasMore = await store.nextRound(lobbyStore)

      if (hasMore) {
        if (config.writeTime) {
          timer.startTimer(config.writeTime)
        }
        return true
      } else {
        // Discipline finished
        await store.finish(lobbyStore)
        return false
      }
    } catch (error) {
      console.error(`Error starting next ${disciplineName} round:`, error)
      throw error
    }
  }

  /**
   * Initialize the discipline
   * @param {any} args - Arguments specific to the discipline initialization
   */
  const initialize = async (...args) => {
    try {
      await store.initialize(lobbyStore, ...args)
      if (config.writeTime) {
        timer.startTimer(config.writeTime)
      }
    } catch (error) {
      console.error(`Error initializing ${disciplineName}:`, error)
      throw error
    }
  }

  return {
    // State
    state,
    submissionCount,
    submissions,
    allSubmitted,

    // Handlers
    initialize,
    handleStartReveal,
    handleStartVoting,
    handleFinishVoting,
    handleNextRound
  }
}
