<template>
  <div class="fixed top-4 right-4 z-50 flex items-center gap-2">
    <!-- Audio Toggle Button -->
    <button
      @click="toggleAudioEnabled"
      :class="[
        'p-3 rounded-lg border-2 transition-all duration-300 backdrop-blur-sm',
        isAudioEnabled 
          ? 'bg-green-600/30 border-green-400/50 hover:bg-green-600/50' 
          : 'bg-red-600/30 border-red-400/50 hover:bg-red-600/50'
      ]"
      :title="isAudioEnabled ? 'Audio ausschalten' : 'Audio einschalten'"
    >
      <!-- Audio On Icon (Custom) -->
      <img 
        v-if="isAudioEnabled" 
        :src="audioOnIcon" 
        alt="Audio an" 
        class="w-6 h-6"
      />
      
      <!-- Audio Off Icon (Custom) -->
      <img 
        v-else 
        :src="audioOffIcon" 
        alt="Audio aus" 
        class="w-6 h-6"
      />
    </button>

    <!-- Play/Pause Button (nur sichtbar wenn Audio läuft) -->
    <button
      v-if="isPlaying && isAudioEnabled"
      @click="toggleAudio"
      class="p-3 rounded-lg border-2 bg-blue-600/30 border-blue-400/50 hover:bg-blue-600/50 text-blue-300 transition-all duration-300 backdrop-blur-sm"
      title="Audio pausieren/fortsetzen"
    >
      <!-- Pause Icon wenn gerade spielt -->
      <svg v-if="isPlaying" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"></path>
      </svg>
      
      <!-- Play Icon wenn pausiert -->
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
    </button>

    <!-- Audio Status Indikator -->
    <div 
      v-if="isAudioEnabled && isPlaying"
      class="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20"
    >
      <div class="flex gap-1">
        <div class="w-1 h-4 bg-green-400 rounded-full animate-pulse"></div>
        <div class="w-1 h-3 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.1s"></div>
        <div class="w-1 h-5 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
        <div class="w-1 h-2 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.3s"></div>
      </div>
      <span class="text-white text-xs ml-2">🎵</span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import audioOnIcon from '../assets/audio_on.png'
import audioOffIcon from '../assets/audio_off.png'

export default {
  name: 'AudioControls',
  props: {
    isAudioEnabled: {
      type: Boolean,
      default: true
    },
    isPlaying: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-audio-enabled', 'toggle-audio'],
  setup() {
    return {
      audioOnIcon,
      audioOffIcon
    }
  },
  methods: {
    toggleAudioEnabled() {
      this.$emit('toggle-audio-enabled')
    },
    toggleAudio() {
      this.$emit('toggle-audio')
    }
  }
}
</script>

<style scoped>
/* Pulse Animation für Audio-Visualizer */
@keyframes pulse {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}

.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}
</style>