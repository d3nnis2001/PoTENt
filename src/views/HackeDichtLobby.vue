<!-- src/views/HackeDichtLobby.vue - Debug Version -->
<template>
  <div class="min-h-screen p-4 bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
    <div class="max-w-4xl mx-auto">
      
      <!-- Debug Info -->
      <div class="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4 text-white text-xs">
        <h3 class="font-bold mb-2">Debug Info:</h3>
        <div>Game ID: {{ gameId }}</div>
        <div>Game Loaded: {{ !!game }}</div>
        <div>Current Lobby: {{ !!currentLobby }}</div>
        <div>Lobby Code: {{ currentLobby?.code || 'None' }}</div>
        <div>Is Host: {{ isHost }}</div>
        <div>Connection Status: {{ connectionStatus }}</div>
        <div>Can Start Game: {{ canStartGame }}</div>
        <div>Player Count: {{ onlinePlayerCount }}</div>
        <div>Error: {{ error || 'None' }}</div>
      </div>
      
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
        <h1 class="text-3xl font-bold text-white mb-2">{{ game?.name || 'Quiz Lobby' }}</h1>
        <p class="text-orange-200">Host-Modus - Erstelle eine Lobby für Mitspieler</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="text-white mt-2">Lade Quiz...</p>
      </div>

      <!-- Game Not Found -->
      <div v-else-if="!game" class="text-center py-12">
        <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <h2 class="text-xl font-semibold text-white mb-2">Quiz nicht gefunden</h2>
        <p class="text-orange-200">Das angeforderte Quiz existiert nicht oder wurde gelöscht.</p>
      </div>

      <!-- Host Setup Form -->
      <div v-else-if="!currentLobby" class="max-w-md mx-auto">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h2 class="text-xl font-bold text-white mb-4">Lobby erstellen</h2>
          
          <form @submit.prevent="createLobby" class="space-y-4">
            <div>
              <label class="block text-white font-medium mb-2">Dein Name (Host)</label>
              <input
                v-model="hostName"
                type="text"
                maxlength="20"
                class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Dein Spielername"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="!hostName.trim() || isCreatingLobby"
              class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <svg v-if="isCreatingLobby" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              {{ isCreatingLobby ? 'Erstelle Lobby...' : 'Lobby erstellen' }}
            </button>
          </form>
        </div>

        <!-- Game Info -->
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

      <!-- Host Lobby Dashboard -->
      <div v-else class="space-y-6">
        
        <!-- Lobby Code Display -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
          <h2 class="text-2xl font-bold text-white mb-4">Lobby-Code</h2>
          <div class="bg-white/20 rounded-lg p-4 mb-4">
            <div class="text-4xl font-bold text-white tracking-wider mb-2">{{ currentLobby.code }}</div>
            <p class="text-orange-200 text-sm">Spieler können mit diesem Code beitreten</p>
          </div>
          
          <!-- QR Code oder Join Link -->
          <div class="flex gap-3 justify-center">
            <button
              @click="copyLobbyCode"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Code kopieren
            </button>
            
            <button
              @click="copyJoinUrl"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
              Link kopieren
            </button>
          </div>
        </div>

        <!-- Game Status & Controls -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="text-xl font-bold text-white">Spiel-Status</h3>
              <p class="text-orange-200 text-sm">{{ gameStatusText }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-white">{{ onlinePlayerCount }}/8</div>
              <div class="text-orange-200 text-sm">Spieler</div>
            </div>
          </div>

          <!-- Start Game Button -->
          <button
            v-if="canStartGame"
            @click="startGame"
            :disabled="isStartingGame"
            class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <svg v-if="isStartingGame" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isStartingGame ? 'Starte Spiel...' : 'Spiel starten' }}
          </button>
          
          <div v-else-if="onlinePlayerCount < 2" class="text-center py-4">
            <p class="text-orange-200">Mindestens 2 Spieler werden benötigt</p>
          </div>
        </div>

        <!-- Players List -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 class="text-xl font-bold text-white mb-4">Mitspieler ({{ onlinePlayerCount }})</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="player in playerList"
              :key="player.id"
              class="bg-white/5 rounded-lg p-4 flex items-center gap-3"
            >
              <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">
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

          <!-- Empty Players State -->
          <div v-if="onlinePlayerCount <= 1" class="text-center py-6">
            <div class="text-white/50 text-sm mb-2">
              Warte auf Mitspieler...
            </div>
            <div class="text-orange-200 text-xs">
              Teile den Lobby-Code oder Link mit deinen Freunden
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <h4 class="text-lg font-bold text-white mb-3">So funktioniert's</h4>
          <ol class="text-orange-200 text-sm space-y-2">
            <li class="flex items-start gap-2">
              <span class="text-orange-400 font-bold">1.</span>
              <span>Teile den Lobby-Code mit deinen Freunden</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-orange-400 font-bold">2.</span>
              <span>Mitspieler gehen auf <code class="bg-white/20 px-1 rounded">{{ window.location.origin }}/#/join</code></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-orange-400 font-bold">3.</span>
              <span>Wenn alle da sind, starte das Spiel</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-orange-400 font-bold">4.</span>
              <span>Du moderierst, Mitspieler antworten auf ihren Handys</span>
            </li>
          </ol>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mt-6 p-4 bg-red-600/20 border border-red-400/30 rounded-lg">
        <p class="text-red-300 text-sm text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'
