<template>
  <div class="flex items-center justify-center">
    <div 
      class="flex items-center gap-2 p-2 rounded-lg shadow-lg border-2"
      :class="cardClasses"
    >
      <div class="w-8 h-8 flex-shrink-0">
        <img 
          v-if="reward?.image" 
          :src="reward.image" 
          :alt="reward.name" 
          class="w-full h-full object-cover rounded"
        >
        <div v-else class="w-full h-full bg-white/20 rounded flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      </div>
      <span class="text-white font-bold text-xs">
        {{ reward?.name || label }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DrinkCard',
  props: {
    reward: {
      type: Object,
      default: () => ({})
    },
    colorScheme: {
      type: String,
      required: true,
      validator: (value) => ['red', 'orange', 'green'].includes(value)
    },
    label: {
      type: String,
      required: true
    }
  },
  computed: {
    cardClasses() {
      const schemes = {
        red: 'bg-gradient-to-r from-red-600 to-red-700 border-red-400/50',
        orange: 'bg-gradient-to-r from-orange-600 to-orange-700 border-orange-400/50',
        green: 'bg-gradient-to-r from-green-600 to-green-700 border-green-400/50'
      }
      return schemes[this.colorScheme]
    }
  }
}
</script>