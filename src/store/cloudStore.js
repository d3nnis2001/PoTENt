import { reactive } from 'vue'
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore'
import { db } from '../firebase/config'

export const cloudStore = reactive({
  decks: [],
  userId: 'user1',
  isLoading: false,
  isListening: false,
  unsubscribe: null,
  
  async loadDecks() {
    if (this.isLoading) return 
    
    this.isLoading = true
    try {
      const decksRef = collection(db, `users/${this.userId}/decks`)
      const snapshot = await getDocs(decksRef)
      
      this.decks = []
      snapshot.forEach(doc => {
        const data = doc.data()
        this.decks.push({
          id: parseInt(doc.id),
          ...data,
          cards: Array.isArray(data.cards) ? data.cards : []
        })
      })
      
      console.log('Decks geladen:', this.decks.length)
    } catch (error) {
      console.error('Fehler beim Laden:', error)
      this.loadFromLocalStorage()
    } finally {
      this.isLoading = false
    }
  },
  
  // Deck speichern
  async saveDeck(deck) {
    try {
      const deckRef = doc(db, `users/${this.userId}/decks`, deck.id.toString())
      const deckData = {
        name: deck.name,
        cards: deck.cards || [],
        createdAt: deck.createdAt || new Date(),
        updatedAt: new Date()
      }
      
      await setDoc(deckRef, deckData)
      console.log('Deck gespeichert:', deck.name)
      
      // Lokale Aktualisierung als Fallback (falls onSnapshot zu langsam ist)
      this.updateDeckLocally(deck)
      
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      throw error
    }
  },
  
  // Deck löschen
  async deleteDeck(deckId) {
    try {
      const deckRef = doc(db, `users/${this.userId}/decks`, deckId.toString())
      await deleteDoc(deckRef)
      console.log('Deck gelöscht:', deckId)
      
      // Lokale Entfernung als Fallback
      this.removeDeckLocally(deckId)
      
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      throw error
    }
  },
  
  // Lokale Deck-Aktualisierung (Fallback)
  updateDeckLocally(updatedDeck) {
    const index = this.decks.findIndex(d => d.id === updatedDeck.id)
    if (index !== -1) {
      // Deck existiert - aktualisieren
      this.decks[index] = { ...updatedDeck, cards: Array.isArray(updatedDeck.cards) ? updatedDeck.cards : [] }
      console.log('Deck lokal aktualisiert:', updatedDeck.name)
    } else {
      // Neues Deck - hinzufügen
      this.decks.push({ ...updatedDeck, cards: Array.isArray(updatedDeck.cards) ? updatedDeck.cards : [] })
      console.log('Neues Deck lokal hinzugefügt:', updatedDeck.name)
    }
  },
  
  // Lokale Deck-Entfernung (Fallback)
  removeDeckLocally(deckId) {
    const initialLength = this.decks.length
    this.decks = this.decks.filter(deck => deck.id !== parseInt(deckId))
    if (this.decks.length < initialLength) {
      console.log('Deck lokal entfernt:', deckId)
    }
  },
  
  // Neues Deck erstellen
  async createDeck(name) {
    const newDeck = {
      id: Date.now(),
      name,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await this.saveDeck(newDeck)
    return newDeck
  },
  
  // Deck finden
  getDeck(deckId) {
    return this.decks.find(deck => deck.id === parseInt(deckId))
  },
  
  // Karte hinzufügen
  async addCard(deckId, card) {
    const deck = this.getDeck(parseInt(deckId))
    if (!deck) {
      throw new Error('Deck nicht gefunden')
    }
    
    // Sicherstellen dass cards Array existiert
    const currentCards = Array.isArray(deck.cards) ? deck.cards : []
    
    const updatedDeck = {
      ...deck,
      cards: [...currentCards, { ...card }],
      updatedAt: new Date()
    }
    
    console.log('Speichere Deck mit Karten:', updatedDeck.cards.length)
    await this.saveDeck(updatedDeck)
    console.log('Karte hinzugefügt zu Deck:', deck.name)
  },
  
  // Karte löschen
  async deleteCard(deckId, cardIndex) {
    const deck = this.getDeck(parseInt(deckId))
    if (!deck) {
      throw new Error('Deck nicht gefunden')
    }
    
    const updatedCards = [...(deck.cards || [])]
    updatedCards.splice(cardIndex, 1)
    
    const updatedDeck = {
      ...deck,
      cards: updatedCards,
      updatedAt: new Date()
    }
    
    await this.saveDeck(updatedDeck)
    console.log('Karte gelöscht aus Deck:', deck.name)
  },
  
  // Real-time Updates aktivieren
  startListening() {
    if (this.isListening || this.unsubscribe) {
      console.log('Listener bereits aktiv')
      return this.unsubscribe
    }
    
    this.isListening = true
    const decksRef = collection(db, `users/${this.userId}/decks`)
    
    this.unsubscribe = onSnapshot(decksRef, (snapshot) => {
      console.log('Firebase Update empfangen, Docs:', snapshot.size)
      
      const newDecks = []
      snapshot.forEach(doc => {
        const data = doc.data()
        newDecks.push({
          id: parseInt(doc.id),
          ...data,
          cards: Array.isArray(data.cards) ? data.cards : [] // Sicherstellen dass cards Array ist
        })
      })
      
      // Nur aktualisieren wenn es wirkliche Unterschiede gibt
      const hasChanges = this.hasSignificantChanges(newDecks)
      if (hasChanges) {
        // Deck-spezifische Updates loggen
        newDecks.forEach(deck => {
          const oldDeck = this.decks.find(d => d.id === deck.id)
          if (!oldDeck) {
            console.log(`Neues Deck von Firebase: "${deck.name}" mit ${deck.cards?.length || 0} Karten`)
          } else if (oldDeck.cards?.length !== deck.cards?.length) {
            console.log(`Deck "${deck.name}" hat jetzt ${deck.cards?.length || 0} Karten (vorher: ${oldDeck.cards?.length || 0})`)
          }
        })
        
        this.decks = newDecks
        console.log('Decks von Firebase aktualisiert:', this.decks.length)
      } else {
        console.log('Keine signifikanten Änderungen von Firebase - Update übersprungen')
      }
    }, (error) => {
      console.error('Firebase Listener Fehler:', error)
      this.isListening = false
      this.unsubscribe = null
    })
    
    return this.unsubscribe
  },
  
  // Prüft ob es signifikante Änderungen gibt
  hasSignificantChanges(newDecks) {
    if (this.decks.length !== newDecks.length) {
      return true // Anzahl der Decks hat sich geändert
    }
    
    for (const newDeck of newDecks) {
      const oldDeck = this.decks.find(d => d.id === newDeck.id)
      if (!oldDeck) {
        return true // Neues Deck
      }
      if (oldDeck.name !== newDeck.name) {
        return true // Name geändert
      }
      if ((oldDeck.cards?.length || 0) !== (newDeck.cards?.length || 0)) {
        return true // Anzahl Karten geändert
      }
      // Hier könntest du noch tiefer prüfen (Karteninhalte etc.)
    }
    
    return false
  },
  
  // Listener stoppen
  stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
      this.isListening = false
      console.log('Firebase Listener gestoppt')
    }
  },
  
  // Fallback zu localStorage
  loadFromLocalStorage() {
    const saved = localStorage.getItem('cardDecks')
    if (saved) {
      this.decks = JSON.parse(saved)
      console.log('Lokale Daten geladen:', this.decks.length)
    }
  },
  
  // Zu Cloud migrieren
  async migrateFromLocalStorage() {
    const saved = localStorage.getItem('cardDecks')
    if (saved) {
      const localDecks = JSON.parse(saved)
      console.log('Migriere', localDecks.length, 'Decks zur Cloud')
      
      for (const deck of localDecks) {
        await this.saveDeck(deck)
      }
      localStorage.removeItem('cardDecks')
      console.log('Migration abgeschlossen')
    }
  }
})