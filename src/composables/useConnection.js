// src/composables/useConnection.js - Connection monitoring

import { ref, onMounted, onUnmounted } from 'vue'
import { lobbyStore } from '../store/lobbyStore'
import { globalToast } from './useToast'

export function useConnection() {
  const isOnline = ref(navigator.onLine)
  const retryCount = ref(0)
  const maxRetries = 3
  const retryDelay = 2000
  
  const { error: showError, success } = globalToast

  // Monitor online status
  const handleOnline = () => {
    isOnline.value = true
    if (lobbyStore.canRejoinLobby()) {
      attemptReconnect()
    }
  }

  const handleOffline = () => {
    isOnline.value = false
    showError('Internetverbindung verloren')
  }

  // Auto-reconnect logic
const attemptReconnect = async () => {
  if (retryCount.value >= maxRetries) {
    showError('Verbindung konnte nicht wiederhergestellt werden')
    return false
  }

  try {
    retryCount.value++
    
    // FIX: Prüfe canRejoinLobby bevor reconnect
    if (lobbyStore.canRejoinLobby()) {
      const success = await lobbyStore.reconnectToLobby(lobbyStore.currentLobby.code)
      
      if (success) {
        retryCount.value = 0
        success('Verbindung wiederhergestellt!')  // FIX: Verwende success statt showSuccess
        return true
      }
    } else {
      console.log('Cannot rejoin lobby - missing player/lobby data')
      return false
    }
    
    // Retry after delay
    setTimeout(attemptReconnect, retryDelay * retryCount.value)
    return false
    
  } catch (error) {
    console.error('Reconnect attempt failed:', error)
    setTimeout(attemptReconnect, retryDelay * retryCount.value)
    return false
  }
}

  // Manual retry
  const manualRetry = async () => {
    retryCount.value = 0
    return await attemptReconnect()
  }

  // Reset retry counter
  const resetRetry = () => {
    retryCount.value = 0
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    retryCount,
    maxRetries,
    attemptReconnect,
    manualRetry,
    resetRetry
  }
}