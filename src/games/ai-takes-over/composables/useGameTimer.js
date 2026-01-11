/**
 * Game Timer Composable
 * Provides reusable timer functionality for game phases
 */

import { ref, onUnmounted } from 'vue'

export function useGameTimer() {
  const timeRemaining = ref(0)
  const isTimerActive = ref(false)
  let timerInterval = null
  let onEndCallback = null

  /**
   * Start a countdown timer
   * @param {number} seconds - Duration in seconds
   */
  const startTimer = (seconds) => {
    stopTimer()
    timeRemaining.value = seconds
    isTimerActive.value = true

    timerInterval = setInterval(() => {
      timeRemaining.value--

      if (timeRemaining.value <= 0) {
        handleTimerEnd()
      }
    }, 1000)
  }

  /**
   * Stop the current timer
   */
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    isTimerActive.value = false
    timeRemaining.value = 0
  }

  /**
   * Handle timer end - calls registered callback
   */
  const handleTimerEnd = () => {
    stopTimer()
    if (onEndCallback) {
      onEndCallback()
    }
  }

  /**
   * Register a callback for when timer ends
   * @param {Function} callback - Function to call when timer reaches 0
   */
  const onTimerEnd = (callback) => {
    onEndCallback = callback
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopTimer()
  })

  return {
    timeRemaining,
    isTimerActive,
    startTimer,
    stopTimer,
    onTimerEnd
  }
}
