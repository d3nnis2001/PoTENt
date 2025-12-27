<template>
  <div class="flex flex-col justify-start items-center pt-8" style="min-height: calc(100vh - 80px);">
    <!-- Main Content Container with better height distribution -->
    <div class="w-full max-w-7xl px-6 space-y-8">
      
      <!-- Top Section: Title -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-white mb-2">
          {{ currentQuestionIndex === 0 ? 'Bereit für die Challenge?' : `Frage ${currentQuestionIndex} geschafft!` }}
        </h1>
        <p class="text-lg text-gray-300">
          {{ currentQuestionIndex === 0 ? 'Deine Belohnungen:' : 'Dein Fortschritt:' }}
        </p>
      </div>

      <!-- Middle Section: Info Cards -->
      <div class="grid grid-cols-3 gap-6">
        <!-- Questions Progress Card -->
        <div class="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex flex-col">
          <h3 class="text-sm font-semibold text-gray-300 mb-4">
            Fortschritt
          </h3>
          <div class="flex-grow flex flex-col justify-center space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-400 text-sm">Fragen:</span>
              <span class="text-3xl font-bold text-white">{{ currentQuestionIndex }}/15</span>
            </div>
            <div class="w-full bg-black/40 rounded-full h-3">
              <div 
                class="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                :style="{ width: `${(currentQuestionIndex / 15) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Current Rewards Card -->
        <div class="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex flex-col">
          <h3 class="text-sm font-semibold text-gray-300 mb-4">
            Belohnungen
          </h3>
          <div class="flex-grow space-y-3">
            <div v-for="(reward, index) in game.rewards" :key="index" 
                 class="flex items-center gap-3 p-3 rounded-lg transition-all"
                 :class="getRewardClass(index)">
              <!-- Reward Icon -->
              <div class="w-10 h-10 flex-shrink-0">
                <img 
                  v-if="reward?.image" 
                  :src="reward.image" 
                  :alt="reward.name" 
                  class="w-full h-full object-cover rounded-lg"
                >
                <div v-else class="w-full h-full bg-black/40 rounded-lg flex items-center justify-center">
                  <span class="text-lg">{{ getRewardEmoji(index) }}</span>
                </div>
              </div>
              <div class="flex-1">
                <div class="text-xs text-gray-400">{{ getQuestionRange(index) }}</div>
                <div class="text-sm text-white font-medium">{{ reward.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Info Card -->
        <div class="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex flex-col">
          <h3 class="text-sm font-semibold text-gray-300 mb-4">
            Spielinfo
          </h3>
          <div class="flex-grow flex flex-col justify-around text-sm">
            <div class="flex justify-between items-center p-2 rounded hover:bg-white/5">
              <span class="text-gray-400">Verbleibend:</span>
              <span class="text-white font-bold text-lg">{{ 15 - currentQuestionIndex }}</span>
            </div>
            <div class="flex justify-between items-center p-2 rounded hover:bg-white/5">
              <span class="text-gray-400">Joker:</span>
              <div class="flex gap-1">
                <div class="w-8 h-8 bg-blue-500/20 border border-blue-400/50 rounded-lg flex items-center justify-center p-1" title="50/50 Joker">
                  <img :src="joker50" alt="50/50" class="w-full h-full object-contain">
                </div>
                <div class="w-8 h-8 bg-purple-500/20 border border-purple-400/50 rounded-lg flex items-center justify-center p-1" title="Random Person Joker">
                  <img :src="jokerRandom" alt="Random Person" class="w-full h-full object-contain">
                </div>
                <div class="w-8 h-8 bg-green-500/20 border border-green-400/50 rounded-lg flex items-center justify-center p-1" title="Reveal Joker">
                  <img :src="jokerReveal" alt="Reveal" class="w-full h-full object-contain">
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center p-2 rounded hover:bg-white/5">
              <span class="text-gray-400">Nächstes Ziel:</span>
              <span class="text-orange-400 font-semibold">{{ getNextMilestone() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Progress Ladder -->
      <div class="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div class="flex items-center justify-between gap-2 h-20">
          <!-- Progress Steps -->
          <div class="flex-1 flex items-center justify-between relative h-full">
            <!-- Progress Line -->
            <div class="absolute left-0 right-0 h-1 bg-white/10 top-1/2 -translate-y-1/2"></div>
            <div 
              class="absolute left-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 top-1/2 -translate-y-1/2 transition-all duration-500"
              :style="{ width: `${(currentQuestionIndex / 15) * 100}%` }"
            ></div>
            
            <!-- Question Markers -->
            <div v-for="i in 16" :key="i" 
                 class="relative z-10 flex flex-col items-center justify-center h-full">
              
              <!-- Show reward icons at milestones 5, 10, 15 instead of numbers -->
              <div v-if="[6, 11, 16].includes(i)" 
                   class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2"
                   :class="getRewardMarkerStyle(i)">
                <div class="w-8 h-8">
                  <img 
                    v-if="game.rewards[getRewardIndex(i-1)]?.image" 
                    :src="game.rewards[getRewardIndex(i-1)].image" 
                    :alt="game.rewards[getRewardIndex(i-1)].name" 
                    class="w-full h-full object-cover rounded"
                  >
                  <div v-else class="text-lg">{{ getRewardEmoji(getRewardIndex(i-1)) }}</div>
                </div>
              </div>
              
              <!-- Regular number markers for non-milestone questions -->
              <div v-else-if="i !== 16"
                   class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300"
                   :class="getMarkerStyle(i-1)">
                {{ i - 1 }}
              </div>
              
              <!-- Trophy at the end -->
              <div v-else 
                   class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-yellow-500 to-amber-500 border-2 border-yellow-400">
                <span class="text-2xl">🏆</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="text-center">
        <button
          @click="$emit('continue')"
          class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-12 rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          {{ currentQuestionIndex === 0 ? 'Spiel starten' : 'Weiter zur nächsten Frage' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import joker50 from '@/assets/games/hacke-dicht/jokers/5050.png'
import jokerRandom from '@/assets/games/hacke-dicht/jokers/RandomPerson.png'
import jokerReveal from '@/assets/games/hacke-dicht/jokers/RevealJoker.png'

export default {
  name: 'ProgressScreen',
  props: {
    game: {
      type: Object,
      required: true
    },
    currentQuestionIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['continue'],
  setup(props, { emit }) {
    const handleKeyPress = (event) => {
      // Right Arrow, Space, or Enter: Continue
      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
        if (event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault()
        }
        emit('continue')
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyPress)
    })

    return {
      joker50,
      jokerRandom,
      jokerReveal
    }
  },
  methods: {
    getRewardClass(index) {
      const questionNumber = this.currentQuestionIndex
      if (index === 0 && questionNumber >= 5) return 'bg-green-500/20 border-l-4 border-green-400'
      if (index === 1 && questionNumber >= 10) return 'bg-orange-500/20 border-l-4 border-orange-400'
      if (index === 2 && questionNumber >= 15) return 'bg-red-500/20 border-l-4 border-red-400'
      return 'hover:bg-white/5'
    },
    getQuestionRange(index) {
      const ranges = ['Fragen 1-5', 'Fragen 6-10', 'Fragen 11-15']
      return ranges[index]
    },
    getRewardIndex(questionNumber) {
      if (questionNumber === 5 || questionNumber === 6) return 0
      if (questionNumber === 10 || questionNumber === 11) return 1
      if (questionNumber === 15 || questionNumber === 16) return 2
      return -1
    },
    getRewardEmoji(index) {
      const emojis = ['🍺', '🥃', '🍾']
      return emojis[index] || '🎁'
    },
    getNextMilestone() {
      if (this.currentQuestionIndex < 5) return 'Frage 5'
      if (this.currentQuestionIndex < 10) return 'Frage 10'
      if (this.currentQuestionIndex < 15) return 'Frage 15'
      return 'Geschafft!'
    },
    getMarkerStyle(index) {
      if (index < this.currentQuestionIndex) return 'bg-green-500 text-white border border-green-400'
      if (index === this.currentQuestionIndex) return 'bg-orange-500 text-white border-2 border-orange-400 ring-2 ring-orange-400/30'
      return 'bg-black/40 text-gray-500 border border-white/20'
    },
    getRewardMarkerStyle(i) {
      const index = i - 1
      if (index < this.currentQuestionIndex) return 'bg-green-500/20 border-green-400'
      if (index === this.currentQuestionIndex) return 'bg-orange-500/20 border-orange-400 ring-2 ring-orange-400/30'
      return 'bg-black/40 border-white/20'
    }
  }
}
</script>

<style scoped>
/* Clean, minimal styles */
</style>