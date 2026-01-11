/**
 * Duell System Composable
 * Manages duell-specific game logic including player selection,
 * intro sequence, game flow with timer, and phase transitions
 *
 * Pattern follows useDisciplineHost for consistency
 */

import { ref, computed, watch } from 'vue'

/**
 * @param {Object} lobbyStore - The lobby store
 * @param {Object} duellStore - The duell store
 * @param {Object} config - Duell configuration (with winnerPoints, etc.)
 * @param {Function} selectPlayers - Function to select random players
 * @param {Function} getRandomGame - Function to get random duell game
 * @param {Function} onNavigateToNext - Callback for navigating to next discipline
 * @returns {Object} Duell state and handlers
 */
export function useDuellSystem(
  lobbyStore,
  duellStore,
  config,
  selectPlayers,
  getRandomGame,
  onNavigateToNext
) {
  // ====================
  // State
  // ====================

  const duellIntroRef = ref(null)
  const pendingNextDiscipline = ref(null)
  const timerInterval = ref(null)

  // ====================
  // Computed State
  // ====================

  const state = computed(() => {
    return lobbyStore.currentLobby?.gameState?.duell || null
  })

  const playerList = computed(() => {
    return Object.values(lobbyStore.players || {})
      .filter(p => p.isOnline && !p.isHost && !p.isModerator)
  })

  const gameData = computed(() => state.value?.gameData || null)
  const timeRemaining = computed(() => state.value?.timeRemaining || 0)
  const bothSubmitted = computed(() => duellStore.bothDuellistsSubmitted(lobbyStore))

  // ====================
  // Timer Management
  // ====================

  const startTimer = (duration) => {
    stopTimer()

    let remaining = duration
    duellStore.updateTimeRemaining(lobbyStore, remaining)

    timerInterval.value = setInterval(async () => {
      remaining--
      await duellStore.updateTimeRemaining(lobbyStore, remaining)

      if (remaining <= 0) {
        stopTimer()
        await handleTimeUp()
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  const handleTimeUp = async () => {
    console.log('Duell time up!')
    // Process the round even if not everyone submitted
    await handleProcessRound()
  }

  // ====================
  // Handlers
  // ====================

  /**
   * Trigger a duell between two random players
   * @param {string} nextDisciplineAfterDuell - The discipline to continue to after duell
   */
  const triggerDuell = async (nextDisciplineAfterDuell) => {
    try {
      // Store the next discipline to continue after duell
      pendingNextDiscipline.value = nextDisciplineAfterDuell

      // Select random players and game
      const selectedPlayers = selectPlayers(playerList.value)
      const selectedGame = getRandomGame()

      if (!selectedPlayers) {
        console.error('Not enough players for duell')
        // Skip duell and continue to next discipline
        if (onNavigateToNext) {
          await onNavigateToNext(nextDisciplineAfterDuell)
        }
        return
      }

      // Initialize duell in Firebase (this now includes gameData)
      await duellStore.initialize(
        lobbyStore,
        selectedPlayers.playerA,
        selectedPlayers.playerB,
        selectedGame
      )

      // Start the intro animation
      setTimeout(() => {
        duellIntroRef.value?.start()
      }, 500)
    } catch (error) {
      console.error('Error triggering duell:', error)
      throw error
    }
  }

  /**
   * Handle duell intro completion - ready to start
   */
  const handleDuellReady = async (duellData) => {
    console.log('Duell ready:', duellData)
  }

  /**
   * Handle duell start - transition from intro to playing
   */
  const handleDuellStart = async (duellData) => {
    try {
      // Start the game
      await duellStore.startGame(lobbyStore)

      // Start the timer based on game type
      const timeLimit = state.value?.gameData?.timeLimit || 30
      startTimer(timeLimit)

      console.log('Duell started with timer:', timeLimit)
    } catch (error) {
      console.error('Error starting duell:', error)
      throw error
    }
  }

  /**
   * Process the current round and show reveal
   */
  const handleProcessRound = async () => {
    try {
      stopTimer()
      await duellStore.processRound(lobbyStore)
    } catch (error) {
      console.error('Error processing round:', error)
      throw error
    }
  }

  /**
   * Handle next round or finish
   */
  const handleNextRound = async () => {
    try {
      const hasMore = await duellStore.nextRound(lobbyStore)

      if (hasMore) {
        // Start timer for next round
        const timeLimit = state.value?.gameData?.timeLimit || 15
        startTimer(timeLimit)
      } else {
        // No more rounds, determine winner
        await duellStore.determineWinner(lobbyStore)
      }
    } catch (error) {
      console.error('Error handling next round:', error)
      throw error
    }
  }

  /**
   * Handle duell completion and navigate to next discipline
   */
  const handleDuellComplete = async () => {
    try {
      stopTimer()

      // Finish duell and add winner points
      await duellStore.finish(lobbyStore, config.winnerPoints)

      // Wait a moment to show results
      setTimeout(async () => {
        // Clear duell and move to next discipline
        const nextDiscipline = pendingNextDiscipline.value
        pendingNextDiscipline.value = null
        await duellStore.clear(lobbyStore, nextDiscipline)

        if (onNavigateToNext) {
          await onNavigateToNext(nextDiscipline)
        }
      }, 3000)
    } catch (error) {
      console.error('Error completing duell:', error)
      throw error
    }
  }

  /**
   * Force reveal (skip to reveal phase)
   */
  const handleForceReveal = async () => {
    await handleProcessRound()
  }

  // ====================
  // Watchers
  // ====================

  // Watch for both duellists submitting
  watch(bothSubmitted, async (submitted) => {
    if (submitted && state.value?.phase === 'playing') {
      console.log('Both duellists submitted, processing round...')
      await handleProcessRound()
    }
  })

  // Cleanup on unmount
  const cleanup = () => {
    stopTimer()
  }

  return {
    // State
    state,
    gameData,
    timeRemaining,
    bothSubmitted,
    duellIntroRef,
    pendingNextDiscipline,

    // Handlers
    triggerDuell,
    handleDuellReady,
    handleDuellStart,
    handleProcessRound,
    handleNextRound,
    handleDuellComplete,
    handleForceReveal,

    // Timer
    startTimer,
    stopTimer,

    // Cleanup
    cleanup
  }
}
