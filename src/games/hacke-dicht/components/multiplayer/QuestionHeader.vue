<template>
  <div class="text-center mb-6">
    <h2 class="text-2xl font-bold text-white mb-2">Frage {{ questionIndex + 1 }}</h2>
    
    <!-- Host View -->
    <div v-if="isHost" class="flex items-center justify-center gap-2">
      <span class="text-orange-200">Moderierst das Quiz</span>
      <span class="text-orange-300">•</span>
      <span class="text-orange-200">{{ realPlayerCount }} Spieler</span>
      <span class="text-orange-300">•</span>
      <span class="text-green-300">{{ votedPlayerCount }}/{{ realPlayerCount }} abgestimmt</span>
    </div>
    
    <!-- Player View -->
    <div v-else>
      
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
    },
    isHost: {
      type: Boolean,
      required: true
    },
    realPlayerCount: {
      type: Number,
      required: true
    },
    votedPlayerCount: {
      type: Number,
      required: true
    }
  }
}
</script>