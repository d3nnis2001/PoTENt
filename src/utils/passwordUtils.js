import CryptoJS from 'crypto-js'

export class PasswordUtils {
  static hashPassword(password) {
    return CryptoJS.SHA256(password).toString()
  }

  static verifyPassword(password, hash) {
    return this.hashPassword(password) === hash
  }

  static generateSessionToken(gameId, password) {
    const data = `${gameId}_${password}_${Date.now()}`
    return CryptoJS.SHA256(data).toString().substring(0, 16)
  }

  static isSessionTokenValid(token, gameId) {
    const sessionData = localStorage.getItem(`session_${gameId}`)
    if (!sessionData) return false

    try {
      const session = JSON.parse(sessionData)
      const now = Date.now()
      const sessionAge = now - session.timestamp
      const maxAge = 24 * 60 * 60 * 1000

      return session.token === token && sessionAge < maxAge
    } catch {
      return false
    }
  }

  static saveSessionToken(gameId, token) {
    const sessionData = {
      token,
      timestamp: Date.now()
    }
    localStorage.setItem(`session_${gameId}`, JSON.stringify(sessionData))
  }

  static removeSessionToken(gameId) {
    localStorage.removeItem(`session_${gameId}`)
  }

  static cleanupExpiredSessions() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('session_'))
    keys.forEach(key => {
      try {
        const sessionData = JSON.parse(localStorage.getItem(key))
        const now = Date.now()
        const sessionAge = now - sessionData.timestamp
        const maxAge = 24 * 60 * 60 * 1000

        if (sessionAge >= maxAge) {
          localStorage.removeItem(key)
        }
      } catch {
        localStorage.removeItem(key)
      }
    })
  }
}