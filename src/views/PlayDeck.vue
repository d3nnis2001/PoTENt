<template>
  <div class="min-h-screen p-4">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-6">
        <button
          @click="$router.push('/gallery')"
          class="text-purple-200 hover:text-white mb-4 inline-flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Zurück zur Galerie
        </button>
        <h1 class="text-2xl font-bold text-white mb-2">{{ gameTitle }}</h1>
        <p class="text-purple-200">Karte {{ currentCardIndex + 1 }} von {{ allCards.length }}</p>
        
        <!-- Progress Bar -->
        <div class="w-full bg-white/20 rounded-full h-2 mt-4">
          <div 
            class="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Current Card -->
      <div v-if="currentCard" class="mb-8">
        <GameCard :card="currentCard" />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="text-white mt-2">Lade Kartendecks...</p>
      </div>

      <!-- No Cards State -->
      <div v-if="!isLoading && allCards.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <h2 class="text-xl font-semibold text-white mb-2">Keine Karten gefunden</h2>
        <p class="text-purple-200">Die ausgewählten Decks haben keine Karten.</p>
      </div>

      <!-- Navigation -->
      <div v-if="!isLoading && allCards.length > 0" class="text-center">
        <button
          @click="nextCard"
          class="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-lg"
        >
          <span>{{ isLastCard ? 'Spiel beenden' : 'Nächste Karte' }}</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <!-- Card from deck indicator -->
        <div v-if="currentCard && currentCard.deckName" class="mt-4 text-purple-200 text-sm">
          aus "{{ currentCard.deckName }}"
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cloudStore } from '../store/cloudStore'
import { shuffleArray } from '../utils/shuffle'
import GameCard from '../components/GameCard.vue'

export default {
  name: 'PlayDeck',
  components: {
    GameCard
  },
  props: {
    deckId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const allCards = ref([])
    const currentCardIndex = ref(0)
    const selectedDeckNames = ref([])
    const isLoading = ref(true)

    const currentCard = computed(() => allCards.value[currentCardIndex.value] || null)
    const isLastCard = computed(() => currentCardIndex.value >= allCards.value.length - 1)
    const progress = computed(() => {
      if (allCards.value.length === 0) return 0
      return ((currentCardIndex.value + 1) / allCards.value.length) * 100
    })

    const gameTitle = computed(() => {
      if (selectedDeckNames.value.length === 1) {
        return selectedDeckNames.value[0]
      } else if (selectedDeckNames.value.length > 1) {
        return `${selectedDeckNames.value.length} Kartendecks`
      }
      return 'Kartenspiel'
    })

    const initializeGame = async () => {
      isLoading.value = true
      
      try {
        // Sicherstellen, dass Decks geladen sind
        if (cloudStore.decks.length === 0) {
          await cloudStore.loadDecks()
        }

        const deckIds = props.deckId.split(',').map(id => parseInt(id.trim()))
        let combinedCards = []
        selectedDeckNames.value = []

        deckIds.forEach(deckId => {
          const deck = cloudStore.getDeck(deckId)
          if (deck && deck.cards && deck.cards.length > 0) {
            selectedDeckNames.value.push(deck.name)
            // Add deck name to each card for tracking
            const cardsWithDeckName = deck.cards.map(card => ({
              ...card,
              deckName: deck.name
            }))
            combinedCards = [...combinedCards, ...cardsWithDeckName]
          }
        })

        // Shuffle all cards together
        if (combinedCards.length > 0) {
          allCards.value = shuffleArray(combinedCards)
          currentCardIndex.value = 0
        } else {
          console.warn('Keine Karten in den ausgewählten Decks gefunden')
        }
      } catch (error) {
        console.error('Fehler beim Initialisieren des Spiels:', error)
      } finally {
        isLoading.value = false
      }
    }

    const nextCard = () => {
      if (isLastCard.value) {
        router.push('/gallery')
      } else {
        currentCardIndex.value++
      }
    }

    onMounted(async () => {
      await initializeGame()
    })

    return {
      allCards,
      currentCardIndex,
      currentCard,
      isLastCard,
      progress,
      gameTitle,
      isLoading,
      nextCard
    }
  }
}
</script>