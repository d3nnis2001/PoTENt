import { ref } from 'vue'
import { PasswordUtils } from '../utils/passwordUtils'

export function usePasswordProtection() {
  const showPasswordModal = ref(false)
  const passwordError = ref('')
  const isVerifying = ref(false)
  const currentGameId = ref(null)

  const checkGameAccess = (game, gameId) => {
    if (!game.password) {
      return true
    }

    const sessionKey = `session_${gameId}`
    try {
      const sessionData = localStorage.getItem(sessionKey)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        const now = Date.now()
        const sessionAge = now - session.timestamp
        const maxAge = 24 * 60 * 60 * 1000

        if (sessionAge < maxAge && session.gameId === gameId) {
          return true
        } else {
          localStorage.removeItem(sessionKey)
        }
      }
    } catch {
      localStorage.removeItem(sessionKey)
    }

    return false
  }

  const requestPassword = (gameId) => {
    currentGameId.value = gameId
    passwordError.value = ''
    showPasswordModal.value = true
  }

  const verifyPassword = async (game, password) => {
    isVerifying.value = true
    passwordError.value = ''

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const isValid = PasswordUtils.verifyPassword(password, game.password)
      
      if (isValid) {
        const sessionData = {
          gameId: currentGameId.value,
          timestamp: Date.now()
        }
        localStorage.setItem(`session_${currentGameId.value}`, JSON.stringify(sessionData))
        
        showPasswordModal.value = false
        return true
      } else {
        passwordError.value = 'Falsches Passwort!'
        return false
      }
    } catch (error) {
      passwordError.value = 'Fehler beim Überprüfen des Passworts'
      return false
    } finally {
      isVerifying.value = false
    }
  }

  const closePasswordModal = () => {
    showPasswordModal.value = false
    passwordError.value = ''
    currentGameId.value = null
  }

  PasswordUtils.cleanupExpiredSessions()

  return {
    showPasswordModal,
    passwordError,
    isVerifying,
    checkGameAccess,
    requestPassword,
    verifyPassword,
    closePasswordModal
  }
}