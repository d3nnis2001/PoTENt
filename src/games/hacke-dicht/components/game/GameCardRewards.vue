<template>
  <div class="flex gap-2 mb-4">
    <RewardPreview 
      v-for="(reward, index) in rewards" 
      :key="index"
      :reward="reward"
    />
  </div>
</template>

<script>
import RewardPreview from './RewardPreview.vue'

export default {
  name: 'GameCardRewards',
  components: {
    RewardPreview
  },
  props: {
    rewards: {
      type: Array,
      required: true
    }
  }
}
</script>