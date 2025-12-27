<template>
  <div class="bg-white/5 rounded-lg p-4">
    <label class="block text-white font-medium mb-2">
      {{ getRewardLabel(index) }}
    </label>
    <input
      :value="reward.name"
      @input="$emit('update-reward', index, 'name', $event.target.value)"
      type="text"
      class="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm mb-3"
      :placeholder="getRewardPlaceholder(index)"
      required
    />
    
    <!-- Image Upload -->
    <div class="relative">
      <input
        :ref="`fileInput${index}`"
        type="file"
        accept="image/*"
        @change="$emit('image-upload', $event)"
        class="hidden"
      />
      <button
        @click="$refs[`fileInput${index}`]?.click()"
        type="button"
        class="w-full bg-white/10 border-2 border-dashed border-white/30 rounded-lg p-4 text-white hover:bg-white/20 transition-colors flex flex-col items-center gap-2"
      >
        <div v-if="reward.image" class="w-full">
          <img :src="reward.image" :alt="reward.name" class="w-full h-20 object-cover rounded-lg mb-2">
          <p class="text-sm text-orange-200">Bild ändern</p>
        </div>
        <div v-else>
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-sm text-orange-200">Bild hochladen</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RewardCard',
  props: {
    reward: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  emits: ['update-reward', 'image-upload'],
  methods: {
    getRewardLabel(index) {
      const ranges = ['Fragen 1-5', 'Fragen 6-10', 'Fragen 11-15']
      return ranges[index]
    },
    
    getRewardPlaceholder(index) {
      const placeholders = ['z.B. Klopfer', 'z.B. Erdbeer Shots', 'z.B. Vodka Shots']
      return placeholders[index]
    }
  }
}
</script>