import { reactive } from 'vue'
import { PasswordUtils } from '../utils/passwordUtils'

export const hackeDichtStore = reactive({
  games: [],
  
  loadGames() {
    const saved = localStorage.getItem('hackeDichtGames')
    if (saved) {
      this.games = JSON.parse(saved)
    }
  },
  
  saveGames() {
    localStorage.setItem('hackeDichtGames', JSON.stringify(this.games))
  },
  
  createGame(gameData) {
    const newGame = {
      id: Date.now(),
      ...gameData,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'hacke-dicht'
    }
    
    // Hash password if provided
    if (newGame.password && newGame.password.trim()) {
      newGame.password = PasswordUtils.hashPassword(newGame.password.trim())
      newGame.isProtected = true
    } else {
      delete newGame.password
      newGame.isProtected = false
    }
    
    this.games.push(newGame)
    this.saveGames()
    return newGame
  },
  
  updateGame(gameId, updatedGame) {
    const index = this.games.findIndex(game => game.id === parseInt(gameId))
    if (index !== -1) {
      const gameToUpdate = {
        ...updatedGame,
        id: parseInt(gameId),
        updatedAt: new Date()
      }
      
      if (gameToUpdate.password && gameToUpdate.password.trim()) {
        if (!gameToUpdate.password.startsWith('$')) {
          gameToUpdate.password = PasswordUtils.hashPassword(gameToUpdate.password.trim())
        }
        gameToUpdate.isProtected = true
      } else {
        delete gameToUpdate.password
        gameToUpdate.isProtected = false
        PasswordUtils.removeSessionToken(gameId)
      }
      
      this.games[index] = gameToUpdate
      this.saveGames()
    }
  },
  
  deleteGame(gameId) {
    PasswordUtils.removeSessionToken(gameId)
    this.games = this.games.filter(game => game.id !== parseInt(gameId))
    this.saveGames()
  },
  
  getGame(gameId) {
    return this.games.find(game => game.id === parseInt(gameId))
  },
  
  isGameProtected(gameId) {
    const game = this.getGame(gameId)
    return game && game.isProtected && game.password
  },

  verifyGamePassword(gameId, password) {
    const game = this.getGame(gameId)
    if (!game || !game.password) return true
    
    return PasswordUtils.verifyPassword(password, game.password)
  },
  
  hasValidSession(gameId) {
    if (!this.isGameProtected(gameId)) return true
    
    return PasswordUtils.isSessionTokenValid(gameId)
  },
  
  createEmptyGame() {
    return {
      name: '',
      description: '',
      password: '',
      isProtected: false,
      rewards: [
        { name: '', image: null, questions: '1-5' },
        { name: '', image: null, questions: '6-10' },
        { name: '', image: null, questions: '11-15' }
      ],
      questions: Array.from({ length: 15 }, (_, index) => ({
        id: index + 1,
        question: '',
        answers: [
          { text: '' },
          { text: '' },
          { text: '' },
          { text: '' }
        ],
        correctAnswer: null
      })),
      eventQuestions: {}
    }
  }
})