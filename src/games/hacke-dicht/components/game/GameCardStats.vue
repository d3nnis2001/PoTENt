<template>
  <div class="flex justify-between items-center mb-4 text-sm">
    <span class="text-orange-200">
      {{ completedQuestions }}/15 Fragen
    </span>
    <span class="text-orange-200">
      {{ eventQuestionsCount }} Events
    </span>
  </div>
</template>

<script>
export default {
  name: 'GameCardStats',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  computed: {
    completedQuestions() {
      return this.game.questions.filter(q => 
        q.question && q.answers.every(a => a.text) && q.correctAnswer !== null
      ).length
    },
    
    eventQuestionsCount() {
      return Object.values(this.game.eventQuestions || {}).reduce((total, events) => total + events.length, 0)
    }
  }
}
</script>