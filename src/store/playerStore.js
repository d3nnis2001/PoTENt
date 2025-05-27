import { reactive } from 'vue'

export const playerStore = reactive({
  players: [],
  
  loadPlayers() {
    const saved = localStorage.getItem('gamePlayers')
    if (saved) {
      this.players = JSON.parse(saved)
    }
  },
  
  savePlayers() {
    localStorage.setItem('gamePlayers', JSON.stringify(this.players))
  },
  
  addPlayer(name) {
    if (!name.trim()) return false
    if (this.players.some(player => player.name.toLowerCase() === name.trim().toLowerCase())) {
      return false
    }
    
    const newPlayer = {
      id: Date.now(),
      name: name.trim(),
      addedAt: new Date()
    }
    
    this.players.push(newPlayer)
    this.savePlayers()
    return true
  },
  
  removePlayer(playerId) {
    this.players = this.players.filter(player => player.id !== playerId)
    this.savePlayers()
  },
  
  updatePlayer(playerId, newName) {
    if (!newName.trim()) return false
    
    if (this.players.some(player => 
      player.id !== playerId && 
      player.name.toLowerCase() === newName.trim().toLowerCase()
    )) {
      return false
    }
    
    const player = this.players.find(p => p.id === playerId)
    if (player) {
      player.name = newName.trim()
      this.savePlayers()
      return true
    }
    return false
  },
  
  clearAllPlayers() {
    this.players = []
    this.savePlayers()
  },
  
  getPlayerNames() {
    return this.players.map(player => player.name)
  },
  
  getRandomPlayer() {
    if (this.players.length === 0) return null
    const randomIndex = Math.floor(Math.random() * this.players.length)
    return this.players[randomIndex]
  },
  
  getPlayerById(id) {
    return this.players.find(player => player.id === id)
  },
  
  shufflePlayers() {
    const shuffled = [...this.players]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
})