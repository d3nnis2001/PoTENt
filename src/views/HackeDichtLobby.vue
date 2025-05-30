<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <button 
          @click="$router.push('/hacke-dicht/gallery')"
          class="text-orange-200 hover:text-white mb-4 inline-flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Zurück zur Galerie
        </button>
        <h1 class="text-4xl font-bold text-white mb-2">Lobby: {{ currentLobby?.code || 'Lädt...' }}</h1>
        <p class="text-orange-200">Warte auf Mitspieler...</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Join Information -->
        <div class="lg:col-span-1">
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 class="text-2xl font-bold text-white mb-4 text-center">Mitspieler einladen</h2>
            
            <!-- Lobby Code -->
            <div class="text-center mb-6">
              <p class="text-orange-200 mb-2">Lobby-Code:</p>
              <div class="bg-black/30 rounded-lg p-4 border-2 border-orange-400/50">
                <span class="text-4xl font-bold text-white tracking-wider">{{ currentLobby?.code || '------' }}</span>
              </div>
              <button 
                @click="copyLobbyCode"
                class="mt-2 text-sm text-orange-300 hover:text-white flex items-center gap-1 mx-auto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Code kopieren
              </button>
            </div>

            <!-- QR Code -->
            <div class="text-center">
              <p class="text-orange-200 mb-4">QR-Code scannen:</p>
              <div class="bg-white p-4 rounded-lg inline-block">
                <img 
                  :src="qrCodeUrl" 
                  alt="QR Code zum Beitreten"
                  class="w-48 h-48"
                />
              </div>
              <p class="text-sm text-orange-300 mt-2">
                Oder Link teilen: 
                <br />
                <span class="text-xs break-all">{{ joinUrl }}</span>
              </p>
            </div>
          </div>

          <!-- Start Game Button -->
          <button
            @click="startGame"
            :disabled="!canStartGame || isLoading"
            :class="[
              'w-full py-4 px-6 rounded-xl font-bold text-xl transition-all duration-200',
              canStartGame && !isLoading
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 shadow-2xl'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            ]"
          >
            <svg v-if="isLoading" class="animate-spin w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isLoading ? 'Starte Spiel...' : 
               canStartGame ? `Spiel starten (${onlinePlayerCount} Spieler)` : 
               'Mindestens 2 Spieler benötigt' }}
          </button>
        </div>

        <!-- Players List -->
        <div class="lg:col-span-2">
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 class="text-2xl font-bold text-white mb-6">
              Mitspieler ({{ onlinePlayerCount }}/{{ maxPlayers }})
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Existing Players -->
              <div 
                v-for="player in playerList"
                :key="player.id"
                :class="[
                  'bg-white/5 rounded-lg p-4 border transition-all group',
                  player.isOnline 
                    ? 'border-green-400/30 shadow-lg shadow-green-400/10' 
                    : 'border-gray-400/30 opacity-60'
                ]"
              >
                <div class="flex items-center gap-3">
                  <!-- Player Icon -->
                  <div :class="[
                    'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                    player.isOnline ? 'bg-green-600/30' : 'bg-gray-600/30'
                  ]">
                    {{ player.icon }}
                  </div>
                  
                  <!-- Player Info -->
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h3 class="text-white font-semibold">{{ player.name }}</h3>
                      <span v-if="player.isHost" class="bg-yellow-600/30 text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
                        Host
                      </span>
                    </div>
                    <div class="flex items-center gap-1 mt-1">
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

                  <!-- Actions -->
                  <button 
                    v-if="!player.isHost && isHost"
                    @click="kickPlayer(player.id)"
                    class="text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Empty Slots -->
              <div 
                v-for="index in emptySlots"
                :key="`empty-${index}`"
                class="bg-white/5 rounded-lg p-4 border border-dashed border-white/20 flex items-center justify-center"
              >
                <div class="text-center text-white/50">
                  <div class="w-12 h-12 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center mx-auto mb-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </div>
                  <p class="text-sm">Wartet auf Spieler...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Settings Preview -->
      <div class="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-4">Spieleinstellungen</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="bg-orange-600/30 rounded-lg p-4">
              <svg class="w-8 h-8 text-orange-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-white font-semibold">15 Fragen</p>
              <p class="text-orange-200 text-sm">Multiple Choice</p>
            </div>
          </div>
          <div class="text-center">
            <div class="bg-red-600/30 rounded-lg p-4">
              <svg class="w-8 h-8 text-red-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-white font-semibold">{{ questionTimer }} Sekunden</p>
              <p class="text-red-200 text-sm">pro Frage</p>
            </div>
          </div>
          <div class="text-center">
            <div class="bg-purple-600/30 rounded-lg p-4">
              <svg class="w-8 h-8 text-purple-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <p class="text-white font-semibold">3 Joker</p>
              <p class="text-purple-200 text-sm">verfügbar</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mt-4 p-4 bg-red-600/20 border border-red-400/30 rounded-lg">
        <p class="text-red-300 text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'
