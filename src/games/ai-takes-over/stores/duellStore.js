/**
 * Duell System Store
 * Handles all Duell-specific game logic
 * Pattern follows other discipline stores (dreiWortChaos, etc.)
 */

import { reactive } from 'vue'
import { ref as dbRef, set, update, get, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '@/firebase/config'

// Import game data generators
import { getRandomSchaetzQuestions } from '@/games/ai-takes-over/data/duell/schaetzDuellQuestions'
import { getRandomKiOderKindImages } from '@/games/ai-takes-over/data/duell/kiOderKindImages'
import { getRandomTuringTexts } from '@/games/ai-takes-over/data/duell/turingTestTexts'
import { generateHigherLowerSequence } from '@/games/ai-takes-over/data/duell/higherLowerCards'
import { getRandomTypingText } from '@/games/ai-takes-over/data/duell/schnellerFingerTexts'
import { getRandomCaptchas } from '@/games/ai-takes-over/data/duell/captchaChallenges'

/**
 * Generate initial game data based on game type
 */
const generateGameData = (gameId) => {
  switch (gameId) {
    case 'schaetz-duell': {
      const question = getRandomSchaetzQuestions(1)[0]
      return {
        phase: 'input',
        question,
        submissions: {},
        timeLimit: 30
      }
    }
    case 'ki-oder-kind': {
      const images = getRandomKiOderKindImages(5)
      return {
        phase: 'voting',
        currentRound: 0,
        totalRounds: 5,
        images: images,
        submissions: {},
        scores: { a: 0, b: 0 },
        timeLimit: 15
      }
    }
    case 'turing-test': {
      const texts = getRandomTuringTexts(5)
      return {
        phase: 'voting',
        currentRound: 0,
        totalRounds: 5,
        texts: texts,
        submissions: {},
        scores: { a: 0, b: 0 },
        timeLimit: 20
      }
    }
    case 'higher-lower': {
      const sequence = generateHigherLowerSequence(10)
      return {
        phase: 'guessing',
        currentRound: 0,
        totalRounds: 10,
        cards: sequence,
        currentTurn: 'a',
        scores: { a: 0, b: 0 },
        streak: 0,
        timeLimit: 10
      }
    }
    case 'schneller-finger': {
      const text = getRandomTypingText('medium')
      return {
        phase: 'countdown',
        countdown: 3,
        targetText: text.text,
        timeLimit: 60,
        submissions: {},
        results: {}
      }
    }
    case 'bobs-captcha': {
      const captchas = getRandomCaptchas(5, 'mixed')
      return {
        phase: 'countdown',
        countdown: 3,
        currentIndex: 0,
        totalCaptchas: 5,
        captchas: captchas,
        submissions: {},
        scores: { a: 0, b: 0 },
        timeLimit: 10
      }
    }
    default:
      return { phase: 'error', message: 'Unknown game type' }
  }
}

export const duellStore = reactive({
  /**
   * Initialize Duell (Host only)
   */
  async initialize(lobbyStore, playerA, playerB, game) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const duellId = `duell_${Date.now()}`
      const gameData = generateGameData(game.id)

      const duellData = {
        id: duellId,
        phase: 'intro', // intro → playing → reveal → results
        playerA: {
          id: playerA.id,
          name: playerA.name,
          icon: playerA.icon,
          score: 0
        },
        playerB: {
          id: playerB.id,
          name: playerB.name,
          icon: playerB.icon,
          score: 0
        },
        game: game,
        gameData: gameData,
        winner: null,
        timeRemaining: gameData.timeLimit || 30
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/duell`] = duellData
      updates[`lobbies/${lobbyCode}/gameState/discipline`] = 'duell'

      await update(dbRef(realtimeDb), updates)
      console.log('Duell initialized:', duellId)
      return duellId
    } catch (error) {
      console.error('Error initializing duell:', error)
      throw error
    }
  },

  /**
   * Start the duell game (Host only) - transitions from intro to playing
   */
  async startGame(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const duellState = lobbyStore.currentLobby?.gameState?.duell
      const gameData = duellState?.gameData

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/duell/phase`] = 'playing'
      updates[`lobbies/${lobbyCode}/gameState/duell/timeRemaining`] = gameData?.timeLimit || 30

      await update(dbRef(realtimeDb), updates)
      console.log('Duell game started')
    } catch (error) {
      console.error('Error starting duell game:', error)
      throw error
    }
  },

  /**
   * Update time remaining (Host only)
   */
  async updateTimeRemaining(lobbyStore, time) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      await set(
        dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/duell/timeRemaining`),
        time
      )
    } catch (error) {
      console.error('Error updating time:', error)
    }
  },

  /**
   * Update duell phase (Host only)
   */
  async updatePhase(lobbyStore, phase, additionalData = {}) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const updates = {
        [`lobbies/${lobbyCode}/gameState/duell/phase`]: phase
      }

      // Add additional data updates
      for (const [key, value] of Object.entries(additionalData)) {
        updates[`lobbies/${lobbyCode}/gameState/duell/${key}`] = value
      }

      await update(dbRef(realtimeDb), updates)
      console.log('Duell phase updated:', phase)
    } catch (error) {
      console.error('Error updating duell phase:', error)
      throw error
    }
  },

  /**
   * Update game data (Host only)
   */
  async updateGameData(lobbyStore, gameDataUpdates) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const updates = {}

      for (const [key, value] of Object.entries(gameDataUpdates)) {
        updates[`lobbies/${lobbyCode}/gameState/duell/gameData/${key}`] = value
      }

      await update(dbRef(realtimeDb), updates)
    } catch (error) {
      console.error('Error updating game data:', error)
      throw error
    }
  },

  /**
   * Submit answer/vote (Player - duellist or spectator)
   */
  async submitAnswer(lobbyStore, data) {
    if (!lobbyStore.currentLobby || !lobbyStore.currentPlayer) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const playerId = lobbyStore.currentPlayer.id

      const submissionRef = dbRef(
        realtimeDb,
        `lobbies/${lobbyCode}/gameState/duell/gameData/submissions/${playerId}`
      )
      await set(submissionRef, {
        ...data,
        timestamp: serverTimestamp()
      })

      console.log('Duell submission:', data)
    } catch (error) {
      console.error('Error submitting duell answer:', error)
      throw error
    }
  },

  /**
   * Process submissions and determine round winner (Host only)
   */
  async processRound(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const duellState = lobbyStore.currentLobby?.gameState?.duell
      const gameData = duellState?.gameData
      const gameId = duellState?.game?.id
      const submissions = gameData?.submissions || {}

      const playerAId = duellState?.playerA?.id
      const playerBId = duellState?.playerB?.id
      const playerASubmission = submissions[playerAId]
      const playerBSubmission = submissions[playerBId]

      let roundWinner = null
      let newScores = { ...gameData?.scores || { a: 0, b: 0 } }

      // Determine winner based on game type
      switch (gameId) {
        case 'schaetz-duell': {
          const answer = gameData?.question?.answer
          const diffA = playerASubmission ? Math.abs(playerASubmission.estimate - answer) : Infinity
          const diffB = playerBSubmission ? Math.abs(playerBSubmission.estimate - answer) : Infinity
          roundWinner = diffA < diffB ? 'a' : diffB < diffA ? 'b' : null
          break
        }
        case 'ki-oder-kind':
        case 'turing-test': {
          const currentRound = gameData?.currentRound || 0
          const items = gameId === 'ki-oder-kind' ? gameData?.images : gameData?.texts
          const correctAnswer = items?.[currentRound]?.answer || items?.[currentRound]?.author
          const aCorrect = playerASubmission?.vote === correctAnswer
          const bCorrect = playerBSubmission?.vote === correctAnswer
          if (aCorrect && !bCorrect) {
            newScores.a++
            roundWinner = 'a'
          } else if (bCorrect && !aCorrect) {
            newScores.b++
            roundWinner = 'b'
          } else if (aCorrect && bCorrect) {
            newScores.a++
            newScores.b++
          }
          break
        }
        case 'higher-lower': {
          const currentRound = gameData?.currentRound || 0
          const cards = gameData?.cards || []
          const currentCard = cards[currentRound]
          const nextCard = cards[currentRound + 1]
          const isHigher = nextCard?.searchVolume > currentCard?.searchVolume
          const currentTurn = gameData?.currentTurn || 'a'
          const activeSubmission = currentTurn === 'a' ? playerASubmission : playerBSubmission
          const guessCorrect = activeSubmission?.guess === (isHigher ? 'higher' : 'lower')

          if (guessCorrect) {
            newScores[currentTurn]++
          }
          roundWinner = guessCorrect ? currentTurn : (currentTurn === 'a' ? 'b' : 'a')
          break
        }
        case 'schneller-finger': {
          const aTime = playerASubmission?.time || Infinity
          const bTime = playerBSubmission?.time || Infinity
          roundWinner = aTime < bTime ? 'a' : bTime < aTime ? 'b' : null
          break
        }
        case 'bobs-captcha': {
          const aScore = playerASubmission?.score || 0
          const bScore = playerBSubmission?.score || 0
          newScores.a = (newScores.a || 0) + aScore
          newScores.b = (newScores.b || 0) + bScore
          break
        }
      }

      // Update game data
      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/duell/gameData/scores`] = newScores
      updates[`lobbies/${lobbyCode}/gameState/duell/gameData/roundWinner`] = roundWinner
      updates[`lobbies/${lobbyCode}/gameState/duell/gameData/phase`] = 'reveal'

      await update(dbRef(realtimeDb), updates)
      console.log('Round processed, winner:', roundWinner)
      return { roundWinner, scores: newScores }
    } catch (error) {
      console.error('Error processing round:', error)
      throw error
    }
  },

  /**
   * Go to next round (Host only)
   */
  async nextRound(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const duellState = lobbyStore.currentLobby?.gameState?.duell
      const gameData = duellState?.gameData
      const gameId = duellState?.game?.id
      const currentRound = gameData?.currentRound || 0
      const totalRounds = gameData?.totalRounds || 5

      if (currentRound + 1 >= totalRounds) {
        // Game finished
        return false
      }

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/duell/gameData/currentRound`] = currentRound + 1
      updates[`lobbies/${lobbyCode}/gameState/duell/gameData/submissions`] = {}
      updates[`lobbies/${lobbyCode}/gameState/duell/gameData/phase`] = 'voting'
      updates[`lobbies/${lobbyCode}/gameState/duell/timeRemaining`] = gameData?.timeLimit || 15

      // For higher-lower, alternate turns
      if (gameId === 'higher-lower') {
        const newTurn = gameData?.currentTurn === 'a' ? 'b' : 'a'
        updates[`lobbies/${lobbyCode}/gameState/duell/gameData/currentTurn`] = newTurn
      }

      await update(dbRef(realtimeDb), updates)
      console.log('Next round started:', currentRound + 1)
      return true
    } catch (error) {
      console.error('Error starting next round:', error)
      throw error
    }
  },

  /**
   * Determine and set duell winner (Host only)
   */
  async determineWinner(lobbyStore) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const duellState = lobbyStore.currentLobby?.gameState?.duell
      const scores = duellState?.gameData?.scores || { a: 0, b: 0 }

      let winner = null
      if (scores.a > scores.b) {
        winner = duellState?.playerA?.id
      } else if (scores.b > scores.a) {
        winner = duellState?.playerB?.id
      }
      // If tie, winner stays null

      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/duell/winner`] = winner
      updates[`lobbies/${lobbyCode}/gameState/duell/phase`] = 'results'
      updates[`lobbies/${lobbyCode}/gameState/duell/playerA/score`] = scores.a
      updates[`lobbies/${lobbyCode}/gameState/duell/playerB/score`] = scores.b

      await update(dbRef(realtimeDb), updates)
      console.log('Duell winner determined:', winner)
      return winner
    } catch (error) {
      console.error('Error determining winner:', error)
      throw error
    }
  },

  /**
   * Finish duell and award points to winner (Host only)
   */
  async finish(lobbyStore, winnerPoints = 300) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const duellState = lobbyStore.currentLobby?.gameState?.duell
      const winnerId = duellState?.winner

      if (winnerId) {
        // Get current global scores
        const globalScoresRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/globalScores`)
        const snapshot = await get(globalScoresRef)
        const currentScores = snapshot.val() || {}

        // Add winner points
        const newScore = (currentScores[winnerId] || 0) + winnerPoints
        currentScores[winnerId] = newScore

        await set(globalScoresRef, currentScores)
        console.log('Duell winner points added:', winnerId, winnerPoints)
      }

      // Mark duell as finished
      await set(dbRef(realtimeDb, `lobbies/${lobbyCode}/gameState/duell/phase`), 'finished')
    } catch (error) {
      console.error('Error finishing duell:', error)
      throw error
    }
  },

  /**
   * Clear duell state and return to previous discipline flow (Host only)
   */
  async clear(lobbyStore, nextDiscipline) {
    if (!lobbyStore.isHost || !lobbyStore.currentLobby) return

    try {
      const lobbyCode = lobbyStore.currentLobby.code
      const updates = {}
      updates[`lobbies/${lobbyCode}/gameState/duell`] = null
      updates[`lobbies/${lobbyCode}/gameState/discipline`] = nextDiscipline

      await update(dbRef(realtimeDb), updates)
      console.log('Duell cleared, moving to:', nextDiscipline)
    } catch (error) {
      console.error('Error clearing duell:', error)
      throw error
    }
  },

  // ====================
  // Getter methods
  // ====================

  getState(lobbyStore) {
    return lobbyStore.currentLobby?.gameState?.duell || null
  },

  getSubmissionCount(lobbyStore) {
    const submissions = lobbyStore.currentLobby?.gameState?.duell?.gameData?.submissions || {}
    return Object.keys(submissions).length
  },

  getDuellistSubmissionCount(lobbyStore) {
    const duellState = lobbyStore.currentLobby?.gameState?.duell
    const submissions = duellState?.gameData?.submissions || {}
    const playerAId = duellState?.playerA?.id
    const playerBId = duellState?.playerB?.id

    let count = 0
    if (submissions[playerAId]) count++
    if (submissions[playerBId]) count++
    return count
  },

  bothDuellistsSubmitted(lobbyStore) {
    return this.getDuellistSubmissionCount(lobbyStore) >= 2
  },

  isCurrentPlayerInDuell(lobbyStore) {
    const duellState = this.getState(lobbyStore)
    if (!duellState || !lobbyStore.currentPlayer) return false

    return (
      duellState.playerA?.id === lobbyStore.currentPlayer.id ||
      duellState.playerB?.id === lobbyStore.currentPlayer.id
    )
  },

  isCurrentPlayerDuellA(lobbyStore) {
    const duellState = this.getState(lobbyStore)
    if (!duellState || !lobbyStore.currentPlayer) return false
    return duellState.playerA?.id === lobbyStore.currentPlayer.id
  },

  getCurrentPlayerSubmission(lobbyStore) {
    const duellState = this.getState(lobbyStore)
    if (!duellState || !lobbyStore.currentPlayer) return null
    const submissions = duellState?.gameData?.submissions || {}
    return submissions[lobbyStore.currentPlayer.id] || null
  }
})
