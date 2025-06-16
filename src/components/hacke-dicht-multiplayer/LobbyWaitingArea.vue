<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-white mb-6 text-center">Multiplayer Lobby</h2>
    
    <!-- QR Code mit dynamischen Spielernamen -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8 relative min-h-[500px]">
      <div class="flex items-center justify-end mb-6">
        <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
          👥 {{ playerList.length }}
        </div>
      </div>
      
      <!-- Erweiterte Area für Namen und QR-Code -->
      <div class="relative w-full h-96">
        <!-- QR Code mittig -->
        <div class="absolute inset-0 flex items-center justify-center">
          <QRCodeSection
            :lobby-code="lobbyCode"
            :join-url="joinUrl"
            @copy-lobby-code="$emit('copy-lobby-code')"
            @copy-join-url="$emit('copy-join-url')"
          />
        </div>
        
        <!-- Dynamische Spielernamen in größerer Area -->
        <PlayerNameDisplay :players="playerList" />
      </div>
    </div>
    
    <!-- Start Button -->
    <div class="text-center">
      <button
        v-if="playerList.length >= 1"
        @click="$emit('start-game')"
        :disabled="isStartingGame"
        class="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all"
      >
        {{ isStartingGame ? 'Starte Spiel...' : 'Spiel starten' }}
      </button>
      <p v-else class="text-orange-200 text-sm mt-4">Mindestens 1 Spieler wird benötigt</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import PlayerGrid from './PlayerGrid.vue'
import QRCodeSection from './QRCodeSection.vue'
import PlayerNameDisplay from './PlayerNameDisplay.vue'

export default {
  name: 'LobbyWaitingArea',
  components: {
    PlayerGrid,
    QRCodeSection,
    PlayerNameDisplay
  },
  props: {
    lobbyCode: {
      type: String,
      required: true
    },
    joinUrl: {
      type: String,
      required: true
    },
    playerList: {
      type: Array,
      required: true
    },
    playerCount: {
      type: Number,
      required: true
    },
    isStartingGame: {
      type: Boolean,
      default: false
    }
  },
  emits: ['copy-lobby-code', 'copy-join-url', 'start-game'],
  setup(props) {
    const leftPlayers = computed(() => {
      const halfIndex = Math.ceil(props.playerList.length / 2)
      return props.playerList.slice(0, halfIndex)
    })
    
    const rightPlayers = computed(() => {
      const halfIndex = Math.ceil(props.playerList.length / 2)
      return props.playerList.slice(halfIndex)
    })
    
    return {
      leftPlayers,
      rightPlayers
    }
  }
}
</script>