<!-- Update für src/components/hacke-dicht/GameCard.vue -->
<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
    <!-- Game Header -->
    <GameCardHeader 
      :game="game"
      @delete="$emit('delete', game.id)"
    />

    <!-- Game Stats -->
    <GameCardStats :game="game" />

    <!-- Rewards Preview -->
    <GameCardRewards :rewards="game.rewards" />

    <!-- Progress Bar -->
    <GameCardProgress :progress="gameProgress" />

    <!-- Action Buttons -->
    <GameCardActions 
      :game="game"
      :is-playable="isGamePlayable"
      @play="$emit('play', game)"
      @play-multiplayer="$emit('play-multiplayer', game)"
      @edit="$emit('edit', game)"
    />

    <!-- Game Status -->
    <GameCardStatus :game="game" />
  </div>
</template>

<script>
import GameCardHeader from './GameCardHeader.vue'
import GameCardStats from './GameCardStats.vue'
import GameCardRewards from './GameCardRewards.vue'
import GameCardProgress from './GameCardProgress.vue'
import GameCardActions from './GameCardActions.vue'
import GameCardStatus from './GameCardStatus.vue'

export default {
  name: 'GameCard',
  components: {
    GameCardHeader,
    GameCardStats,
    GameCardRewards,
    GameCardProgress,
    GameCardActions,
    GameCardStatus
  },
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'play', 'play-multiplayer', 'delete'], // Add new emit
  computed: {
    completedQuestions() {
      return this.game.questions.filter(q => 
        q.question && q.answers.every(a => a.text) && q.correctAnswer !== null
      ).length
    },
    
    gameProgress() {
      const completed = this.completedQuestions
      const hasRewards = this.game.rewards.every(r => r.name)
      const hasName = !!this.game.name
      
      let totalProgress = (completed / 15) * 80 // 80% für Fragen
      if (hasRewards) totalProgress += 15 // 15% für Belohnungen
      if (hasName) totalProgress += 5 // 5% für Name
      
      return Math.min(totalProgress, 100)
    },
    
    isGamePlayable() {
      return this.completedQuestions === 15 && 
             this.game.rewards.every(r => r.name) && 
             this.game.name
    }
  }
}
</script>