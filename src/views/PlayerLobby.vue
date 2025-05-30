<template>
  <div class="min-h-screen p-4 bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
    <div class="max-w-md mx-auto">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-white mb-1">Lobby: {{ currentLobby?.code }}</h1>
        <p class="text-orange-200 text-sm">Warte auf Spielstart...</p>
      </div>

      <!-- Player Info Card -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
        <div class="text-center">
          <div class="w-20 h-20 rounded-full bg-green-600/30 flex items-center justify-center text-4xl mx-auto mb-3">
            {{ currentPlayer?.icon || '🎮' }}
          </div>
          <h2 class="text-xl font-bold text-white mb-1">{{ currentPlayer?.name || 'Spieler' }}</h2>
          <div class="flex items-center justify-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-400"></div>
            <span class="text-green-300 text-sm">Bereit zum Spielen</span>
          </div>
        </div>
      </div>

      <!-- Game Status -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Status</p>
            <p class="text-orange-200 text-sm">{{ gameStatusText }}</p>
          </div>
          <div class="text-right">
            <p class="text-white font-medium">{{ onlinePlayerCount }}/8</p>
            <p class="text-orange-200 text-sm">Spieler</p>
          </div>
        </div>
        
        <!-- Loading indicator wenn Spiel startet -->
        <div v-if="currentLobby?.status === 'starting'" class="mt-4 flex items-center gap-2">
          <div class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
          <span class="text-white text-sm">Spiel wird gestartet...</span>
        </div>
      </div>

      <!-- Other Players List -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-6">
        <h3 class="text-lg font-bold text-white mb-4">Andere Mitspieler</h3>
        
        <div class="space-y-3">
          <div 
            v-for="player in otherPlayers"
            :key="player.id"
            class="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
          >
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
              {{ player.icon }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-white font-medium">{{ player.name }}</span>
                <span v-if="player.isHost" class="bg-yellow-600/30 text-yellow-200 px-2 py-1 rounded-full text-xs">
                  👑 Host
                </span>
              </div>
              <div class="flex items-center gap-1">
                <div :class="[
                  'w-2 h-2 rounded-full',
                  player.isOnline ? 'bg-green-400' : 'bg-gray-400'
                ]"></div>
                <span :class="[
                  'text-xs',
                  player.isOnline ? 'text-green-300' : 'text-gray-400'
                ]">
                  {{ player.isOnline ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="otherPlayers.length === 0" class="text-center py-6">
          <div class="text-white/50 text-sm">
            Du bist der einzige Spieler in der Lobby
          </div>
        </div>
      </div>

      <!-- Game Info -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-6">
        <h3 class="text-lg font-bold text-white mb-3">Spielinfo</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl text-orange-300 mb-1">15</div>
            <div class="text-xs text-orange-200">Fragen</div>
          </div>
          <div>
            <div class="text-2xl text-red-300 mb-1">{{ questionTimer }}</div>
            <div class="text-xs text-red-200">Sekunden</div>
          </div>
          <div>
            <div class="text-2xl text-purple-300 mb-1">3</div>
            <div class="text-xs text-purple-200">Joker</div>
          </div>
        </div>
      </div>

      <!-- Leave Button -->
      <button
        @click="handleLeaveLobby"
        class="w-full bg-red-600/20 border border-red-400/30 text-red-300 py-3 px-4 rounded-lg font-medium hover:bg-red-600/30 transition-all mb-4"
      >
        Lobby verlassen
      </button>

      <!-- Connection Status -->
      <div class="text-center">
        <div class="flex items-center justify-center gap-2">
          <div :class="[
            'w-2 h-2 rounded-full',
            connectionStatus === 'connected' ? 'bg-green-400' : 
            connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
          ]"></div>
          <span class="text-white/70 text-xs">
            {{ connectionStatusText }}
          </span>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mt-4 p-3 bg-red-600/20 border border-red-400/30 rounded-lg">
        <p class="text-red-300 text-sm text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'

export default {
  name: 'PlayerLobby',
  props: {
    lobbyCode: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const { 
      currentLobby,
      isHost,
      currentPlayer,
      players,
      gameState,
      connectionStatus,
      error,
      leaveLobby,
      clearError
    } = useLobby()

    const questionTimer = ref(30)

    // Computed Properties
    const otherPlayers = computed(() => {
      if (!players.value || !currentPlayer.value) return []
      
      return Object.values(players.value)
        .filter(player => player.id !== currentPlayer.value.id)
        .sort((a, b) => {
          // Host zuerst, dann alphabetisch
          if (a.isHost && !b.isHost) return -1
          if (!a.isHost && b.isHost) return 1
          return a.name.localeCompare(b.name)
        })
    })

    const onlinePlayerCount = computed(() => {
      return Object.values(players.value || {}).filter(p => p.isOnline).length
    })

    const gameStatusText = computed(() => {
      if (!currentLobby.value) return 'Verbinde...'
      
      switch (currentLobby.value.status) {
        case 'waiting':
          return onlinePlayerCount.value < 2 ? 'Warte auf mehr Spieler' : 'Bereit zum Start'
        case 'starting':
          return 'Spiel startet...'
        case 'playing':
          return 'Spiel läuft'
        case 'finished':
          return 'Spiel beendet'
        default:
          return 'Unbekannter Status'
      }
    })

    const connectionStatusText = computed(() => {
      switch (connectionStatus.value) {
        case 'connected':
          return 'Verbunden'
        case 'connecting':
          return 'Verbinde...'
        case 'disconnected':
          return 'Verbindung verloren'
        default:
          return 'Unbekannt'
      }
    })

    // Methods
    const handleLeaveLobby = async () => {
      if (confirm('Lobby wirklich verlassen?')) {
        await leaveLobby()
        router.push('/games')
      }
    }

    const handleGameStart = () => {
      // Automatisch zur Multiplayer-Game-View weiterleiten
      router.push(`/hacke-dicht/play-multiplayer/${props.lobbyCode}`)
    }

    // Watchers
    watch(() => currentLobby.value?.status, (newStatus) => {
      if (newStatus === 'playing') {
        handleGameStart()
      }
    })

    watch(() => gameState.value?.phase, (newPhase) => {
      if (newPhase === 'question') {
        handleGameStart()
      }
    })

    // Lifecycle
    onMounted(() => {
      clearError()
      
      // Check if we're already in a lobby
      if (!currentLobby.value || currentLobby.value.code !== props.lobbyCode) {
        // Redirect back to join if not in correct lobby
        router.push(`/join/${props.lobbyCode}`)
      }
    })

    onUnmounted(async () => {
      // Don't automatically leave on unmount - player might just be navigating
    })

    // Handle browser back/refresh
    window.addEventListener('beforeunload', (event) => {
      if (currentLobby.value) {
        event.preventDefault()
        event.returnValue = 'Das Verlassen der Seite beendet deine Teilnahme am Spiel.'
      }
    })

    return {
      // State
      currentLobby,
      isHost,
      currentPlayer,
      players,
      gameState,
      connectionStatus,
      error,
      questionTimer,
      
      // Computed
      otherPlayers,
      onlinePlayerCount,
      gameStatusText,
      connectionStatusText,
      
      // Methods
      handleLeaveLobby
    }
  }
}
</script>