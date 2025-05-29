<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
    <QuestionHeader 
      :question-index="questionIndex"
      :reward-name="rewardName"
      @add-event-question="$emit('add-event-question')"
    />

    <div class="space-y-4">
      <!-- Question Text -->
      <QuestionInput 
        :question="question.question"
        :question-index="questionIndex"
        @update="$emit('update-question', questionIndex, $event)"
      />

      <!-- Answer Options -->
      <AnswerOptions
        :question="question"
        :question-index="questionIndex"
        @update-answer="$emit('update-answer', questionIndex, $event.answerIndex, $event.value)"
        @update-correct="$emit('update-correct-answer', questionIndex, $event)"
      />
      
      <p class="text-orange-200 text-sm">
        ✓ Markiere die richtige Antwort mit dem Radio-Button
      </p>
    </div>
  </div>
</template>

<script>
import QuestionHeader from './QuestionHeader.vue'
import QuestionInput from './QuestionInput.vue'
import AnswerOptions from './AnswerOptions.vue'

export default {
  name: 'QuestionCard',
  components: {
    QuestionHeader,
    QuestionInput,
    AnswerOptions
  },
  props: {
    questionIndex: {
      type: Number,
      required: true
    },
    question: {
      type: Object,
      required: true
    },
    rewardName: {
      type: String,
      required: true
    }
  },
  emits: ['update-question', 'update-answer', 'update-correct-answer', 'add-event-question']
}
</script>