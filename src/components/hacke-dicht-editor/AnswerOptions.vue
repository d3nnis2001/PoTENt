<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <AnswerOption
      v-for="(answer, answerIndex) in question.answers"
      :key="`answer-${questionIndex}-${answerIndex}`"
      :answer="answer"
      :answer-index="answerIndex"
      :question-index="questionIndex"
      :is-correct="question.correctAnswer === answerIndex"
      @update-answer="$emit('update-answer', { answerIndex, value: $event })"
      @update-correct="$emit('update-correct', answerIndex)"
    />
  </div>
</template>

<script>
import AnswerOption from './AnswerOption.vue'

export default {
  name: 'AnswerOptions',
  components: {
    AnswerOption
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    questionIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['update-answer', 'update-correct']
}
</script>