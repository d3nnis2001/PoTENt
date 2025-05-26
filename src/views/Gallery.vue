<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Loading Spinner -->
      <div v-if="cloudStore.isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="text-white mt-2">Lade Kartendecks...</p>
      </div>

      <div v-else>
        <div class="flex justify-between items-center mb-8">
          <div>
            <button
              @click="$router.push('/games')"
              class="text-purple-200 hover:text-white mb-2 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Zurück zur Spielauswahl
            </button>
            <h1 class="text-3xl font-bold text-white">Top 10 - Kartendecks</h1>
            <p class="text-purple-200 text-sm">☁️ Cloud-Sync aktiv</p>
          </div>
          <div class="flex gap-4">
            <!-- Migration Button (nur einmalig zeigen) -->
            <button
              v-if="hasLocalData"
              @click="migrateData"
              class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700"
            >
              📤 Lokale Daten übertragen
            </button>
            
            <button
              v-if="selectedDecks.length > 0"
              @click="playSelectedDecks"
              class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Mit {{ selectedDecks.length }} Deck(s) spielen
            </button>
            <button
              @click="showCreateModal = true"
              class="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Neues Deck
            </button>
          </div>
        </div>

        <!-- Selected Decks Info -->
        <div v-if="selectedDecks.length > 0" class="mb-6 p-4 bg-purple-600/20 rounded-lg border border-purple-400/30">
          <p class="text-white text-sm">
            <strong>{{ selectedDecks.length }} Deck(s) ausgewählt</strong> - 
            {{ totalSelectedCards }} Karten insgesamt
          </p>
          <div class="flex flex-wrap gap-2 mt-2">
            <span 
              v-for="deckId in selectedDecks" 
              :key="deckId"
              class="bg-purple-600/50 text-white px-3 py-1 rounded-full text-xs"
            >
              {{ getDeckName(deckId) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DeckCard
            v-for="deck in cloudStore.decks"
            :key="deck.id"
            :deck="deck"
            :is-selected="selectedDecks.includes(deck.id)"
            @edit="editDeck"
            @delete="deleteDeck"
            @toggle-select="toggleDeckSelection"
          />
        </div>

        <!-- Create Deck Modal -->
        <Modal :show="showCreateModal" @close="showCreateModal = false">
          <h2 class="text-xl font-bold text-white mb-4">Neues Kartendeck</h2>
          <form @submit.prevent="createDeck">
            <input
              v-model="newDeckName"
              type="text"
              placeholder="Deck Name..."
              class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
              required
            />
            <div class="flex gap-2">
              <button
                type="submit"
                :disabled="isCreating"
                class="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 disabled:opacity-50"
              >
                {{ isCreating ? 'Erstelle...' : 'Erstellen' }}
              </button>
              <button
                type="button"
                @click="cancelCreate"
                class="bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { cloudStore } from '../store/cloudStore'
import DeckCard from '../components/DeckCard.vue'
import Modal from '../components/Modal.vue'

export default {
  name: 'Gallery',
  components: {
    DeckCard,
    Modal
  },
  setup() {
    const router = useRouter()
    const showCreateModal = ref(false)
    const newDeckName = ref('')
    const selectedDecks = ref([])
    const isCreating = ref(false)
    let unsubscribe = null

    const hasLocalData = computed(() => {
      return localStorage.getItem('cardDecks') !== null
    })

    const totalSelectedCards = computed(() => {
      return selectedDecks.value.reduce((total, deckId) => {
        const deck = cloudStore.getDeck(deckId)
        return total + (deck ? deck.cards.length : 0)
      }, 0)
    })

    const getDeckName = (deckId) => {
      const deck = cloudStore.getDeck(deckId)
      return deck ? deck.name : 'Unbekannt'
    }

    const toggleDeckSelection = (deckId) => {
      const index = selectedDecks.value.indexOf(deckId)
      if (index > -1) {
        selectedDecks.value.splice(index, 1)
      } else {
        selectedDecks.value.push(deckId)
      }
    }

    const createDeck = async () => {
      isCreating.value = true
      try {
        await cloudStore.createDeck(newDeckName.value)
        showCreateModal.value = false
        newDeckName.value = ''
      } catch (error) {
        alert('Fehler beim Erstellen: ' + error.message)
      } finally {
        isCreating.value = false
      }
    }

    const cancelCreate = () => {
      showCreateModal.value = false
      newDeckName.value = ''
    }

    const deleteDeck = async (deckId) => {
      if (confirm('Möchtest du dieses Deck wirklich löschen?')) {
        try {
          await cloudStore.deleteDeck(deckId)
          // Remove from selection if it was selected
          const index = selectedDecks.value.indexOf(deckId)
          if (index > -1) {
            selectedDecks.value.splice(index, 1)
          }
        } catch (error) {
          alert('Fehler beim Löschen: ' + error.message)
        }
      }
    }

    const playSelectedDecks = () => {
      if (selectedDecks.value.length === 0) {
        alert('Bitte wähle mindestens ein Deck aus!')
        return
      }
      
      const hasCards = selectedDecks.value.some(deckId => {
        const deck = cloudStore.getDeck(deckId)
        return deck && deck.cards.length > 0
      })
      
      if (!hasCards) {
        alert('Die ausgewählten Decks haben keine Karten!')
        return
      }
      
      const deckIds = selectedDecks.value.join(',')
      router.push(`/top10/play/${deckIds}`)
    }

    const editDeck = (deckId) => {
      router.push(`/top10/edit/${deckId}`)
    }

    const migrateData = async () => {
      if (confirm('Möchtest du deine lokalen Daten in die Cloud übertragen?')) {
        try {
          await cloudStore.migrateFromLocalStorage()
          alert('Migration erfolgreich! Deine Daten sind jetzt in der Cloud.')
        } catch (error) {
          alert('Fehler bei der Migration: ' + error.message)
        }
      }
    }

    onMounted(async () => {
      await cloudStore.loadDecks()
      // Real-time Updates aktivieren
      unsubscribe = cloudStore.startListening()
    })

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })

    return {
      cloudStore,
      showCreateModal,
      newDeckName,
      selectedDecks,
      isCreating,
      hasLocalData,
      totalSelectedCards,
      getDeckName,
      toggleDeckSelection,
      createDeck,
      cancelCreate,
      deleteDeck,
      playSelectedDecks,
      editDeck,
      migrateData
    }
  }
}
</script>