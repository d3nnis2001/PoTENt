import { reactive } from 'vue'

export const gameStore = reactive({
  decks: [],
  
  loadDecks() {
    const saved = localStorage.getItem('cardDecks')
    if (saved) {
      this.decks = JSON.parse(saved)
    }
  },
  
  saveDecks() {
    localStorage.setItem('cardDecks', JSON.stringify(this.decks))
  },
  
  createDeck(name) {
    const newDeck = {
      id: Date.now(),
      name,
      cards: []
    }
    this.decks.push(newDeck)
    this.saveDecks()
    return newDeck
  },
  
  deleteDeck(deckId) {
    this.decks = this.decks.filter(deck => deck.id !== deckId)
    this.saveDecks()
  },
  
  getDeck(deckId) {
    return this.decks.find(deck => deck.id === parseInt(deckId))
  },
  
  updateDeck(deckId, updatedDeck) {
    const index = this.decks.findIndex(deck => deck.id === parseInt(deckId))
    if (index !== -1) {
      this.decks[index] = updatedDeck
      this.saveDecks()
    }
  },
  
  addCard(deckId, card) {
    const deck = this.getDeck(deckId)
    if (deck) {
      deck.cards.push(card)
      this.saveDecks()
    }
  },
  
  deleteCard(deckId, cardIndex) {
    const deck = this.getDeck(deckId)
    if (deck) {
      deck.cards.splice(cardIndex, 1)
      this.saveDecks()
    }
  }
})