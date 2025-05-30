<!-- src/views/JoinLobby.vue -->
<template>
  <div class="min-h-screen p-4 bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
    <div class="max-w-md mx-auto">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Lobby beitreten</h1>
        <p class="text-orange-200">Tritt dem Quiz bei und spiele mit!</p>
      </div>

      <!-- Join Form -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
        
        <!-- Lobby Code Input -->
        <div class="mb-6">
          <label class="block text-white font-medium mb-3">Lobby-Code</label>
          <input
            v-model="lobbyCode"
            @input="lobbyCode = $event.target.value.toUpperCase()"
            type="text"
            maxlength="6"
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white text-center text-2xl font-bold tracking-wider placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase"
            placeholder="ABC123"
            :disabled="isLoading"
          />
          <p class="text-orange-200 text-sm mt-2 text-center">
            6-stelliger Code vom Host-Bildschirm
          </p>
        </div>

        <!-- Player Name Input -->
        <div class="mb-6">
          <label class="block text-white font-medium mb-3">Dein Name</label>
          <input
            v-model="playerName"
            type="text"
            maxlength="20"
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Dein Spielername"
            :disabled="isLoading"
          />
        </div>

        <!-- Icon Selection -->
        <div class="mb-6">
          <label class="block text-white font-medium mb-3">Wähle dein Icon</label>
          <div class="grid grid-cols-5 gap-3">
            <button
              v-for="icon in availableIcons"
              :key="icon"
              @click="selectedIcon = icon"
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all border-2',
                selectedIcon === icon 
                  ? 'bg-orange-600/50 border-orange-400' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              ]"
              :disabled="isLoading"
            >
              {{ icon }}
            </button>
          </div>
        </div>

        <!-- Join Button -->
        <button
          @click="joinLobby"
          :disabled="!canJoin || isLoading"
          class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <svg v-if="isLoading" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isLoading ? 'Trete bei...' : 'Lobby beitreten' }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="bg-red-600/20 border border-red-400/30 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <p class="text-red-300 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Info Card -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <h3 class="text-white font-semibold mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          So funktioniert's
        </h3>
        <ul class="text-orange-200 text-sm space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-orange-400 font-bold">1.</span>
            <span>Lobby-Code vom Host eingeben</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-400 font-bold">2.</span>
            <span>Namen und Icon auswählen</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-400 font-bold">3.</span>
            <span>Auf Spielstart warten</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-400 font-bold">4.</span>
            <span>Bei Fragen auf A, B, C oder D tippen</span>
          </li>
        </ul>
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-6">
        <button
          @click="$router.push('/games')"
          class="text-orange-200 hover:text-white text-sm flex items-center gap-1 mx-auto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Zurück zur Spielauswahl
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '../composables/useLobby'

export default {
  name: 'JoinLobby',
  props: {
    code: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const router = useRouter()
    const { joinLobby: joinLobbyAction, error, isLoading, clearError } = useLobby()

    // Form Data
    const lobbyCode = ref(props.code || '')
    const playerName = ref('')
    const selectedIcon = ref('🎮')

    // Available Icons (10 predefined)
    const availableIcons = [
      '🎮', '🎯', '🎲', '🎪', '🎨', 
      '🎭', '🎸', '⚽', '🍕', '🚀'
    ]

    // Computed
    const canJoin = computed(() => {
      return lobbyCode.value.length === 6 && 
             playerName.value.trim().length >= 2 && 
             selectedIcon.value &&
             !isLoading.value
    })

    // Methods
    const joinLobby = async () => {
      if (!canJoin.value) return

      try {
        clearError()
        await joinLobbyAction(lobbyCode.value, playerName.value.trim(), selectedIcon.value)
        
        // Successful join - redirect to player lobby
        router.push(`/lobby/${lobbyCode.value}`)
        
      } catch (err) {
        // Error is already set in the composable
        console.error('Join failed:', err)
      }
    }

    // Handle enter key
    const handleKeypress = (event) => {
      if (event.key === 'Enter' && canJoin.value) {
        joinLobby()
      }
    }

    onMounted(() => {
      // Set random icon as default
      selectedIcon.value = availableIcons[Math.floor(Math.random() * availableIcons.length)]
      
      // Add keypress listener
      window.addEventListener('keypress', handleKeypress)
      
      // If code provided via URL, focus name input
      if (props.code) {
        setTimeout(() => {
          const nameInput = document.querySelector('input[placeholder="Dein Spielername"]')
          if (nameInput) nameInput.focus()
        }, 100)
      }
    })

    return {
      // Form data
      lobbyCode,
      playerName,
      selectedIcon,
      availableIcons,
      
      // State
      error,
      isLoading,
      
      // Computed
      canJoin,
      
      // Methods
      joinLobby
    }
  }
}
</script>