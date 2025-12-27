<template>
  <div class="text-center">
    <!-- Feedback removed -->
  </div>
</template>

<script>
export default {
  name: 'AnswerFeedback',
  props: {
    correctAnswer: {
      type: Number,
      required: true
    },
    currentReward: {
      type: Object,
      required: true
    }
  }
}
</script>