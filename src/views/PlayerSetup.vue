<template>
  <div class="min-h-screen p-4">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">Spieler hinzufügen</h1>
        <p class="text-purple-200 text-lg">Füge alle Mitspieler hinzu, bevor ihr startet</p>
      </div>

      <!-- Add Player Form -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
        <h2 class="text-xl font-bold text-white mb-4">Neuen Spieler hinzufügen</h2>
        <form @submit.prevent="addPlayer" class="flex gap-4">
          <input
            v-model="newPlayerName"
            type="text"
            placeholder="Spielername eingeben..."
            class="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            maxlength="20"
            required
          />
          <button
            type="submit"
            :disabled="!newPlayerName.trim() || isAddingPlayer"
            class="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Hinzufügen
          </button>
        </form>
        
        <!-- Error Message -->
        <div v-if="errorMessage" class="mt-3 text-red-300 text-sm">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Players List -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-white">
            Mitspieler ({{ playerStore.players.length }})
          </h2>
          <button
            v-if="playerStore.players.length > 0"
            @click="showClearConfirm = true"
            class="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Alle löschen
          </button>
        </div>

        <!-- Players Grid -->
        <div v-if="playerStore.players.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="player in playerStore.players"
            :key="player.id"
            class="bg-white/5 rounded-lg p-4 border border-white/20 group hover:bg-white/10 transition-all"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 mr-3">
                <div v-if="editingPlayer !== player.id" class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-white font-medium">{{ player.name }}</span>
                </div>
                <div v-else class="flex items-center gap-2">
                  <input
                    v-model="editPlayerName"
                    @keyup.enter="savePlayerEdit(player.id)"
                    @keyup.escape="cancelEdit"
                    type="text"
                    class="flex-1 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                    maxlength="20"
                    required
                  />
                </div>
              </div>
              
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  v-if="editingPlayer !== player.id"
                  @click="startEdit(player)"
                  class="text-blue-400 hover:text-blue-300 p-1"
                  title="Bearbeiten"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  v-if="editingPlayer !== player.id"
                  @click="removePlayer(player.id)"
                  class="text-red-400 hover:text-red-300 p-1"
                  title="Entfernen"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
                
                <!-- Edit Mode Buttons -->
                <div v-if="editingPlayer === player.id" class="flex items-center gap-1">
                  <button
                    @click="savePlayerEdit(player.id)"
                    class="text-green-400 hover:text-green-300 p-1"
                    title="Speichern"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>
                  <button
                    @click="cancelEdit"
                    class="text-gray-400 hover:text-gray-300 p-1"
                    title="Abbrechen"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <svg class="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-white mb-2">Noch keine Spieler</h3>
          <p class="text-purple-200 text-sm">Füge deinen ersten Mitspieler hinzu!</p>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="flex justify-between items-center">
        <button
          @click="logout"
          class="text-purple-200 hover:text-white flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Ausloggen
        </button>
        
        <button
          @click="continueToGames"
          :disabled="playerStore.players.length === 0"
          class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
        >
          <span>Weiter zu den Spielen</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Clear All Confirmation Modal -->
      <div v-if="showClearConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click="showClearConfirm = false">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 w-full max-w-md border border-white/20" @click.stop>
          <h3 class="text-lg font-bold text-white mb-4">Alle Spieler löschen?</h3>
          <p class="text-purple-200 mb-6">Diese Aktion kann nicht rückgängig gemacht werden.</p>
          <div class="flex gap-3">
            <button
              @click="clearAllPlayers"
              class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700"
            >
              Ja, alle löschen
            </button>
            <button
              @click="showClearConfirm = false"
              class="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { playerStore } from '../store/playerStore'

export default {
  name: 'PlayerSetup',
  setup() {
    const router = useRouter()
    const newPlayerName = ref('')
    const errorMessage = ref('')
    const isAddingPlayer = ref(false)
    const editingPlayer = ref(null)
    const editPlayerName = ref('')
    const showClearConfirm = ref(false)

    const logout = () => {
      localStorage.removeItem('authenticated')
      router.push('/')
    }


    const addPlayer = () => {
      if (!newPlayerName.value.trim()) return
      
      isAddingPlayer.value = true
      errorMessage.value = ''
      
      const success = playerStore.addPlayer(newPlayerName.value)
      
      if (success) {
        newPlayerName.value = ''
      } else {
        errorMessage.value = 'Dieser Name existiert bereits oder ist ungültig!'
      }
      
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
      
      isAddingPlayer.value = false
    }

    const removePlayer = (playerId) => {
      playerStore.removePlayer(playerId)
      if (editingPlayer.value === playerId) {
        editingPlayer.value = null
        editPlayerName.value = ''
      }
    }

    const startEdit = (player) => {
      editingPlayer.value = player.id
      editPlayerName.value = player.name
    }

    const savePlayerEdit = (playerId) => {
      if (!editPlayerName.value.trim()) {
        cancelEdit()
        return
      }
      
      const success = playerStore.updatePlayer(playerId, editPlayerName.value)
      
      if (success) {
        editingPlayer.value = null
        editPlayerName.value = ''
      } else {
        errorMessage.value = 'Dieser Name existiert bereits!'
        setTimeout(() => {
          errorMessage.value = ''
        }, 3000)
      }
    }

    const cancelEdit = () => {
      editingPlayer.value = null
      editPlayerName.value = ''
    }

    const clearAllPlayers = () => {
      playerStore.clearAllPlayers()
      showClearConfirm.value = false
    }

    const continueToGames = () => {
      if (playerStore.players.length === 0) {
        errorMessage.value = 'Bitte füge mindestens einen Spieler hinzu!'
        setTimeout(() => {
          errorMessage.value = ''
        }, 3000)
        return
      }
      
      router.push('/games')
    }

    onMounted(() => {
      playerStore.loadPlayers()
    })

    return {
      playerStore,
      newPlayerName,
      errorMessage,
      isAddingPlayer,
      editingPlayer,
      editPlayerName,
      showClearConfirm,
      addPlayer,
      removePlayer,
      startEdit,
      savePlayerEdit,
      cancelEdit,
      clearAllPlayers,
      continueToGames,
      logout
    }
  }
}
</script>