<template>
  <div class="flex-shrink-0 text-center">
    <!-- Join URL über QR Code -->
    <div class="text-cyan-500/60 text-xs font-mono mb-2 break-all max-w-xs mx-auto">
      {{ joinUrl }}
    </div>

    <!-- QR Code Container -->
    <div class="qr-container p-1 rounded-lg inline-block mb-3">
      <div class="bg-black p-2 rounded">
        <canvas ref="qrCanvas" class="max-w-full"></canvas>
      </div>
    </div>

    <!-- Lobby Code -->
    <div class="lobby-code text-2xl font-bold tracking-[0.3em] font-mono">
      {{ lobbyCode }}
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import QRCode from 'qrcode'

export default {
  name: 'AiQRCodeSection',
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
  emits: [],
  setup(props) {
    const qrCanvas = ref(null)

    const generateQRCode = async () => {
      if (!qrCanvas.value || !props.joinUrl) return

      try {
        await QRCode.toCanvas(qrCanvas.value, props.joinUrl, {
          width: 180,
          margin: 2,
          color: {
            dark: '#00ffff',
            light: '#000000'
          }
        })
      } catch (error) {
        console.error('QR Code Fehler:', error)
      }
    }

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

<style scoped>
.qr-container {
  background: linear-gradient(135deg, var(--ai-cyan), var(--ai-pink));
  box-shadow:
    0 0 30px rgba(var(--ai-cyan-rgb), 0.4),
    0 0 60px rgba(var(--ai-pink-rgb), 0.2);
  animation: qr-glow 2s ease-in-out infinite alternate;
}

@keyframes qr-glow {
  from {
    box-shadow:
      0 0 30px rgba(var(--ai-cyan-rgb), 0.4),
      0 0 60px rgba(var(--ai-pink-rgb), 0.2);
  }
  to {
    box-shadow:
      0 0 40px rgba(var(--ai-cyan-rgb), 0.6),
      0 0 80px rgba(var(--ai-pink-rgb), 0.3);
  }
}

.lobby-code {
  color: var(--ai-cyan);
  text-shadow: var(--ai-text-glow), 0 0 40px rgba(var(--ai-cyan-rgb), 0.2);
}
</style>
