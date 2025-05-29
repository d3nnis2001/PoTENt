<template>
  <div class="space-y-6">
    <!-- Jokers Display -->
    <JokersPanel 
      :jokers="jokers"
      :game-phase="gamePhase"
      @use-joker="$emit('use-joker', $event)"
    />

    <!-- Question Number & Current Reward Info -->
    <QuestionHeader 
      :question-index="questionIndex"
      :current-reward="currentReward"
    />

    <!-- Question Card -->
    <QuestionCard
      :question="question"
      :game-phase="gamePhase"
      :hidden-answers="hiddenAnswers"
      :is-last-question="isLastQuestion"
      @show-answer="$emit('show-answer')"
      @next-question="$emit('next-question')"
    />

    <!-- Answer Feedback -->
    <AnswerFeedback
      v-if="gamePhase === 'showing_answer'"
      :correct-answer="question.correctAnswer"
      :current-reward="currentReward"
    />
  </div>
</template>

<script>
import JokersPanel from './JokersPanel.vue'
import QuestionHeader from './QuestionHeader.vue'
import QuestionCard from './QuestionCard.vue'
import AnswerFeedback from './AnswerFeedback.vue'

export default {
  name: 'QuestionView',
  components: {
    JokersPanel,
    QuestionHeader,
    QuestionCard,
    AnswerFeedback
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    questionIndex: {
      type: Number,
      required: true
    },
    currentReward: {
      type: Object,
      required: true
    },
    gamePhase: {
      type: String,
      required: true
    },
    isLastQuestion: {
      type: Boolean,
      required: true
    },
    hiddenAnswers: {
      type: Array,
      required: true
    },
    jokers: {
      type: Object,
      required: true
    }
  },
  emits: ['show-answer', 'next-question', 'use-joker']
}
</script>