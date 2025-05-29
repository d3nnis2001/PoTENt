<template>
  <div class="flex-1 bg-white/5 rounded-lg p-2 text-center">
    <div v-if="reward.image" class="w-8 h-8 mx-auto mb-1">
      <img :src="reward.image" :alt="reward.name" class="w-full h-full object-cover rounded">
    </div>
    <div v-else class="w-8 h-8 mx-auto mb-1 bg-white/20 rounded flex items-center justify-center">
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    </div>
    <span class="text-xs text-orange-200">{{ reward.name || 'Belohnung' }}</span>
  </div>
</template>

<script>
export default {
  name: 'RewardPreview',
  props: {
    reward: {
      type: Object,
      required: true
    }
  }
}
</script>