<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-md text-center">
      
      <!-- Loading Animation -->
      <div class="mb-6">
        <div v-if="type === 'connecting'" class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-orange-600/30 border-t-orange-600 mx-auto"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
            </svg>
          </div>
        </div>
        
        <div v-else-if="type === 'starting'" class="relative">
          <div class="animate-pulse">
            <div class="w-16 h-16 bg-green-600/30 rounded-full mx-auto flex items-center justify-center">
              <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div v-else class="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
      </div>
      
      <!-- Loading Text -->
      <h3 class="text-xl font-bold text-white mb-2">{{ title }}</h3>
      <p class="text-orange-200 text-sm mb-4">{{ message }}</p>
      
      <!-- Progress indicators -->
      <div v-if="showProgress" class="space-y-2">
        <div class="w-full bg-white/20 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full transition-all duration-1000"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="text-white/60 text-xs">{{ progressText }}</p>
      </div>
      
      <!-- Cancel button -->
      <button 
        v-if="showCancel"
        @click="$emit('cancel')"
        class="mt-4 text-orange-200 hover:text-white text-sm underline"
      >
        Abbrechen
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingScreen',
  props: {
    type: {
      type: String,
      default: 'default' // 'connecting', 'starting', 'loading'
    },
    title: {
      type: String,
      default: 'Lädt...'
    },
    message: {
      type: String,
      default: 'Einen Moment bitte...'
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0
    },
    progressText: {
      type: String,
      default: ''
    },
    showCancel: {
      type: Boolean,
      default: false
    }
  },
  emits: ['cancel']
}
</script>