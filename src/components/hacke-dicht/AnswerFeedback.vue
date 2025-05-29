<template>
  <div class="text-center">
    <div class="text-green-400 text-2xl font-bold mb-2">
      ✅ Die richtige Antwort ist {{ String.fromCharCode(65 + correctAnswer) }}!
    </div>
    <div class="text-orange-200 text-lg">
      Wer die Antwort nicht wusste, trinkt: {{ currentReward?.name }}! 🍻
    </div>
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