<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Gallery Header -->
      <GalleryHeader 
        @back="$router.push('/games')"
        @create-game="createNewGame"
        @migrate-data="migrateData"
        @play-selected="playSelectedDecks"
        :has-local-data="hasLocalData"
        :selected-decks="selectedDecks"
        :total-selected-cards="totalSelectedCards"
        :get-deck-name="getDeckName"
      />

      <!-- Games Grid or Empty State -->
      <div v-if="hackeDichtStore.games.length > 0">
        <!-- Selected Decks Info -->
        <SelectedDecksInfo 
          v-if="selectedDecks.length > 0"
          :selected-decks="selectedDecks"
          :total-selected-cards="totalSelectedCards"
          :get-deck-name="getDeckName"
        />

        <!-- Games Grid -->
        <GamesGrid 
          :games="hackeDichtStore.games"
          @edit-game="editGame"
          @play-game="playGame"
          @play-multiplayer="playMultiplayer"
          @delete-game="deleteGame"
        />
      </div>

      <!-- Empty State -->
      <EmptyGalleryState 
        v-else
        @create-game="createNewGame"
      />

      <!-- Password Modal -->
      <PasswordModal
        :show="showPasswordModal"
        :title="`${selectedGame?.name} entsperren`"
        subtitle="Dieses Quiz ist passwortgeschützt"
        :is-loading="isVerifying"
        :error="passwordError"
        @close="closePasswordModal"
        @submit="verifyPassword"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { hackeDichtStore } from '../store/hackeDichtStore'
import { usePasswordProtection } from '../composables/usePasswordProtection'

import GalleryHeader from '../components/hacke-dicht/GalleryHeader.vue'
import SelectedDecksInfo from '../components/hacke-dicht/SelectedDecksInfo.vue'
import GamesGrid from '../components/hacke-dicht/GamesGrid.vue'
import EmptyGalleryState from '../components/hacke-dicht/EmptyGalleryState.vue'
import PasswordModal from '../components/PasswordModal.vue'

export default {
  name: 'HackeDichtGallery',
  components: {
    GalleryHeader,
    SelectedDecksInfo,
    GamesGrid,
    EmptyGalleryState,
    PasswordModal
  },
  setup() {
    const router = useRouter()
    const selectedGame = ref(null)
    const pendingAction = ref(null) // 'play' or 'edit'
    const selectedDecks = ref([])
    
    const {
      showPasswordModal,
      passwordError,
      isVerifying,
      checkGameAccess,
      requestPassword,
      verifyPassword: verifyGamePassword,
      closePasswordModal: closeModal
    } = usePasswordProtection()
    const playMultiplayer = async (game) => {
      if (!isGamePlayable(game)) {
        showError('Spiel ist nicht vollständig! Bitte bearbeite es zuerst.')
        return
      }
      
      if (game.isProtected && !checkGameAccess(game)) {
        selectedGame.value = game
        pendingAction.value = 'multiplayer'
        showPasswordModal.value = true
      } else {  
        router.push(`/hacke-dicht/lobby/${game.id}`)
      }
    }
    // Computed properties
    const hasLocalData = computed(() => {
      return localStorage.getItem('cardDecks') !== null
    })

    const totalSelectedCards = computed(() => {
      return selectedDecks.value.reduce((total, deckId) => {
        const deck = hackeDichtStore.getDeck(deckId)
        return total + (deck ? deck.cards.length : 0)
      }, 0)
    })

    // Helper methods
    const getDeckName = (deckId) => {
      const deck = hackeDichtStore.getDeck(deckId)
      return deck ? deck.name : 'Unbekannt'
    }

    // Game actions
    const createNewGame = () => {
      router.push('/hacke-dicht/editor')
    }

    const editGame = async (game) => {
      if (game.isProtected && !checkGameAccess(game, game.id)) {
        selectedGame.value = game
        pendingAction.value = 'edit'
        requestPassword(game.id)
      } else {
        router.push(`/hacke-dicht/editor/${game.id}`)
      }
    }

    const playGame = async (game) => {
      if (!isGamePlayable(game)) return
      
      if (game.isProtected && !checkGameAccess(game, game.id)) {
        selectedGame.value = game
        pendingAction.value = 'play'
        requestPassword(game.id)
      } else {
        router.push(`/hacke-dicht/play/${game.id}`)
      }
    }

    const deleteGame = (gameId) => {
      if (confirm('Möchtest du dieses Quiz wirklich löschen?')) {
        hackeDichtStore.deleteGame(gameId)
      }
    }

    const playSelectedDecks = () => {
      if (selectedDecks.value.length === 0) {
        alert('Bitte wähle mindestens ein Deck aus!')
        return
      }
      
      const hasCards = selectedDecks.value.some(deckId => {
        const deck = hackeDichtStore.getDeck(deckId)
        return deck && deck.cards.length > 0
      })
      
      if (!hasCards) {
        alert('Die ausgewählten Decks haben keine Karten!')
        return
      }
      
      const deckIds = selectedDecks.value.join(',')
      router.push(`/top10/play/${deckIds}`)
    }

    const migrateData = async () => {
      if (confirm('Möchtest du deine lokalen Daten in die Cloud übertragen?')) {
        try {
          await hackeDichtStore.migrateFromLocalStorage()
          alert('Migration erfolgreich! Deine Daten sind jetzt in der Cloud.')
        } catch (error) {
          alert('Fehler bei der Migration: ' + error.message)
        }
      }
    }

    // Password handling
    const verifyPassword = async (password) => {
      if (!selectedGame.value) return

      const isValid = await verifyGamePassword(selectedGame.value, password)
      
      if (isValid) {
        if (pendingAction.value === 'play') {
          router.push(`/hacke-dicht/play/${selectedGame.value.id}`)
        } else if (pendingAction.value === 'edit') {
          router.push(`/hacke-dicht/editor/${selectedGame.value.id}`)
        }
        resetPasswordState()
      }
    }

    const closePasswordModal = () => {
      closeModal()
      resetPasswordState()
    }

    const resetPasswordState = () => {
      selectedGame.value = null
      pendingAction.value = null
    }

    // Game validation
    const isGamePlayable = (game) => {
      const completedQuestions = game.questions.filter(q => 
        q.question && q.answers.every(a => a.text) && q.correctAnswer !== null
      ).length
      
      return completedQuestions === 15 && 
             game.rewards.every(r => r.name) && 
             game.name
    }

    onMounted(() => {
      hackeDichtStore.loadGames()
    })

    return {
      hackeDichtStore,
      selectedGame,
      selectedDecks,
      showPasswordModal,
      passwordError,
      isVerifying,
      hasLocalData,
      totalSelectedCards,
      getDeckName,
      createNewGame,
      editGame,
      playGame,
      deleteGame,
      playSelectedDecks,
      migrateData,
      verifyPassword,
      closePasswordModal,
      playMultiplayer
    }
  }
}
</script>