import { generateJoinUrl } from '../utils/lobbyUtils'
import { hackeDichtStore } from '../store/hackeDichtStore'

export default {
  name: 'HackeDichtLobby',
  props: {
    gameId: {
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
      connectionStatus,
      error,
      isLoading,
      createLobby,
      startGame: startGameAction,
      leaveLobby,
      clearError
    } = useLobby()

    const game = ref(null)
    const maxPlayers = ref(8)
    const questionTimer = ref(30)

    // Computed Properties
    const playerList = computed(() => {
      return Object.values(players.value || {}).sort((a, b) => {
        // Host zuerst, dann alphabetisch
        if (a.isHost && !b.isHost) return -1
        if (!a.isHost && b.isHost) return 1
        return a.name.localeCompare(b.name)
      })
    })

    const onlinePlayerCount = computed(() => {
      return playerList.value.filter(p => p.isOnline).length
    })

    const canStartGame = computed(() => {
      return isHost.value && onlinePlayerCount.value >= 2 && !isLoading.value
    })

    const emptySlots = computed(() => {
      const remaining = Math.max(0, Math.min(4, maxPlayers.value - playerList.value.length))
      return remaining
    })

    const joinUrl = computed(() => {
      return currentLobby.value ? generateJoinUrl(currentLobby.value.code) : ''
    })

    const qrCodeUrl = computed(() => {
      if (!currentLobby.value) return ''
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl.value)}`
    })

    // Methods
    const initializeLobby = async () => {
      try {
        clearError()
        
        // Game laden
        const gameData = hackeDichtStore.getGame(parseInt(props.gameId))
        if (!gameData) {
          throw new Error('Spiel nicht gefunden')
        }
        game.value = gameData

        // Lobby erstellen
        const hostName = 'Host' // TODO: Echten Namen vom User holen
        await createLobby(props.gameId, hostName)
        
      } catch (err) {
        console.error('Fehler beim Initialisieren der Lobby:', err)
      }
    }

    const copyLobbyCode = async () => {
      if (!currentLobby.value) return
      
      try {
        await navigator.clipboard.writeText(currentLobby.value.code)
        // TODO: Toast notification hinzufügen
        console.log('Lobby-Code kopiert!')
      } catch (err) {
        console.error('Fehler beim Kopieren:', err)
      }
    }

    const startGame = async () => {
      try {
        await startGameAction()
        // Zur Multiplayer-Spiel-View weiterleiten
        router.push(`/hacke-dicht/play-multiplayer/${currentLobby.value.code}`)
      } catch (err) {
        console.error('Fehler beim Starten:', err)
      }
    }

    const kickPlayer = async (playerId) => {
      if (!isHost.value) return
      
      if (confirm('Spieler wirklich rauswerfen?')) {
        // TODO: Kick-Funktionalität implementieren
        console.log('Kick player:', playerId)
      }
    }

    const handleLeaveLobby = async () => {
      if (confirm('Lobby wirklich verlassen? Das Spiel wird für alle beendet.')) {
        await leaveLobby()
        router.push('/hacke-dicht/gallery')
      }
    }

    // Lifecycle
    onMounted(async () => {
      await hackeDichtStore.loadGames()
      await initializeLobby()
    })

    onUnmounted(async () => {
      // Cleanup wenn Component verlassen wird
      if (currentLobby.value) {
        await leaveLobby()
      }
    })

    // Browser-Back-Button handling
    window.addEventListener('beforeunload', () => {
      if (currentLobby.value) {
        leaveLobby()
      }
    })

    return {
      // State
      currentLobby,
      isHost,
      currentPlayer,
      game,
      error,
      isLoading,
      connectionStatus,
      maxPlayers,
      questionTimer,
      
      // Computed
      playerList,
      onlinePlayerCount,
      canStartGame,
      emptySlots,
      joinUrl,
      qrCodeUrl,
      
      // Methods
      copyLobbyCode,
      startGame,
      kickPlayer,
      handleLeaveLobby
    }
  }
}
</script>