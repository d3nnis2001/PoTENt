/**
 * AI Takes Over - Central Game Configuration
 * All game constants and settings in one place
 *
 * GAME MODES: Change ACTIVE_GAME_MODE to switch between presets
 */

// =============================================================================
// GAME MODE PRESETS
// =============================================================================

export const GAME_MODES = {
  // Standard game - full experience
  standard: {
    name: 'Standard',
    description: 'Das volle Spielerlebnis',
    disciplines: ['bildertitel', 'dreiWortChaos', 'autocompleteChaos', 'conspiracyCorner', 'werbungFuerMuell'],
    bildertitel: { rounds: 3, writeTime: 60, voteTime: 30 },
    dreiWortChaos: { rounds: 5, writeTime: 45, voteTime: 20 },
    autocompleteChaos: { rounds: 5, writeTime: 45, voteTime: 25 },
    conspiracyCorner: { rounds: 4, writeTime: 90, voteTime: 30 },
    werbungFuerMuell: { rounds: 3, writeTime: 120, voteTime: 45 }
  },

  // Quick game - shorter rounds
  quick: {
    name: 'Schnellrunde',
    description: 'Kürzere Runden für zwischendurch',
    disciplines: ['bildertitel', 'dreiWortChaos', 'autocompleteChaos', 'conspiracyCorner', 'werbungFuerMuell'],
    bildertitel: { rounds: 2, writeTime: 45, voteTime: 20 },
    dreiWortChaos: { rounds: 3, writeTime: 30, voteTime: 15 },
    autocompleteChaos: { rounds: 3, writeTime: 30, voteTime: 15 },
    conspiracyCorner: { rounds: 2, writeTime: 60, voteTime: 20 },
    werbungFuerMuell: { rounds: 2, writeTime: 90, voteTime: 30 }
  },

  // Party mode - more chaos, more fun
  party: {
    name: 'Party Modus',
    description: 'Mehr Chaos, mehr Spaß!',
    disciplines: ['dreiWortChaos', 'autocompleteChaos', 'conspiracyCorner', 'werbungFuerMuell', 'bildertitel'],
    bildertitel: { rounds: 2, writeTime: 45, voteTime: 25 },
    dreiWortChaos: { rounds: 6, writeTime: 40, voteTime: 15 },
    autocompleteChaos: { rounds: 6, writeTime: 35, voteTime: 20 },
    conspiracyCorner: { rounds: 5, writeTime: 75, voteTime: 25 },
    werbungFuerMuell: { rounds: 4, writeTime: 100, voteTime: 40 }
  },

  // Creative focus - longer writing times
  creative: {
    name: 'Kreativ Modus',
    description: 'Mehr Zeit für kreative Antworten',
    disciplines: ['autocompleteChaos', 'conspiracyCorner', 'werbungFuerMuell', 'bildertitel', 'dreiWortChaos'],
    bildertitel: { rounds: 3, writeTime: 90, voteTime: 40 },
    dreiWortChaos: { rounds: 4, writeTime: 60, voteTime: 25 },
    autocompleteChaos: { rounds: 5, writeTime: 60, voteTime: 30 },
    conspiracyCorner: { rounds: 5, writeTime: 120, voteTime: 45 },
    werbungFuerMuell: { rounds: 4, writeTime: 180, voteTime: 60 }
  },

  // Debug mode - very short for testing
  debug: {
    name: 'Debug',
    description: 'Kurze Zeiten zum Testen',
    disciplines: ['bildertitel', 'dreiWortChaos', 'autocompleteChaos', 'conspiracyCorner', 'werbungFuerMuell'],
    bildertitel: { rounds: 1, writeTime: 10, voteTime: 5 },
    dreiWortChaos: { rounds: 1, writeTime: 10, voteTime: 5 },
    autocompleteChaos: { rounds: 1, writeTime: 10, voteTime: 5 },
    conspiracyCorner: { rounds: 1, writeTime: 10, voteTime: 5 },
    werbungFuerMuell: { rounds: 1, writeTime: 10, voteTime: 5 }
  }
}

// =============================================================================
// ACTIVE GAME MODE - CHANGE THIS TO SWITCH MODES
// =============================================================================

export const ACTIVE_GAME_MODE = 'standard'

// =============================================================================
// GET ACTIVE CONFIGURATION
// =============================================================================

const getActiveMode = () => GAME_MODES[ACTIVE_GAME_MODE] || GAME_MODES.standard

// =============================================================================
// DISCIPLINE ORDER & FLOW (from active mode)
// =============================================================================

export const DISCIPLINE_ORDER = getActiveMode().disciplines

export const MINI_DISCIPLINES = [
  'blitzLuege',
  'bobsBullshit',
  'bobsRoast',
  'wieViele'
]

// =============================================================================
// BILDERTITEL CONFIGURATION
// =============================================================================

export const BILDERTITEL_CONFIG = {
  // Game flow (from active mode)
  get rounds() { return getActiveMode().bildertitel.rounds },
  get writeTime() { return getActiveMode().bildertitel.writeTime },
  get voteTime() { return getActiveMode().bildertitel.voteTime },

  // Images per round based on player count
  getImageCount: (playerCount) => {
    if (playerCount <= 5) return 2
    if (playerCount <= 9) return 3
    if (playerCount <= 12) return 4
    return 5
  },

  // Scoring
  scoring: {
    voteReceived: 100,
    correctGuess: 50,
    bonusAllVotes: 200
  }
}

// =============================================================================
// 3-WORT-CHAOS CONFIGURATION
// =============================================================================

