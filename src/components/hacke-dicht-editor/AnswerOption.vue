<template>
  <div class="flex items-center gap-3">
    <label class="flex items-center gap-2 flex-1">
      <input
        type="radio"
        :name="`correct-${questionIndex}`"
        :value="answerIndex"
        :checked="isCorrect"
        @change="$emit('update-correct')"
        class="w-4 h-4 text-green-600 bg-white/20 border-white/30 focus:ring-green-500 focus:ring-2"
      />
      <input
        :value="answer.text"
        @input="$emit('update-answer', $event.target.value)"
        type="text"
        class="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
        :placeholder="`Antwort ${String.fromCharCode(65 + answerIndex)}`"
        required
      />
    </label>
  </div>
</template>

<script>
export default {
  name: 'AnswerOption',
  props: {
    answer: {
      type: Object,
      required: true
    },
    answerIndex: {
      type: Number,
      required: true
    },
    questionIndex: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update-answer', 'update-correct']
}
</script>