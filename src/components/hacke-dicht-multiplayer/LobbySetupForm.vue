<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
      <h2 class="text-xl font-bold text-white mb-4">Multiplayer-Lobby erstellen</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-white font-medium mb-2">Dein Name (Host)</label>
          <input
            v-model="hostName"
            type="text"
            maxlength="20"
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Dein Moderator-Name"
            required
          />
        </div>

        <button
          @click="$emit('create-lobby', hostName)"
          :disabled="!hostName.trim() || isCreatingLobby || !gameLoaded"
          class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <svg v-if="isCreatingLobby" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isCreatingLobby ? 'Erstelle Lobby...' : !gameLoaded ? 'Lade Spiel...' : 'Multiplayer starten' }}
        </button>
      </div>
    </div>

    <!-- Game Info Card -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <h3 class="text-lg font-bold text-white mb-3">Quiz-Info</h3>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl text-orange-300 mb-1">15</div>
          <div class="text-xs text-orange-200">Fragen</div>
        </div>
        <div>
          <div class="text-2xl text-red-300 mb-1">30</div>
          <div class="text-xs text-red-200">Sekunden</div>
        </div>
        <div>
          <div class="text-2xl text-purple-300 mb-1">3</div>
          <div class="text-xs text-purple-200">Joker</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'LobbySetupForm',
  props: {
    isCreatingLobby: {
      type: Boolean,
      default: false
    },
    gameLoaded: {
      type: Boolean,
      default: true
    }
  },
  emits: ['create-lobby'],
  setup() {
    const hostName = ref('Moderator')
    
    return {
      hostName
    }
  }
}
</script>