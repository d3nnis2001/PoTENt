<template>
  <div class="flex-shrink-0 text-center">
    <!-- QR Code -->
    <div class="bg-white p-4 rounded-lg mb-4 inline-block">
      <canvas ref="qrCanvas" class="max-w-full"></canvas>
    </div>
    
    <!-- Lobby Code klein darunter -->
    <div class="text-2xl font-bold text-orange-300 tracking-wider mb-3">{{ lobbyCode }}</div>
    <button
      @click="$emit('copy-lobby-code')"
      class="bg-orange-600/30 text-orange-200 px-4 py-2 rounded-lg hover:bg-orange-600/50 transition-colors text-sm mb-4"
    >
      Code kopieren
    </button>
    
    <!-- Join Link -->
    <div class="mt-4">
      <div class="text-sm text-orange-200 mb-2">Link:</div>
      <div class="bg-black/30 rounded-lg p-3 text-white text-sm break-all mb-2 max-w-xs">
        {{ joinUrl }}
      </div>
      <button
        @click="$emit('copy-join-url')"
        class="text-xs bg-blue-600/30 text-blue-200 px-3 py-1 rounded hover:bg-blue-600/50 transition-colors"
      >
        Link kopieren
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import QRCode from 'qrcode'

export default {
  name: 'QRCodeSection',
  props: {
    lobbyCode: {
      type: String,
      required: true
    },
    joinUrl: {
      type: String,
      required: true
    }
  },
  emits: ['copy-lobby-code', 'copy-join-url'],
  setup(props) {
    const qrCanvas = ref(null)
    
    const generateQRCode = async () => {
      if (!qrCanvas.value || !props.joinUrl) return
      
      try {
        await QRCode.toCanvas(qrCanvas.value, props.joinUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      } catch (error) {
        console.error('QR Code Fehler:', error)
      }
    }
    
    // Generate QR code when component mounts or joinUrl changes
    watch(() => props.joinUrl, async () => {
      if (props.joinUrl) {
        await nextTick()
        generateQRCode()
      }
    }, { immediate: true })
    
    return {
      qrCanvas
    }
  }
}
</script>