import { hackeDichtStore } from '../store/hackeDichtStore'
import { playerStore } from '../store/playerStore'
import { globalToast } from '../composables/useToast'
import { generateJoinUrl } from '../utils/lobbyUtils'

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
    const { success, error: showError } = globalToast
    
    const {
      currentLobby, isHost, currentPlayer, players, gameState,
      createLobby: createLobbyAction, startGame: startGameAction,
      connectionStatus, error, leaveLobby
    } = useLobby()

    // Local state
    const game = ref(null)
    const isLoading = ref(true)
    const hostName = ref('')
    const isCreatingLobby = ref(false)
    const isStartingGame = ref(false)

    // Computed
    const playerList = computed(() => {
      return Object.values(players.value || {})
        .filter(p => p.isOnline)
        .sort((a, b) => {
          // Host first, then alphabetically
          if (a.isHost && !b.isHost) return -1
          if (!a.isHost && b.isHost) return 1
          return a.name.localeCompare(b.name)
        })
    })

    const onlinePlayerCount = computed(() => playerList.value.length)

    const canStartGame = computed(() => {
      console.log('CanStartGame check:', {
        isHost: isHost.value,
        playerCount: onlinePlayerCount.value,
        lobbyStatus: currentLobby.value?.status,
        result: isHost.value && onlinePlayerCount.value >= 2 && currentLobby.value?.status === 'waiting'
      })
      
      return isHost.value && 
             onlinePlayerCount.value >= 2 && 
             currentLobby.value?.status === 'waiting'
    })

    const gameStatusText = computed(() => {
      if (!currentLobby.value) return 'Lobby wird erstellt...'
      
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

    // Methods
    const loadGame = async () => {
      console.log('Loading game with ID:', props.gameId)
      isLoading.value = true
      try {
        await hackeDichtStore.loadGames()
        await playerStore.loadPlayers()
        
        const gameData = hackeDichtStore.getGame(parseInt(props.gameId))
        console.log('Game data loaded:', gameData)
        
        if (!gameData) {
          showError('Quiz nicht gefunden')
          router.push('/hacke-dicht/gallery')
          return
        }
        
        game.value = gameData
        
        // Set default host name from players if available
        if (playerStore.players.length > 0) {
          hostName.value = playerStore.players[0].name
        }
        
      } catch (error) {
        console.error('Error loading game:', error)
        showError('Fehler beim Laden des Quiz')
      } finally {
        isLoading.value = false
      }
    }

    const createLobby = async () => {
      if (!hostName.value.trim() || !game.value) {
        console.error('Cannot create lobby - missing data:', {
          hostName: hostName.value,
          game: !!game.value
        })
        return
      }
      
      console.log('Creating lobby...', {
        gameId: props.gameId,
        hostName: hostName.value.trim()
      })
      
      isCreatingLobby.value = true
      try {
        const lobbyCode = await createLobbyAction(props.gameId, hostName.value.trim())
        console.log('Lobby created with code:', lobbyCode)
        success(`Lobby ${lobbyCode} erstellt!`)
      } catch (error) {
        console.error('Failed to create lobby:', error)
        showError('Fehler beim Erstellen der Lobby: ' + error.message)
      } finally {
        isCreatingLobby.value = false
      }
    }

    const startGame = async () => {
      console.log('Attempting to start game...', {
        canStart: canStartGame.value,
        isHost: isHost.value,
        lobby: !!currentLobby.value,
        lobbyCode: currentLobby.value?.code
      })
      
      if (!canStartGame.value) {
        console.error('Cannot start game - conditions not met')
        showError('Spiel kann nicht gestartet werden')
        return
      }
      
      isStartingGame.value = true
      try {
        await startGameAction()
        success('Spiel gestartet!')
        console.log('Game started, redirecting to multiplayer...')
        // Auto-redirect to multiplayer game view
        router.push(`/hacke-dicht/play-multiplayer/${currentLobby.value.code}`)
      } catch (error) {
        console.error('Failed to start game:', error)
        showError('Fehler beim Starten des Spiels: ' + error.message)
      } finally {
        isStartingGame.value = false
      }
    }

    const copyLobbyCode = async () => {
      if (!currentLobby.value) return
      
      try {
        await navigator.clipboard.writeText(currentLobby.value.code)
        success('Lobby-Code kopiert!')
      } catch (error) {
        console.error('Failed to copy:', error)
        // Fallback für ältere Browser
        const textArea = document.createElement('textarea')
        textArea.value = currentLobby.value.code
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        success('Lobby-Code kopiert!')
      }
    }

    const copyJoinUrl = async () => {
      if (!currentLobby.value) return
      
      try {
        const joinUrl = generateJoinUrl(currentLobby.value.code)
        await navigator.clipboard.writeText(joinUrl)
        success('Join-Link kopiert!')
      } catch (error) {
        console.error('Failed to copy:', error)
        showError('Fehler beim Kopieren')
      }
    }

    // Watchers
    watch(() => currentLobby.value?.status, (newStatus, oldStatus) => {
      console.log('Lobby status changed:', oldStatus, '->', newStatus)
      if (newStatus === 'playing') {
        console.log('Status is playing, redirecting...')
        router.push(`/hacke-dicht/play-multiplayer/${currentLobby.value.code}`)
      }
    })

    watch(() => gameState.value?.phase, (newPhase, oldPhase) => {
      console.log('Game phase changed:', oldPhase, '->', newPhase)
      if (newPhase === 'voting') {
        console.log('Phase is voting, redirecting...')
        router.push(`/hacke-dicht/play-multiplayer/${currentLobby.value.code}`)
      }
    })

    // Debug watchers
    watch(currentLobby, (newLobby) => {
      console.log('Current lobby changed:', newLobby)
    })

    watch(connectionStatus, (newStatus) => {
      console.log('Connection status changed:', newStatus)
    })

    // Lifecycle
    onMounted(async () => {
      console.log('HackeDichtLobby mounted with gameId:', props.gameId)
      await loadGame()
    })

    onUnmounted(async () => {
      console.log('HackeDichtLobby unmounting...')
      // Clean up lobby if we're the host
      if (isHost.value && currentLobby.value) {
        await leaveLobby()
      }
    })

    // Handle browser back/refresh
    const handleBeforeUnload = (event) => {
      if (currentLobby.value && isHost.value) {
        event.preventDefault()
        event.returnValue = 'Das Verlassen der Seite beendet die Lobby für alle Spieler.'
      }
    }

    onMounted(() => {
      window.addEventListener('beforeunload', handleBeforeUnload)
    })

    onUnmounted(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    })

    return {
      // Props
      gameId: props.gameId,
      
      // State
      game, isLoading, hostName, isCreatingLobby, isStartingGame,
      currentLobby, isHost, currentPlayer, players, gameState,
      connectionStatus, error,
      
      // Computed
      playerList, onlinePlayerCount, canStartGame, gameStatusText,
      
      // Methods
      createLobby, startGame, copyLobbyCode, copyJoinUrl,
      
      // Utils
      window
    }
  }
}
</script>