<template>
  <div 
    class="space-y-0.5 mb-1 p-2 rounded-md border"
    :class="sectionClasses"
  >
    <div 
      v-for="level in levels" 
      :key="level"
      class="flex items-center justify-between px-2 py-1 rounded transition-all duration-300 text-xs"
      :class="getProgressLevelClass(level)"
    >
      <div class="flex items-center gap-2">
        <span class="font-bold min-w-[20px]">{{ level }}</span>
        <span>Frage {{ level }}</span>
      </div>
      <div class="font-bold">{{ rewardName }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LadderSection',
  props: {
    levels: {
      type: Array,
      required: true
    },
    currentQuestionIndex: {
      type: Number,
      required: true
    },
    rewardName: {
      type: String,
      required: true
    },
    colorScheme: {
      type: String,
      required: true,
      validator: (value) => ['red', 'orange', 'green'].includes(value)
    }
  },
  computed: {
    sectionClasses() {
      const schemes = {
        red: 'border-red-400/30 bg-red-600/10',
        orange: 'border-orange-400/30 bg-orange-600/10',
        green: 'border-green-400/30 bg-green-600/10'
      }
      return schemes[this.colorScheme]
    }
  },
  methods: {
    getProgressLevelClass(level) {
      const current = this.currentQuestionIndex + 1
      if (level === current) {
        return 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-2 border-orange-400 shadow-lg transform scale-105'
      } else if (level < current) {
        return 'bg-green-600/40 text-green-200 border border-green-400/50'
      } else {
        return 'bg-white/10 text-white/70 border border-white/20'
      }
    }
  }
}
</script>