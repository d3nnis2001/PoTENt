/**
 * Duell System Configuration
 * Defines all duell games and their properties
 */

export const DUELL_GAMES = [
  {
    id: 'schneller-finger',
    name: 'SCHNELLER FINGER',
    shortName: 'SCHNELL',
    icon: '⚡',
    color: '#1a1a3a',
    description: 'Wer tippt schneller?',
    category: 'speed'
  },
  {
    id: 'schaetz-duell',
    name: 'SCHÄTZ-DUELL',
    shortName: 'SCHÄTZEN',
    icon: '📊',
    color: '#2a1a3a',
    description: 'Wer schätzt besser?',
    category: 'knowledge'
  },
  {
    id: 'higher-lower',
    name: 'HIGHER LOWER',
    shortName: 'HI-LO',
    icon: '⬆️',
    color: '#1a2a3a',
    description: 'Höher oder niedriger?',
    category: 'luck'
  },
  {
    id: 'bobs-captcha',
    name: "BOB'S CAPTCHA",
    shortName: 'CAPTCHA',
    icon: '🤖',
    color: '#3a1a2a',
    description: 'Beweise dass du kein Bot bist!',
    category: 'speed'
  },
  {
    id: 'ki-oder-kind',
    name: 'KI ODER KIND?',
    shortName: 'KI/KIND',
    icon: '👶',
    color: '#1a3a2a',
    description: 'Wer hat das gemalt?',
    category: 'knowledge'
  },
  {
    id: 'turing-test',
    name: "BOB'S TURING TEST",
    shortName: 'TURING',
    icon: '🧠',
    color: '#2a2a1a',
    description: 'Mensch oder Maschine?',
    category: 'knowledge'
  }
]

export const DUELL_CONFIG = {
  // Points for winning a duell
  winnerPoints: 300,
  loserPoints: 0,

  // Animation timings
  introAnnouncementDuration: 4000,
  playerSelectionDuration: 6000,
  wheelSpinDuration: 5000,
  revealDuration: 3000,

  // When to trigger duells (after which disciplines)
  duellTriggers: [
    'dreiWortChaos',     // After 3-Wort-Chaos
    'conspiracyCorner'   // After Conspiracy Corner
  ]
}

/**
 * Get a random duell game
 */
export const getRandomDuellGame = () => {
  const index = Math.floor(Math.random() * DUELL_GAMES.length)
  return DUELL_GAMES[index]
}

/**
 * Get duell game by ID
 */
export const getDuellGameById = (id) => {
  return DUELL_GAMES.find(game => game.id === id) || null
}

/**
 * Select two random players for a duell
 */
export const selectDuellPlayers = (players) => {
  if (players.length < 2) return null

  const shuffled = [...players].sort(() => Math.random() - 0.5)
  return {
    playerA: shuffled[0],
    playerB: shuffled[1]
  }
}

export default {
  DUELL_GAMES,
  DUELL_CONFIG,
  getRandomDuellGame,
  getDuellGameById,
  selectDuellPlayers
}
