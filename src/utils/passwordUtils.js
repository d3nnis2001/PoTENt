/**
 * Simple password utilities for client-side game protection
 * Note: This is NOT secure for real authentication, only for game access control
 */

export const PasswordUtils = {
  /**
   * Simple hash function for password (client-side only)
   * @param {string} password - Plain text password
   * @returns {string} - Hashed password
   */
  hashPassword(password) {
    // Simple hash using built-in crypto API if available, otherwise fallback
    if (window.crypto && window.crypto.subtle) {
      // For simplicity, we'll use a basic hash approach
      // In a real app, you'd use proper password hashing
      let hash = 0
      if (password.length === 0) return hash.toString()
      
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      
      return '$simple$' + Math.abs(hash).toString(36)
    } else {
      // Fallback for environments without crypto API
      return '$simple$' + btoa(password).split('').reverse().join('')
    }
  },

  /**
   * Verify a password against a hash
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {boolean} - True if password matches
   */
  verifyPassword(password, hashedPassword) {
    if (!password || !hashedPassword) return false
    
    const newHash = this.hashPassword(password)
    return newHash === hashedPassword
  },

  /**
   * Create a session token for a game
   * @param {number|string} gameId - Game ID
   */
  createSessionToken(gameId) {
    const token = Date.now().toString(36) + Math.random().toString(36)
    const expiry = Date.now() + (30 * 60 * 1000) // 30 minutes
    
    sessionStorage.setItem(`game_session_${gameId}`, JSON.stringify({
      token,
      expiry
    }))
  },

  /**
   * Check if session token is valid
   * @param {number|string} gameId - Game ID
   * @returns {boolean} - True if session is valid
   */
  isSessionTokenValid(gameId) {
    try {
      const sessionData = sessionStorage.getItem(`game_session_${gameId}`)
      if (!sessionData) return false
      
      const { expiry } = JSON.parse(sessionData)
      return Date.now() < expiry
    } catch {
      return false
    }
  },

  /**
   * Remove session token
   * @param {number|string} gameId - Game ID
   */
  removeSessionToken(gameId) {
    sessionStorage.removeItem(`game_session_${gameId}`)
  },

  /**
   * Clear all expired session tokens
   */
  clearExpiredSessions() {
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith('game_session_')) {
        try {
          const sessionData = JSON.parse(sessionStorage.getItem(key))
          if (Date.now() >= sessionData.expiry) {
            sessionStorage.removeItem(key)
          }
        } catch {
          // Remove corrupted session data
          sessionStorage.removeItem(key)
        }
      }
    })
  }
}