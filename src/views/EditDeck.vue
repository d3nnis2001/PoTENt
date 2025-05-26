<template>
  <div class="min-h-screen p-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <button
            @click="$router.push('/top10/gallery')"
            class="text-purple-200 hover:text-white mb-2 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Zurück zur Galerie
          </button>
          <h1 class="text-3xl font-bold text-white">{{ deck?.name || 'Deck bearbeiten' }}</h1>
          <p class="text-purple-200 text-sm">☁️ Änderungen werden automatisch gespeichert</p>
        </div>
        <button
          @click="showAddModal = true"
          class="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Karte hinzufügen
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="text-white mt-2">Speichere...</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(card, index) in deck?.cards || []"
          :key="`${deck?.id}-${index}`"
          class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 group"
        >
          <div class="flex justify-between items-start mb-4">
            <span class="text-purple-200 text-sm">Karte {{ index + 1 }}</span>
            <button
              @click="deleteCard(index)"
              :disabled="isLoading"
              class="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-25"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-white mb-2">Story/Frage</h3>
              <p class="text-purple-100 bg-white/5 p-3 rounded-lg">{{ card.story }}</p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-2">Pantomime</h3>
              <p class="text-purple-100 bg-white/5 p-3 rounded-lg">{{ card.pantomime }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="deck?.cards?.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <h2 class="text-xl font-semibold text-white mb-2">Noch keine Karten</h2>
        <p class="text-purple-200">Füge deine erste Karte hinzu!</p>
      </div>

      <!-- Add Card Modal -->
      <Modal :show="showAddModal" @close="cancelAdd">
        <h2 class="text-xl font-bold text-white mb-4">Neue Karte hinzufügen</h2>
        <form @submit.prevent="addCard" class="space-y-4">
          <div>
            <label class="block text-white font-medium mb-2">Story/Frage</label>
            <textarea
              v-model="newCard.story"
              class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              rows="3"
              placeholder="Beschreibe die Geschichte oder stelle eine Frage..."
              required
            ></textarea>
          </div>
          <div>
            <label class="block text-white font-medium mb-2">Pantomime</label>
            <textarea
              v-model="newCard.pantomime"
              class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              rows="3"
              placeholder="Beschreibe die Pantomime-Aufgabe..."
              required
            ></textarea>
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 disabled:opacity-50"
            >
              {{ isLoading ? 'Speichere...' : 'Hinzufügen' }}
            </button>
            <button
              type="button"
              @click="cancelAdd"
              :disabled="isLoading"
              class="bg-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/30 disabled:opacity-50"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { cloudStore } from '../store/cloudStore'
import Modal from '../components/Modal.vue'

export default {
  name: 'EditDeck',
  components: {
    Modal
  },
  props: {
    deckId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const showAddModal = ref(false)
    const newCard = ref({ story: '', pantomime: '' })
    const isLoading = ref(false)
    let unsubscribe = null

    const deck = computed(() => cloudStore.getDeck(parseInt(props.deckId)))

    const addCard = async () => {
      if (!deck.value) return
      
      isLoading.value = true
      try {
        await cloudStore.addCard(parseInt(props.deckId), { ...newCard.value })
        newCard.value = { story: '', pantomime: '' }
        showAddModal.value = false
      } catch (error) {
        alert('Fehler beim Hinzufügen der Karte: ' + error.message)
      } finally {
        isLoading.value = false
      }
    }

    const deleteCard = async (index) => {
      if (confirm('Möchtest du diese Karte wirklich löschen?')) {
        isLoading.value = true
        try {
          await cloudStore.deleteCard(parseInt(props.deckId), index)
        } catch (error) {
          alert('Fehler beim Löschen der Karte: ' + error.message)
        } finally {
          isLoading.value = false
        }
      }
    }

    const cancelAdd = () => {
      showAddModal.value = false
      newCard.value = { story: '', pantomime: '' }
    }

    onMounted(async () => {
      // Sicherstellen, dass Daten geladen sind
      if (cloudStore.decks.length === 0) {
        await cloudStore.loadDecks()
      }
      
      // Real-time Updates für dieses Deck
      if (!cloudStore.isListening) {
        unsubscribe = cloudStore.startListening()
      }
    })

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })

    // Watch für Deck-Updates
    watch(() => deck.value, (newDeck) => {
      console.log('Deck updated:', newDeck)
    }, { deep: true })

    return {
      deck,
      showAddModal,
      newCard,
      isLoading,
      addCard,
      deleteCard,
      cancelAdd
    }
  }
}
</script>