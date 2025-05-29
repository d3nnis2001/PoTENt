<template>
  <div class="flex-1 space-y-1 max-w-lg ml-auto">
    <!-- Questions 11-15 (Top) - Red Border -->
    <LadderSection 
      :levels="[15, 14, 13, 12, 11]"
      :current-question-index="currentQuestionIndex"
      :reward-name="rewards[2]?.name || 'Belohnung 3'"
      color-scheme="red"
    />

    <!-- Questions 6-10 (Middle) - Orange Border -->
    <LadderSection 
      :levels="[10, 9, 8, 7, 6]"
      :current-question-index="currentQuestionIndex"
      :reward-name="rewards[1]?.name || 'Belohnung 2'"
      color-scheme="orange"
    />

    <!-- Questions 1-5 (Bottom) - Green Border -->
    <LadderSection 
      :levels="[5, 4, 3, 2, 1]"
      :current-question-index="currentQuestionIndex"
      :reward-name="rewards[0]?.name || 'Belohnung 1'"
      color-scheme="green"
    />
  </div>
</template>

<script>
import LadderSection from './LadderSection.vue'

export default {
  name: 'QuestionLadder',
  components: {
    LadderSection
  },
  props: {
    currentQuestionIndex: {
      type: Number,
      required: true
    },
    rewards: {
      type: Array,
      required: true
    }
  }
}
</script>