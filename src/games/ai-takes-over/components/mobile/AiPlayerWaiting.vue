<template>
  <div class="player-waiting">
    <!-- Scanlines -->
    <div class="ai-scanlines"></div>

    <!-- Content -->
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
      <!-- Character Display -->
      <div class="character-display mb-8">
        <div class="character-frame">
          <img :src="player.icon" alt="Your Character" class="character-img" />
        </div>
        <div class="character-name mt-4">
          <span class="name-label">&gt;</span>
          <span class="name-text">{{ player.name }}</span>
        </div>
      </div>

      <!-- Connection Info -->
      <div class="connection-info mb-8">
        <div class="info-line">
          <span class="info-label">{{ t('mobile.waiting.lobbyLabel') }}</span>
          <span class="info-value">{{ lobbyCode }}</span>
        </div>
        <div class="info-line">
          <span class="info-label">{{ t('mobile.waiting.statusLabel') }}</span>
          <span class="status-badge" :class="{ 'connected': isConnected }">
            <span class="status-dot"></span>
            {{ isConnected ? t('mobile.waiting.connected') : t('mobile.waiting.disconnected') }}
          </span>
        </div>
        <div class="info-line">
          <span class="info-label">{{ t('mobile.waiting.playersLabel') }}</span>
          <span class="info-value">{{ playerCount }}</span>
        </div>
      </div>

      <!-- Waiting Message -->
      <div class="waiting-message">
        <div class="message-box">
          <span class="message-icon">&gt;</span>
          <span class="message-text">{{ currentMessage }}</span>
          <span class="ai-cursor">_</span>
        </div>
      </div>

      <!-- Glitch Effect on Character (subtle) -->
      <div class="glitch-overlay"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'

export default {
  name: 'AiPlayerWaiting',
  props: {
    player: {
      type: Object,
      required: true
    },
    lobbyCode: {
      type: String,
      required: true
    },
    playerCount: {
      type: Number,
      default: 0
    },
    isConnected: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const { t, randomMessage } = useI18n()

    const currentMessage = ref(randomMessage('mobile.waiting.messages'))
    let messageInterval = null

    const cycleMessage = () => {
      currentMessage.value = randomMessage('mobile.waiting.messages')
    }

    onMounted(() => {
      messageInterval = setInterval(cycleMessage, 4000)
    })

    onUnmounted(() => {
      if (messageInterval) clearInterval(messageInterval)
    })

    return {
      t,
      currentMessage
    }
  }
}
</script>

<style scoped>
.player-waiting {
  background: var(--ai-bg-dark);
  position: relative;
  min-height: 100vh;
}

.ai-scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px);
  pointer-events: none;
  z-index: 1;
}

/* Character Display */
.character-display {
  text-align: center;
}

.character-frame {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.6);
  border: 3px solid var(--ai-cyan);
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--ai-shadow-glow-intense);
  animation: float 3s ease-in-out infinite;
  position: relative;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.character-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.character-name {
  font-family: monospace;
  font-size: 20px;
}

.name-label {
  color: var(--ai-pink);
}

.name-text {
  color: var(--ai-cyan);
  text-shadow: var(--ai-text-glow);
  margin-left: 8px;
}

/* Connection Info */
.connection-info {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  padding: 16px 24px;
  width: 100%;
  max-width: 280px;
}

.info-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: monospace;
  font-size: 12px;
  margin-bottom: 8px;
}

.info-line:last-child {
  margin-bottom: 0;
}

.info-label {
  color: var(--ai-text-muted);
}

.info-value {
  color: var(--ai-cyan);
  letter-spacing: 0.1em;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ff6b6b;
}

.status-badge.connected {
  color: #27ca40;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Waiting Message */
.waiting-message {
  margin-top: 20px;
}

.message-box {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--ai-border);
  border-left: 3px solid var(--ai-cyan);
  border-radius: 4px;
  padding: 12px 16px;
  font-family: monospace;
  font-size: 13px;
}

.message-icon {
  color: var(--ai-cyan);
  margin-right: 8px;
}

.message-text {
  color: var(--ai-text-muted);
}

.ai-cursor {
  color: var(--ai-cyan);
  animation: blink 1s step-end infinite;
  margin-left: 4px;
}

@keyframes blink { 50% { opacity: 0; } }

/* Glitch Overlay */
.glitch-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: glitch-flash 8s infinite;
  opacity: 0;
}

@keyframes glitch-flash {
  0%, 95%, 100% { opacity: 0; }
  96% {
    opacity: 0.1;
    background: var(--ai-cyan);
    transform: translateX(-2px);
  }
  97% {
    opacity: 0;
  }
  98% {
    opacity: 0.1;
    background: var(--ai-pink);
    transform: translateX(2px);
  }
}
</style>
