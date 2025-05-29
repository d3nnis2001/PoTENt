<template>
  <div class="mt-6">
    <h3 class="text-lg font-semibold text-white mb-4">Belohnungen (Getränke)</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <RewardCard
        v-for="(reward, index) in gameData.rewards"
        :key="index"
        :reward="reward"
        :index="index"
        @update-reward="updateReward"
        @image-upload="$emit('image-upload', $event, index)"
      />
    </div>
  </div>
</template>

<script>
import RewardCard from './RewardCard.vue'

export default {
  name: 'RewardsSettings',
  components: {
    RewardCard
  },
  props: {
    gameData: {
      type: Object,
      required: true
    }
  },
  emits: ['update:gameData', 'image-upload'],
  methods: {
    getRewardLabel(index) {
      const ranges = ['Fragen 1-5', 'Fragen 6-10', 'Fragen 11-15']
      return ranges[index]
    },
    
    getRewardPlaceholder(index) {
      const placeholders = ['z.B. Klopfer', 'z.B. Erdbeer Shots', 'z.B. Vodka Shots']
      return placeholders[index]
    },
    
    updateReward(index, field, value) {
      const updatedData = { ...this.gameData }
      updatedData.rewards[index][field] = value
      this.$emit('update:gameData', updatedData)
    }
  }
}
</script>