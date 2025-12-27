<template>
  <div 
    v-if="showStatus"
    :class="[
      'fixed bottom-4 left-4 z-50 px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-all',
      statusClasses
    ]"
  >
    <div :class="['w-2 h-2 rounded-full', dotClasses]"></div>
    <span>{{ statusText }}</span>
    
    <button 
      v-if="connectionStatus === 'disconnected'"
      @click="$emit('retry')"
      class="ml-2 text-xs underline hover:no-underline"
    >
      Erneut versuchen
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ConnectionStatus',
  props: {
    connectionStatus: {
      type: String,
      default: 'connected'
    },
    autoHide: {
      type: Boolean,
      default: true
    }
  },
  emits: ['retry'],
  setup(props) {
    const showStatus = computed(() => {
      if (!props.autoHide) return true
      return props.connectionStatus !== 'connected'
    })
    
    const statusClasses = computed(() => {
      switch (props.connectionStatus) {
        case 'connected':
          return 'bg-green-600/20 border-green-400/30 text-green-300'
        case 'connecting':
          return 'bg-yellow-600/20 border-yellow-400/30 text-yellow-300'
        case 'disconnected':
          return 'bg-red-600/20 border-red-400/30 text-red-300'
        default:
          return 'bg-gray-600/20 border-gray-400/30 text-gray-300'
      }
    })
    
    const dotClasses = computed(() => {
      switch (props.connectionStatus) {
        case 'connected':
          return 'bg-green-400'
        case 'connecting':
          return 'bg-yellow-400 animate-pulse'
        case 'disconnected':
          return 'bg-red-400'
        default:
          return 'bg-gray-400'
      }
    })
    
    const statusText = computed(() => {
      switch (props.connectionStatus) {
        case 'connected':
          return 'Verbunden'
        case 'connecting':
          return 'Verbinde...'
        case 'disconnected':
          return 'Verbindung verloren'
        default:
          return 'Unbekannt'
      }
    })
    
    return {
      showStatus,
      statusClasses,
      dotClasses,
      statusText
    }
  }
}
</script>