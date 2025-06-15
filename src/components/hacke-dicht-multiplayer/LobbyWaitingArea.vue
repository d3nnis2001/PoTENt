<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-white mb-6 text-center">Multiplayer Lobby</h2>
    
    <!-- QR Code mit Spielern links und rechts -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
      <h3 class="text-lg font-bold text-white mb-6 text-center">📱 Handy beitreten</h3>
      
      <div class="flex items-center justify-center gap-8">
        <!-- Spieler links -->
        <PlayerGrid
          :players="leftPlayers"
          :player-count="playerCount"
          show-title="left"
        />
        
        <!-- QR Code mittig -->
        <QRCodeSection
          :lobby-code="lobbyCode"
          :join-url="joinUrl"
          @copy-lobby-code="$emit('copy-lobby-code')"
          @copy-join-url="$emit('copy-join-url')"
        />
        
        <!-- Spieler rechts -->
        <PlayerGrid
          :players="rightPlayers"
          :player-count="playerCount"
          show-title="right"
        />
      </div>
    </div>
    
    <!-- Start Button -->
    <div class="text-center">
      <button
        v-if="playerCount >= 1"
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

export default {
  name: 'LobbyWaitingArea',
  components: {
    PlayerGrid,
    QRCodeSection
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