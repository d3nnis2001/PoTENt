<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-full space-y-6" style="margin-top: -180px;">
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
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
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
  setup(props, { emit }) {
    const handleKeyPress = (event) => {
      // Right Arrow: Show answer or continue
      if (event.key === 'ArrowRight') {
        if (props.gamePhase === 'reading') {
          emit('show-answer')
        } else if (props.gamePhase === 'showing_answer') {
          emit('next-question')
        }
      }
      
      // Space: Alternative for show answer/continue
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault()
        if (props.gamePhase === 'reading') {
          emit('show-answer')
        } else if (props.gamePhase === 'showing_answer') {
          emit('next-question')
        }
      }

      // Enter: Alternative for show answer/continue
      if (event.key === 'Enter') {
        if (props.gamePhase === 'reading') {
          emit('show-answer')
        } else if (props.gamePhase === 'showing_answer') {
          emit('next-question')
        }
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyPress)
    })

    return {}
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