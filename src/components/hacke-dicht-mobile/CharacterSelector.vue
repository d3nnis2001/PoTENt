<template>
  <div>
    <label class="block text-white font-medium mb-2">Wähle dein Icon</label>
    <div class="flex items-center justify-center gap-8">
      <!-- Previous Icon Button -->
      <button
        @click="prevIcon"
        type="button"
        class="w-16 h-16 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-all flex items-center justify-center text-white font-bold text-2xl"
      >
        <
      </button>
      
      <!-- Current Icon Display -->
      <div class="w-48 h-48 rounded-2xl bg-orange-600/50 border-4 border-orange-400 flex items-center justify-center transition-all shadow-xl relative">
        <img 
          :src="currentIcon" 
          alt="Character" 
          class="w-44 h-44 object-contain transition-all"
          :class="{ 'opacity-50 grayscale': isCurrentCharacterUsed }" 
        />
        <!-- Durchstreichung -->
        <div 
          v-if="isCurrentCharacterUsed" 
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div class="w-full h-1 bg-red-500 rotate-45 absolute"></div>
          <div class="w-full h-1 bg-red-500 -rotate-45 absolute"></div>
          <div class="bg-red-600 text-white px-2 py-1 rounded-lg font-bold text-xs z-10">
            BELEGT
          </div>
        </div>
      </div>
      
      <!-- Next Icon Button -->
      <button
        @click="nextIcon"
        type="button"
        class="w-16 h-16 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-all flex items-center justify-center text-white font-bold text-2xl"
      >
        >
      </button>
    </div>
    
    <!-- Icon Counter -->
    <div class="text-center mt-2">
      <span class="text-xs text-orange-200">{{ selectedIconIndex + 1 }} / {{ availableIcons.length }}</span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

// Dynamic import of character images
const importCharacterImages = () => {
  const images = []
  const modules = import.meta.glob('../../assets/character/Character*.png', { eager: true })
  
  // Sort by character number
  const sortedKeys = Object.keys(modules).sort((a, b) => {
    const numA = parseInt(a.match(/Character(\d+)\.png$/)?.[1] || '0')
    const numB = parseInt(b.match(/Character(\d+)\.png$/)?.[1] || '0')
    return numA - numB
  })
  
  sortedKeys.forEach(key => {
    images.push(modules[key].default)
  })
  
  return images
}

const characterImages = importCharacterImages()

export default {
  name: 'CharacterSelector',
  props: {
    selectedIconIndex: {
      type: Number,
      required: true
    },
    usedCharacters: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:selectedIconIndex'],
  setup(props, { emit }) {
    const availableIcons = characterImages
    
    const currentIcon = computed(() => {
      return availableIcons[props.selectedIconIndex] || availableIcons[0]
    })

    const isCurrentCharacterUsed = computed(() => {
      return props.usedCharacters.includes(props.selectedIconIndex)
    })

    const nextIcon = () => {
      const newIndex = (props.selectedIconIndex + 1) % availableIcons.length
      emit('update:selectedIconIndex', newIndex)
    }
    
    const prevIcon = () => {
      const newIndex = props.selectedIconIndex === 0 
        ? availableIcons.length - 1 
        : props.selectedIconIndex - 1
      emit('update:selectedIconIndex', newIndex)
    }
    
    return {
      availableIcons,
      currentIcon,
      isCurrentCharacterUsed,
      nextIcon,
      prevIcon
    }
  }
}
</script>