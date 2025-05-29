<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Editor Header -->
      <EditorHeader 
        :is-editing="isEditing"
        :is-game-valid="isGameValid"
        :is-saving="isSaving"
        @back="$router.push('/hacke-dicht/gallery')"
        @save="saveGame"
      />

      <!-- Game Settings -->
      <GameSettings 
        :game-data="gameData"
        :use-password="usePassword"
        :show-password="showPassword"
        @update:game-data="gameData = $event"
        @update:use-password="usePassword = $event"
        @update:show-password="showPassword = $event"
      />

      <!-- Questions Section -->
      <QuestionsSection 
        :game-data="gameData"
        @update:game-data="gameData = $event"
        @add-event-question="addEventQuestion"
        @remove-event-question="removeEventQuestion"
      />

      <!-- Validation Messages -->
      <ValidationMessages 
        v-if="!isGameValid"
        :game-data="gameData"
        :use-password="usePassword"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { hackeDichtStore } from '../store/hackeDichtStore'

// Import Components
import EditorHeader from '../components/hacke-dicht-editor/EditorHeader.vue'
import GameSettings from '../components/hacke-dicht-editor/GameSettings.vue'
import QuestionsSection from '../components/hacke-dicht-editor/QuestionsSection.vue'
import ValidationMessages from '../components/hacke-dicht-editor/ValidationMessages.vue'

export default {
  name: 'HackeDichtEditor',
  components: {
    EditorHeader,
    GameSettings,
    QuestionsSection,
    ValidationMessages
  },
  props: {
    gameId: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const router = useRouter()
    const isSaving = ref(false)
    const usePassword = ref(false)
    const showPassword = ref(false)
    const isEditing = computed(() => !!props.gameId)

    const gameData = ref(hackeDichtStore.createEmptyGame())

    // Initialize or load game
    const initializeGame = () => {
      if (isEditing.value) {
        const existingGame = hackeDichtStore.getGame(parseInt(props.gameId))
        if (existingGame) {
          gameData.value = JSON.parse(JSON.stringify(existingGame)) // Deep copy
          usePassword.value = existingGame.isProtected || false
          // Don't show the hashed password
          if (existingGame.isProtected) {
            gameData.value.password = ''
          }
        } else {
          alert('Spiel nicht gefunden!')
          router.push('/hacke-dicht/gallery')
        }
      }
    }

    // Watch password checkbox
    watch(usePassword, (newVal) => {
      if (!newVal) {
        gameData.value.password = ''
      }
    })

    const addEventQuestion = (afterQuestion) => {
      if (!gameData.value.eventQuestions[afterQuestion]) {
        gameData.value.eventQuestions[afterQuestion] = []
      }
      gameData.value.eventQuestions[afterQuestion].push({
        text: '',
        id: Date.now() + Math.random()
      })
    }

    const removeEventQuestion = (afterQuestion, eventIndex) => {
      if (gameData.value.eventQuestions[afterQuestion]) {
        gameData.value.eventQuestions[afterQuestion].splice(eventIndex, 1)
        if (gameData.value.eventQuestions[afterQuestion].length === 0) {
          delete gameData.value.eventQuestions[afterQuestion]
        }
      }
    }

    const isGameValid = computed(() => {
      // Check basic game info
      if (!gameData.value.name) return false
      
      // Check password if enabled
      if (usePassword.value && !gameData.value.password) return false
      
      // Check rewards
      if (gameData.value.rewards.some(reward => !reward.name)) return false
      
      // Check questions
      const questions = gameData.value.questions
      if (questions.some(q => !q.question)) return false
      if (questions.some(q => q.answers.some(a => !a.text))) return false
      if (questions.some(q => q.correctAnswer === null)) return false
      
      return true
    })

    const saveGame = async () => {
      if (!isGameValid.value) return
      
      isSaving.value = true
      try {
        // Set password protection flag
        if (usePassword.value && gameData.value.password) {
          gameData.value.isProtected = true
        } else {
          gameData.value.isProtected = false
          gameData.value.password = ''
        }

        if (isEditing.value) {
          hackeDichtStore.updateGame(props.gameId, gameData.value)
          alert('Spiel erfolgreich aktualisiert!')
        } else {
          hackeDichtStore.createGame(gameData.value)
          alert('Spiel erfolgreich erstellt!')
        }
        
        router.push('/hacke-dicht/gallery')
      } catch (error) {
        alert('Fehler beim Speichern: ' + error.message)
      } finally {
        isSaving.value = false
      }
    }

    onMounted(() => {
      hackeDichtStore.loadGames()
      initializeGame()
    })

    return {
      gameData,
      isSaving,
      isGameValid,
      isEditing,
      usePassword,
      showPassword,
      addEventQuestion,
      removeEventQuestion,
      saveGame
    }
  }
}
</script>