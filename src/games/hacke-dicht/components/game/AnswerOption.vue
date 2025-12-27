<template>
  <div
    class="p-4 rounded-lg font-medium text-left flex items-center gap-3 min-h-[60px] transition-all duration-500"
    :class="answerClasses"
  >
    <span class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">
      {{ String.fromCharCode(65 + index) }}
    </span>
    <span class="flex-1">{{ answer.text }}</span>
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
    index: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    isHidden: {
      type: Boolean,
      required: true
    },
    gamePhase: {
      type: String,
      required: true
    }
  },
  computed: {
    answerClasses() {
      if (this.gamePhase === 'reading') {
        if (this.isHidden) {
          return 'bg-white/5 text-white/30 border-2 border-white/10 opacity-30'
        }
        return 'bg-white/20 text-white border-2 border-white/30'
      } else if (this.gamePhase === 'showing_answer') {
        if (this.isCorrect) {
          return 'bg-green-600 text-white border-2 border-green-400 animate-pulse shadow-lg shadow-green-400/50'
        } else if (this.isHidden) {
          return 'bg-white/5 text-white/20 border-2 border-white/10 opacity-30'
        } else {
          return 'bg-white/10 text-white/50 border-2 border-white/20'
        }
      }
      return 'bg-white/20 text-white border-2 border-white/30'
    }
  }
}
</script>