export const DREI_WORT_CHAOS_CONFIG = {
  // Game flow (from active mode)
  get rounds() { return getActiveMode().dreiWortChaos.rounds },
  get writeTime() { return getActiveMode().dreiWortChaos.writeTime },
  get voteTime() { return getActiveMode().dreiWortChaos.voteTime },

  // Game rules
  requiredWords: 3,
  maxInputLength: 60,

  // Scoring
  scoring: {
    voteReceived: 100,
    bonusMostVotes: 150
  }
}

// =============================================================================
// CONSPIRACY CORNER CONFIGURATION
// =============================================================================

export const CONSPIRACY_CORNER_CONFIG = {
  // Game flow (from active mode)
  get rounds() { return getActiveMode().conspiracyCorner.rounds },
  get writeTime() { return getActiveMode().conspiracyCorner.writeTime },
  get voteTime() { return getActiveMode().conspiracyCorner.voteTime },

  // Game rules
  maxInputLength: 500,
  minInputLength: 50,

  // Scoring
  scoring: {
    voteReceived: 100,
    mostConvincing: 200,
    bonusUnanimous: 300
  }
}

// =============================================================================
// WERBUNG FÜR MÜLL CONFIGURATION
// =============================================================================

export const WERBUNG_FUER_MUELL_CONFIG = {
  // Game flow (from active mode)
  get rounds() { return getActiveMode().werbungFuerMuell.rounds },
  get writeTime() { return getActiveMode().werbungFuerMuell.writeTime },
  get voteTime() { return getActiveMode().werbungFuerMuell.voteTime },

  // Game rules
  maxInputLength: 300,
  minInputLength: 30,

  // Scoring
  scoring: {
    voteReceived: 100,
    bestPitch: 250,
    creativityBonus: 150
  }
}

// =============================================================================
// AUTOCOMPLETE CHAOS CONFIGURATION
// =============================================================================

export const AUTOCOMPLETE_CHAOS_CONFIG = {
  // Game flow (from active mode)
  get rounds() { return getActiveMode().autocompleteChaos.rounds },
  get writeTime() { return getActiveMode().autocompleteChaos.writeTime },
  get voteTime() { return getActiveMode().autocompleteChaos.voteTime },

  // Game rules
  maxInputLength: 150,
  minInputLength: 10,

  // Scoring
  scoring: {
    voteReceived: 100,
    bestCompletion: 200,
    bonusMostVotes: 150
  }
}

// =============================================================================
// MINI DISCIPLINES CONFIGURATION
// =============================================================================

export const MINI_DISCIPLINE_CONFIG = {
  blitzLuege: {
    rounds: 3,
    timePerRound: 15
  },
  bobsBullshit: {
    rounds: 3,
    timePerRound: 20
  },
  bobsRoast: {
    rounds: 2,
    timePerRound: 30
  },
  wieViele: {
    rounds: 3,
    timePerRound: 10
  }
}

// =============================================================================
// LOBBY CONFIGURATION
// =============================================================================

export const LOBBY_CONFIG = {
  minPlayers: 3,
  maxPlayers: 20,
  codeLength: 6,
  lobbyTimeout: 30 * 60 * 1000,
  connectionCheckInterval: 5000
}

// =============================================================================
// UI CONFIGURATION
// =============================================================================

export const UI_CONFIG = {
  animations: {
    cardReveal: 400,
    scoreUpdate: 300,
    phaseTransition: 500
  },
  timerWarning: 10,
  timerDanger: 5,
  toastDuration: {
    success: 3000,
    error: 5000,
    info: 4000
  }
}

// =============================================================================
// BOB PERSONALITY CONFIGURATION
// =============================================================================

export const BOB_CONFIG = {
  messageCycleInterval: 5000,
  intro: {
    terminalLineDelay: 800,
    speechDelay: 2000,
    disciplineDelay: 600,
    countdownDuration: 3
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getDisciplineConfig = (disciplineName) => {
  const configs = {
    bildertitel: BILDERTITEL_CONFIG,
    dreiWortChaos: DREI_WORT_CHAOS_CONFIG,
    autocompleteChaos: AUTOCOMPLETE_CHAOS_CONFIG,
    conspiracyCorner: CONSPIRACY_CORNER_CONFIG,
    werbungFuerMuell: WERBUNG_FUER_MUELL_CONFIG
  }
  return configs[disciplineName] || null
}

export const getNextDiscipline = (currentDiscipline) => {
  const currentIndex = DISCIPLINE_ORDER.indexOf(currentDiscipline)
  if (currentIndex === -1 || currentIndex >= DISCIPLINE_ORDER.length - 1) {
    return null
  }
  return DISCIPLINE_ORDER[currentIndex + 1]
}

export const hasMoreDisciplines = (currentDiscipline) => {
  return getNextDiscipline(currentDiscipline) !== null
}

export const getGameModeInfo = () => {
  const mode = getActiveMode()
  return {
    name: mode.name,
    description: mode.description,
    disciplineCount: mode.disciplines.length
  }
}

export const getAllGameModes = () => {
  return Object.entries(GAME_MODES).map(([key, mode]) => ({
    id: key,
    name: mode.name,
    description: mode.description
  }))
}

export default {
  GAME_MODES,
  ACTIVE_GAME_MODE,
  DISCIPLINE_ORDER,
  MINI_DISCIPLINES,
  BILDERTITEL_CONFIG,
  DREI_WORT_CHAOS_CONFIG,
  AUTOCOMPLETE_CHAOS_CONFIG,
  CONSPIRACY_CORNER_CONFIG,
  WERBUNG_FUER_MUELL_CONFIG,
  MINI_DISCIPLINE_CONFIG,
  LOBBY_CONFIG,
  UI_CONFIG,
  BOB_CONFIG,
  getDisciplineConfig,
  getNextDiscipline,
  hasMoreDisciplines,
  getGameModeInfo,
  getAllGameModes
}
