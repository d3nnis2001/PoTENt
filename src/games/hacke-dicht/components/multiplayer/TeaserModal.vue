<template>
  <Transition name="slide-in">
    <div v-if="visible" class="fixed top-20 right-4 z-30 max-w-sm">
      <!-- Notification Card -->
      <div class="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-4 shadow-lg border border-white/20 transform transition-all">
        <!-- Header with close button -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="text-lg">
              <span v-if="category === 'best'">🏆</span>
              <span v-else-if="category === 'worst'">📉</span>
              <span v-else>📊</span>
            </div>
            <span class="text-orange-200 text-xs font-medium">
              <span v-if="category === 'best'">Spitzenreiter</span>
              <span v-else-if="category === 'worst'">Verbesserungsbedarf</span>
              <span v-else>Solider Spieler</span>
            </span>
          </div>
          
          <button
            @click="$emit('close')"
            class="text-white/60 hover:text-white transition-colors p-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Teaser message -->
        <p class="text-white text-sm font-medium mb-3">
          {{ message }}
        </p>
        
        <!-- Progress bar -->
        <div class="w-full bg-white/20 rounded-full h-1">
          <div 
            class="bg-white h-1 rounded-full transition-all duration-1000 ease-linear"
            :style="{ width: `${(timeRemaining / totalTime) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'TeaserModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      validator: value => ['best', 'worst', 'middle'].includes(value)
    },
    duration: {
      type: Number,
      default: 10 // 10 Sekunden
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const timeRemaining = ref(props.duration)
    const totalTime = ref(props.duration)
    let timer = null
    
    const startTimer = () => {
      timeRemaining.value = props.duration
      totalTime.value = props.duration
      
      timer = setInterval(() => {
        timeRemaining.value--
        
        if (timeRemaining.value <= 0) {
          clearInterval(timer)
          emit('close')
        }
      }, 1000)
    }
    
    const stopTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
    
    // Watcher für visibility
    const handleVisibilityChange = (newValue) => {
      if (newValue) {
        startTimer()
      } else {
        stopTimer()
      }
    }
    
    onMounted(() => {
      if (props.visible) {
        startTimer()
      }
    })
    
    onUnmounted(() => {
      stopTimer()
    })
    
    // Watch for prop changes
    const watchVisible = () => {
      handleVisibilityChange(props.visible)
    }
    
    return {
      timeRemaining,
      totalTime,
      watchVisible
    }
  },
  watch: {
    visible: {
      handler: 'watchVisible',
      immediate: false
    }
  }
}
</script>

<style scoped>
.slide-in-enter-active {
  transition: all 0.4s ease-out;
}

.slide-in-leave-active {
  transition: all 0.3s ease-in;
}

.slide-in-enter-from {
  transform: translateX(100%) scale(0.95);
  opacity: 0;
}

.slide-in-leave-to {
  transform: translateX(100%) scale(0.95);
  opacity: 0;
}
</style>