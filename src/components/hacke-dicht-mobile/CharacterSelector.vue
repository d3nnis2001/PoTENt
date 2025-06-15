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
      <div class="w-48 h-48 rounded-2xl bg-orange-600/50 border-4 border-orange-400 flex items-center justify-center transition-all shadow-xl">
        <img :src="currentIcon" alt="Character" class="w-44 h-44 object-contain" />
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
    }
  },
  emits: ['update:selectedIconIndex'],
  setup(props, { emit }) {
    const availableIcons = characterImages
    
    const currentIcon = computed(() => {
      return availableIcons[props.selectedIconIndex] || availableIcons[0]
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
      nextIcon,
      prevIcon
    }
  }
}
</script>