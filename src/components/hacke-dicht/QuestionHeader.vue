<template>
  <div class="text-center">
    <h2 class="text-2xl font-bold text-white mb-2">Frage {{ questionIndex + 1 }}</h2>
    <div class="flex items-center justify-center gap-2">
      <span class="text-orange-200">Bei falscher Antwort trinken:</span>
      <div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
        <img 
          v-if="currentReward?.image" 
          :src="currentReward.image" 
          :alt="currentReward.name" 
          class="w-6 h-6 object-cover rounded-full"
        >
        <span class="text-white font-bold">{{ currentReward?.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionHeader',
  props: {
    questionIndex: {
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