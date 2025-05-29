<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 shadow-2xl border border-white/20">
      <p class="text-white text-2xl leading-relaxed text-center mb-8">
        {{ question.question }}
      </p>

      <!-- Answer Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AnswerOption
          v-for="(answer, index) in question.answers"
          :key="index"
          :answer="answer"
          :index="index"
          :is-correct="index === question.correctAnswer"
          :is-hidden="hiddenAnswers.includes(index)"
          :game-phase="gamePhase"
        />
      </div>

      <!-- Action Button -->
      <div class="text-center">
        <ActionButton
          :game-phase="gamePhase"
          :is-last-question="isLastQuestion"
          @show-answer="$emit('show-answer')"
          @next-question="$emit('next-question')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AnswerOption from './AnswerOption.vue'
import ActionButton from './ActionButton.vue'

export default {
  name: 'QuestionCard',
  components: {
    AnswerOption,
    ActionButton
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    gamePhase: {
      type: String,
      required: true
    },
    hiddenAnswers: {
      type: Array,
      required: true
    },
    isLastQuestion: {
      type: Boolean,
      required: true
    }
  },
  emits: ['show-answer', 'next-question']
}
</script>