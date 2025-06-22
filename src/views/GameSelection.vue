<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-white mb-4">Spiele auswählen</h1>
        <p class="text-purple-200 text-lg">Wähle ein Spiel aus, das du spielen möchtest</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Top 10 Card Game -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer transform hover:scale-105"
             @click="selectGame('top10')">
          <div class="text-center">
            <!-- Icon -->
            <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:from-purple-700 group-hover:to-blue-700 transition-all">
              <img :src="potentLogo" alt="poTENt Logo" class="w-full h-full" />
            </div>
            
            <h2 class="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">poTENt</h2>
            <p class="text-purple-200 text-sm mb-4">Wie potent seid ihr? Zeigt was ihr drauf habt</p>
            
            <!-- Features -->
            <div class="space-y-2 text-left">
              <div class="flex items-center gap-2 text-purple-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Top 10 abklatsche</span>
              </div>
              <div class="flex items-center gap-2 text-purple-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Custom Karten und Kartendecks</span>
              </div>
              <div class="flex items-center gap-2 text-purple-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Cloud-Synchronisation</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Wer wird hacke dicht? -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer transform hover:scale-105"
             @click="selectGame('hacke-dicht')">
          <div class="text-center">
            <!-- Icon -->
            <div class="bg-gradient-to-r from-orange-600 to-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:from-orange-700 group-hover:to-red-700 transition-all">
                <img :src="hackeDichtLogo" alt="Wer wird hacke dicht" class="w-full h-full" />
            </div>
            
            <h2 class="text-2xl font-bold text-white mb-3 group-hover:text-orange-200 transition-colors">Wer wird hacke dicht?</h2>
            <p class="text-orange-200 text-sm mb-4">Kein Millionär, aber am Ende hoffentlich stationär</p>
            
            <!-- Features -->
            <div class="space-y-2 text-left">
              <div class="flex items-center gap-2 text-orange-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>15 Fragen - 3 Getränke</span>
              </div>
              <div class="flex items-center gap-2 text-orange-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Ereignisse</span>
              </div>
              <div class="flex items-center gap-2 text-orange-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Wer wird Millionär vibes</span>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Takes Over -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer transform hover:scale-105"
             @click="selectGame('ai-takes-over')">
          <div class="text-center">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">AI Takes Over</h2>
            <p class="text-blue-200 text-sm mb-4">Die KI übernimmt - wer überlebt das Quiz?</p>
            
            <!-- Features -->
            <div class="space-y-2 text-left">
              <div class="flex items-center gap-2 text-blue-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>15 KI-Fragen</span>
              </div>
              <div class="flex items-center gap-2 text-blue-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>KI-Charaktere</span>
              </div>
              <div class="flex items-center gap-2 text-blue-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Multiplayer-Modus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="text-center mt-12">
        <p class="text-purple-200/60 text-sm">
          Weitere Spiele werden regelmäßig hinzugefügt
        </p>
        <button
          @click="logout"
          class="mt-6 text-purple-200 hover:text-white text-sm flex items-center gap-2 mx-auto transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Ausloggen
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { playerStore } from '../store/playerStore'
import hackeDichtLogo from '../assets/HackeDichtLogo.png'
import potentLogo from "../assets/PoTENtLogo.png"

export default {
  name: 'GameSelection',
  setup() {
    const router = useRouter()

    const selectGame = (gameType) => {
      if (gameType === 'top10') {
        router.push('/top10/gallery')
      } else if (gameType === 'hacke-dicht') {
        router.push('/hacke-dicht/gallery')
      } else if (gameType === 'ai-takes-over') {
        router.push('/ai-takes-over/gallery')
      } else if (gameType === 'join') {
        router.push('/join')
      }
    }

    const logout = () => {
      localStorage.removeItem('authenticated')
      router.push('/')
    }

    onMounted(() => {
      playerStore.loadPlayers()
    })

    return {
      playerStore,
      selectGame,
      logout,
      hackeDichtLogo, 
      potentLogo
    }
  }
}
</script>