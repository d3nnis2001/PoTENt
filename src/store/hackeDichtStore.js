import { reactive } from 'vue'

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
    this.games.push(newGame)
    this.saveGames()
    return newGame
  },
  
  updateGame(gameId, updatedGame) {
    const index = this.games.findIndex(game => game.id === parseInt(gameId))
    if (index !== -1) {
      this.games[index] = {
        ...updatedGame,
        id: parseInt(gameId),
        updatedAt: new Date()
      }
      this.saveGames()
    }
  },
  
  deleteGame(gameId) {
    this.games = this.games.filter(game => game.id !== parseInt(gameId))
    this.saveGames()
  },
  
  getGame(gameId) {
    return this.games.find(game => game.id === parseInt(gameId))
  },
  
  // Template für ein neues Spiel
  createEmptyGame() {
    return {
      name: '',
      description: '',
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