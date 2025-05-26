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
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            
            <h2 class="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">Top 10</h2>
            <p class="text-purple-200 text-sm mb-4">Das klassische Kartenspiel mit Story und Pantomime</p>
            
            <!-- Features -->
            <div class="space-y-2 text-left">
              <div class="flex items-center gap-2 text-purple-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Story/Frage & Pantomime</span>
              </div>
              <div class="flex items-center gap-2 text-purple-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Mehrere Decks kombinierbar</span>
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
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            
            <h2 class="text-2xl font-bold text-white mb-3 group-hover:text-orange-200 transition-colors">Wer wird hacke dicht?</h2>
            <p class="text-orange-200 text-sm mb-4">Trinkquiz im Stil von "Wer wird Millionär"</p>
            
            <!-- Features -->
            <div class="space-y-2 text-left">
              <div class="flex items-center gap-2 text-orange-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>15 Quiz-Fragen</span>
              </div>
              <div class="flex items-center gap-2 text-orange-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Personalisierte Ereignisse</span>
              </div>
              <div class="flex items-center gap-2 text-orange-200 text-sm">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Trink-Belohnungen</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Coming Soon Game -->
        <div class="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 opacity-60 cursor-not-allowed">
          <div class="text-center">
            <div class="bg-gray-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-400 mb-3">Spiel 3</h2>
            <p class="text-gray-500 text-sm mb-4">Kommt bald...</p>
            <div class="bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium">
              In Entwicklung
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
import { useRouter } from 'vue-router'

export default {
  name: 'GameSelection',
  setup() {
    const router = useRouter()

    const selectGame = (gameType) => {
      if (gameType === 'top10') {
        router.push('/top10/gallery')
      } else if (gameType === 'hacke-dicht') {
        router.push('/hacke-dicht/gallery')
      }
    }

    const logout = () => {
      localStorage.removeItem('authenticated')
      router.push('/')
    }

    return {
      selectGame,
      logout
    }
  }
}
</script>