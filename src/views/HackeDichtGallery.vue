<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <button
            @click="$router.push('/games')"
            class="text-purple-200 hover:text-white mb-2 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Zurück zur Spielauswahl
          </button>
          <h1 class="text-3xl font-bold text-white">Wer wird hacke dicht?</h1>
          <p class="text-orange-200 text-sm">Deine Trinkquiz-Spiele</p>
        </div>
        <button
          @click="createNewGame"
          class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Neues Quiz erstellen
        </button>
      </div>

      <!-- Games Grid -->
      <div v-if="hackeDichtStore.games.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="game in hackeDichtStore.games"
          :key="game.id"
          class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white group-hover:text-orange-200 transition-colors">
                {{ game.name }}
              </h3>
              <p v-if="game.description" class="text-orange-200 text-sm mt-1">
                {{ game.description }}
              </p>
            </div>
            <button
              @click="deleteGame(game.id)"
              class="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>

          <!-- Game Stats -->
          <div class="flex justify-between items-center mb-4 text-sm">
            <span class="text-orange-200">
              {{ getCompletedQuestions(game) }}/15 Fragen
            </span>
            <span class="text-orange-200">
              {{ getEventQuestionsCount(game) }} Events
            </span>
          </div>

          <!-- Rewards Preview -->
          <div class="flex gap-2 mb-4">
            <div 
              v-for="(reward, index) in game.rewards" 
              :key="index"
              class="flex-1 bg-white/5 rounded-lg p-2 text-center"
            >
              <div v-if="reward.image" class="w-8 h-8 mx-auto mb-1">
                <img :src="reward.image" :alt="reward.name" class="w-full h-full object-cover rounded">
              </div>
              <div v-else class="w-8 h-8 mx-auto mb-1 bg-white/20 rounded flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span class="text-xs text-orange-200">{{ reward.name || 'Belohnung' }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-white/20 rounded-full h-2 mb-4">
            <div 
              class="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${getGameProgress(game)}%` }"
            ></div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button
              @click="playGame(game.id)"
              :disabled="!isGamePlayable(game)"
              class="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Spielen
            </button>
            <button
              @click="editGame(game.id)"
              class="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30 transition-all duration-200"
            >
              Bearbeiten
            </button>
          </div>

          <!-- Game Status -->
          <div class="mt-3 text-center">
            <span 
              class="inline-block px-3 py-1 rounded-full text-xs font-medium"
              :class="getGameStatusClass(game)"
            >
              {{ getGameStatus(game) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 text-orange-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 class="text-xl font-semibold text-white mb-2">Noch keine Quiz-Spiele</h2>
        <p class="text-orange-200 mb-6">Erstelle dein erstes "Wer wird hacke dicht?" Quiz!</p>
        <button
          @click="createNewGame"
          class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200"
        >
          Quiz erstellen
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { hackeDichtStore } from '../store/hackeDichtStore'

export default {
  name: 'HackeDichtGallery',
  setup() {
    const router = useRouter()

    const createNewGame = () => {
      router.push('/hacke-dicht/editor')
    }

    const editGame = (gameId) => {
      router.push(`/hacke-dicht/editor/${gameId}`)
    }

    const playGame = (gameId) => {
      router.push(`/hacke-dicht/play/${gameId}`)
    }

    const deleteGame = (gameId) => {
      if (confirm('Möchtest du dieses Quiz wirklich löschen?')) {
        hackeDichtStore.deleteGame(gameId)
      }
    }

    const getCompletedQuestions = (game) => {
      return game.questions.filter(q => q.question && q.answers.every(a => a.text) && q.correctAnswer !== null).length
    }

    const getEventQuestionsCount = (game) => {
      return Object.values(game.eventQuestions || {}).reduce((total, events) => total + events.length, 0)
    }

    const getGameProgress = (game) => {
      const completed = getCompletedQuestions(game)
      const hasRewards = game.rewards.every(r => r.name)
      const hasName = !!game.name
      
      let totalProgress = (completed / 15) * 80 // 80% für Fragen
      if (hasRewards) totalProgress += 15 // 15% für Belohnungen
      if (hasName) totalProgress += 5 // 5% für Name
      
      return Math.min(totalProgress, 100)
    }

    const isGamePlayable = (game) => {
      return getCompletedQuestions(game) === 15 && 
             game.rewards.every(r => r.name) && 
             game.name
    }

    const getGameStatus = (game) => {
      const progress = getGameProgress(game)
      if (progress === 100) return 'Bereit zum Spielen'
      if (progress >= 50) return 'In Bearbeitung'
      return 'Entwurf'
    }

    const getGameStatusClass = (game) => {
      const progress = getGameProgress(game)
      if (progress === 100) return 'bg-green-600/30 text-green-300 border border-green-400/30'
      if (progress >= 50) return 'bg-yellow-600/30 text-yellow-300 border border-yellow-400/30'
      return 'bg-gray-600/30 text-gray-300 border border-gray-400/30'
    }

    onMounted(() => {
      hackeDichtStore.loadGames()
    })

    return {
      hackeDichtStore,
      createNewGame,
      editGame,
      playGame,
      deleteGame,
      getCompletedQuestions,
      getEventQuestionsCount,
      getGameProgress,
      isGamePlayable,
      getGameStatus,
      getGameStatusClass
    }
  }
}
</script>