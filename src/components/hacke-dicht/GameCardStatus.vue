<template>
  <div class="mt-3 text-center">
    <span 
      class="inline-block px-3 py-1 rounded-full text-xs font-medium"
      :class="statusClass"
    >
      {{ statusText }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'GameCardStatus',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  computed: {
    progress() {
      const completed = this.game.questions.filter(q => 
        q.question && q.answers.every(a => a.text) && q.correctAnswer !== null
      ).length
      const hasRewards = this.game.rewards.every(r => r.name)
      const hasName = !!this.game.name
      
      let totalProgress = (completed / 15) * 80
      if (hasRewards) totalProgress += 15
      if (hasName) totalProgress += 5
      
      return Math.min(totalProgress, 100)
    },
    
    statusText() {
      if (this.progress === 100) return 'Bereit zum Spielen'
      if (this.progress >= 50) return 'In Bearbeitung'
      return 'Entwurf'
    },
    
    statusClass() {
      if (this.progress === 100) return 'bg-green-600/30 text-green-300 border border-green-400/30'
      if (this.progress >= 50) return 'bg-yellow-600/30 text-yellow-300 border border-yellow-400/30'
      return 'bg-gray-600/30 text-gray-300 border border-gray-400/30'
    }
  }
}
</script>