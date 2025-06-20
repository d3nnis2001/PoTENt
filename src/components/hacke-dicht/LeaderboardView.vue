<template>
  <div class="flex justify-center items-center min-h-[70vh]">
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-4xl w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <svg class="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <h2 class="text-4xl font-bold text-white mb-2">Leaderboard</h2>
        <p class="text-orange-200 text-lg">Final Results</p>
      </div>

      <!-- Top 3 Podium -->
      <div v-if="topThree.length > 0" class="flex justify-center items-end gap-4 mb-8">
        <!-- 2nd Place -->
        <div v-if="topThree[1]" class="text-center">
          <div class="bg-gradient-to-b from-gray-300 to-gray-500 rounded-lg p-4 mb-3 min-h-[120px] flex flex-col justify-center border-2 border-gray-400">
            <div class="text-4xl mb-2">🥈</div>
            <div class="text-white font-bold text-lg">{{ topThree[1].name }}</div>
            <div class="text-gray-200 text-sm">{{ topThree[1].correct }}/{{ topThree[1].total }} richtig</div>
            <div class="text-gray-200 text-xs">{{ Math.round((topThree[1].correct / topThree[1].total) * 100) }}%</div>
          </div>
          <div class="text-2xl font-bold text-gray-300">#2</div>
        </div>

        <!-- 1st Place -->
        <div v-if="topThree[0]" class="text-center">
          <div class="bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-lg p-6 mb-3 min-h-[140px] flex flex-col justify-center border-2 border-yellow-400 transform scale-110">
            <div class="text-5xl mb-3">👑</div>
            <div class="text-white font-bold text-xl">{{ topThree[0].name }}</div>
            <div class="text-yellow-100 text-base font-medium">{{ topThree[0].correct }}/{{ topThree[0].total }} richtig</div>
            <div class="text-yellow-100 text-sm">{{ Math.round((topThree[0].correct / topThree[0].total) * 100) }}%</div>
          </div>
          <div class="text-3xl font-bold text-yellow-400">#1</div>
        </div>

        <!-- 3rd Place -->
        <div v-if="topThree[2]" class="text-center">
          <div class="bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg p-4 mb-3 min-h-[120px] flex flex-col justify-center border-2 border-amber-700">
            <div class="text-4xl mb-2">🥉</div>
            <div class="text-white font-bold text-lg">{{ topThree[2].name }}</div>
            <div class="text-amber-200 text-sm">{{ topThree[2].correct }}/{{ topThree[2].total }} richtig</div>
            <div class="text-amber-200 text-xs">{{ Math.round((topThree[2].correct / topThree[2].total) * 100) }}%</div>
          </div>
          <div class="text-2xl font-bold text-amber-600">#3</div>
        </div>
      </div>

      <!-- Complete Rankings -->
      <div v-if="allPlayers.length > 0" class="bg-white/5 rounded-lg p-6 mb-6">
        <h3 class="text-xl font-bold text-white mb-4 text-center">Vollständige Rangliste</h3>
        <div class="space-y-2">
          <div 
            v-for="(player, index) in allPlayers" 
            :key="player.id"
            class="flex items-center justify-between p-3 rounded-lg transition-all"
            :class="[
              index < 3 ? 'bg-white/10 border border-white/20' : 'bg-white/5',
              index === 0 ? 'border-yellow-400/50' : 
              index === 1 ? 'border-gray-400/50' : 
              index === 2 ? 'border-amber-600/50' : ''
            ]"
          >
            <div class="flex items-center gap-4">
              <div class="text-2xl font-bold" :class="[
                index === 0 ? 'text-yellow-400' : 
                index === 1 ? 'text-gray-300' : 
                index === 2 ? 'text-amber-600' : 
                'text-white'
              ]">
                #{{ index + 1 }}
              </div>
              <div>
                <div class="text-white font-medium text-lg">{{ player.name }}</div>
                <div class="text-gray-300 text-sm">{{ player.correct }} richtige von {{ player.total }} Fragen</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold" :class="[
                player.percentage >= 80 ? 'text-green-400' :
                player.percentage >= 60 ? 'text-yellow-400' :
                player.percentage >= 40 ? 'text-orange-400' :
                'text-red-400'
              ]">
                {{ player.percentage }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Single Player Fallback -->
      <div v-else class="text-center mb-6">
        <div class="bg-white/5 rounded-lg p-6">
          <h3 class="text-2xl font-bold text-white mb-2">Quiz beendet!</h3>
          <p class="text-orange-200 text-lg">Du hast alle 15 Fragen geschafft! 🎉</p>
          <p class="text-orange-200 text-lg mt-2">Zeit für den finalen Drink! 🍻</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 justify-center">
        <button
          @click="$emit('restart')"
          class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all"
        >
          Nochmal spielen
        </button>
        <button
          @click="$emit('back-to-gallery')"
          class="bg-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/30 transition-all"
        >
          Zurück zur Galerie
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeaderboardView',
  props: {
    playerStats: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['restart', 'back-to-gallery'],
  computed: {
    allPlayers() {
      return Object.values(this.playerStats)
        .filter(player => player.total > 0)
        .map(player => ({
          ...player,
          percentage: Math.round((player.correct / player.total) * 100)
        }))
        .sort((a, b) => {
          // Sort by percentage first, then by correct answers
          if (b.percentage !== a.percentage) {
            return b.percentage - a.percentage
          }
          return b.correct - a.correct
        })
    },
    topThree() {
      return this.allPlayers.slice(0, 3)
    }
  }
}
</script>