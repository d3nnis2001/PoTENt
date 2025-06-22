<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Editor Header -->
      <EditorHeader 
        :is-editing="isEditing"
        :is-game-valid="isGameValid"
        :is-saving="isSaving"
        @back="$router.push('/ai-takes-over/gallery')"
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
import { aiTakesOverStore } from '../store/aiTakesOverStore'

// Import Components (reuse the same components from hacke-dicht-editor)
import EditorHeader from '../components/hacke-dicht-editor/EditorHeader.vue'
import GameSettings from '../components/hacke-dicht-editor/GameSettings.vue'
import QuestionsSection from '../components/hacke-dicht-editor/QuestionsSection.vue'
import ValidationMessages from '../components/hacke-dicht-editor/ValidationMessages.vue'

export default {
  name: 'AiTakesOverEditor',
  components: {
    EditorHeader,
    GameSettings,
    QuestionsSection,
    ValidationMessages
  },
  props: {
    gameId: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const router = useRouter()
    
    // Game Data
    const gameData = ref(aiTakesOverStore.createEmptyGame())
    const usePassword = ref(false)
    const showPassword = ref(false)
    const isSaving = ref(false)
    
    // Computed
    const isEditing = computed(() => !!props.gameId)
    
    const isGameValid = computed(() => {
      // Check if all questions are complete
      const allQuestionsComplete = gameData.value.questions.every(q => 
        q.question.trim() && 
        q.answers.every(a => a.text.trim()) && 
        q.correctAnswer !== null
      )
      
      // Check if all rewards have names
      const allRewardsNamed = gameData.value.rewards.every(r => r.name.trim())
      
      // Check if game has a name
      const hasName = gameData.value.name.trim()
      
      // Check password if required
      const passwordValid = !usePassword.value || gameData.value.password.trim()
      
      return allQuestionsComplete && allRewardsNamed && hasName && passwordValid
    })
    
    // Methods
    const loadGame = () => {
      if (props.gameId) {
        const game = aiTakesOverStore.getGame(parseInt(props.gameId))
        if (game) {
          gameData.value = { ...game }
          usePassword.value = game.isProtected || false
        } else {
          router.push('/ai-takes-over/gallery')
        }
      }
    }
    
    const saveGame = async () => {
      if (!isGameValid.value) return
      
      isSaving.value = true
      
      try {
        const gameToSave = { ...gameData.value }
        
        // Handle password
        if (usePassword.value && gameToSave.password.trim()) {
          gameToSave.isProtected = true
        } else {
          delete gameToSave.password
          gameToSave.isProtected = false
        }
        
        if (isEditing.value) {
          aiTakesOverStore.updateGame(props.gameId, gameToSave)
        } else {
          const newGame = aiTakesOverStore.createGame(gameToSave)
          router.push(`/ai-takes-over/editor/${newGame.id}`)
        }
        
        // Success feedback would be handled by toast in real implementation
        
      } catch (error) {
        console.error('Error saving game:', error)
      } finally {
        isSaving.value = false
      }
    }
    
    const addEventQuestion = (questionIndex, eventQuestion) => {
      if (!gameData.value.eventQuestions[questionIndex]) {
        gameData.value.eventQuestions[questionIndex] = []
      }
      gameData.value.eventQuestions[questionIndex].push(eventQuestion)
    }
    
    const removeEventQuestion = (questionIndex, eventIndex) => {
      if (gameData.value.eventQuestions[questionIndex]) {
        gameData.value.eventQuestions[questionIndex].splice(eventIndex, 1)
        if (gameData.value.eventQuestions[questionIndex].length === 0) {
          delete gameData.value.eventQuestions[questionIndex]
        }
      }
    }
    
    // Watchers
    watch(() => props.gameId, () => {
      if (props.gameId) {
        loadGame()
      } else {
        gameData.value = aiTakesOverStore.createEmptyGame()
        usePassword.value = false
      }
    })
    
    onMounted(() => {
      aiTakesOverStore.loadGames()
      loadGame()
    })
    
    return {
      gameData,
      usePassword,
      showPassword,
      isSaving,
      isEditing,
      isGameValid,
      saveGame,
      addEventQuestion,
      removeEventQuestion
    }
  }
}
</script>