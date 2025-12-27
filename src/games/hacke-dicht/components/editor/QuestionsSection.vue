<template>
  <div class="space-y-6">
    <div 
      v-for="questionIndex in 15" 
      :key="`question-${questionIndex}`"
      class="space-y-4"
    >
      <!-- Main Question -->
      <QuestionCard
        :question-index="questionIndex"
        :question="gameData.questions[questionIndex - 1]"
        :reward-name="getRewardForQuestion(questionIndex)"
        @update-question="updateQuestion"
        @update-answer="updateAnswer"
        @update-correct-answer="updateCorrectAnswer"
        @add-event-question="$emit('add-event-question', questionIndex)"
      />

      <!-- Event Questions for this level -->
      <EventQuestionCard
        v-for="(eventQuestion, eventIndex) in getEventQuestionsForLevel(questionIndex)"
        :key="`event-${questionIndex}-${eventIndex}`"
        :question-index="questionIndex"
        :event-index="eventIndex"
        :event-question="eventQuestion"
        @update-event-question="updateEventQuestion"
        @remove-event-question="$emit('remove-event-question', questionIndex, eventIndex)"
      />
    </div>
  </div>
</template>

<script>
import QuestionCard from './QuestionCard.vue'
import EventQuestionCard from './EventQuestionCard.vue'

export default {
  name: 'QuestionsSection',
  components: {
    QuestionCard,
    EventQuestionCard
  },
  props: {
    gameData: {
      type: Object,
      required: true
    }
  },
  emits: ['update:gameData', 'add-event-question', 'remove-event-question'],
  methods: {
    getRewardForQuestion(questionNumber) {
      if (questionNumber <= 5) return this.gameData.rewards[0].name || 'Belohnung 1'
      if (questionNumber <= 10) return this.gameData.rewards[1].name || 'Belohnung 2'
      return this.gameData.rewards[2].name || 'Belohnung 3'
    },

    getEventQuestionsForLevel(questionNumber) {
      return this.gameData.eventQuestions[questionNumber] || []
    },

    updateQuestion(questionIndex, value) {
      const updatedData = { ...this.gameData }
      updatedData.questions[questionIndex - 1].question = value
      this.$emit('update:gameData', updatedData)
    },

    updateAnswer(questionIndex, answerIndex, value) {
      const updatedData = { ...this.gameData }
      updatedData.questions[questionIndex - 1].answers[answerIndex].text = value
      this.$emit('update:gameData', updatedData)
    },

    updateCorrectAnswer(questionIndex, value) {
      const updatedData = { ...this.gameData }
      updatedData.questions[questionIndex - 1].correctAnswer = parseInt(value)
      this.$emit('update:gameData', updatedData)
    },

    updateEventQuestion(questionIndex, eventIndex, value) {
      const updatedData = { ...this.gameData }
      if (!updatedData.eventQuestions[questionIndex]) {
        updatedData.eventQuestions[questionIndex] = []
      }
      updatedData.eventQuestions[questionIndex][eventIndex].text = value
      this.$emit('update:gameData', updatedData)
    }
  }
}
</script>