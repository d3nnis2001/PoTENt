// Verfügbare Spieler-Icons
export const PLAYER_ICONS = [
  '🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪'
]

// Lobby-Code Validierung
export function isValidLobbyCode(code) {
  return /^[A-Z0-9]{6}$/.test(code)
}

// Spielername Validierung
export function isValidPlayerName(name) {
  return name && 
         name.trim().length >= 2 && 
         name.trim().length <= 20 &&
         /^[a-zA-ZäöüÄÖÜß0-9\s]+$/.test(name.trim())
}

// QR-Code URL generieren
export function generateJoinUrl(lobbyCode) {
  const baseUrl = window.location.origin
  return `${baseUrl}/#/join/${lobbyCode}`
}

// Voting-Statistiken berechnen
export function calculateVoteStats(votes) {
  const totalVotes = Object.keys(votes).length
  const answerCounts = { 0: 0, 1: 0, 2: 0, 3: 0 }
  
  Object.values(votes).forEach(vote => {
    if (typeof vote.answer === 'number' && vote.answer >= 0 && vote.answer <= 3) {
      answerCounts[vote.answer]++
    }
  })
  
  const percentages = {}
  Object.keys(answerCounts).forEach(answer => {
    percentages[answer] = totalVotes > 0 ? 
      Math.round((answerCounts[answer] / totalVotes) * 100) : 0
  })
  
  return {
    totalVotes,
    answerCounts,
    percentages
  }
}

// Spieler-Status Helpers
export function getPlayerStatus(player) {
  if (!player.isOnline) return 'offline'
  if (player.isHost) return 'host'
  return 'online'
}

// Timer-Funktionen
export function formatTimeRemaining(seconds) {
  if (seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Lobby-Cleanup (für scheduled functions)
export function shouldCleanupLobby(lobby) {
  const now = Date.now()
  const maxAge = 2 * 60 * 60 * 1000 // 2 Stunden
  
  // Lobby löschen wenn:
  // 1. Älter als 2 Stunden
  // 2. Keine Spieler online
  // 3. Status finished und älter als 30 Min
  
  if (lobby.createdAt && (now - lobby.createdAt) > maxAge) {
    return true
  }
  
  const onlinePlayers = Object.values(lobby.players || {})
    .filter(p => p.isOnline).length
  
  if (onlinePlayers === 0) {
    return true
  }
  
  if (lobby.status === 'finished') {
    const finishedAge = 30 * 60 * 1000 // 30 Min
    return lobby.finishedAt && (now - lobby.finishedAt) > finishedAge
  }
  
  return false
}