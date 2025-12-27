<template>
  <div class="max-w-2xl mx-auto">
    <!-- Main Lobby Card -->
    <div class="cyber-card p-8 mb-6 relative">
      <!-- Scanlines -->
      <div class="scanlines"></div>

      <!-- Corner decorations -->
      <div class="corner-decoration top-left"></div>
      <div class="corner-decoration top-right"></div>
      <div class="corner-decoration bottom-left"></div>
      <div class="corner-decoration bottom-right"></div>

      <!-- QR Code & Info - Zentriert -->
      <div class="relative z-10 flex flex-col items-center">
        <AiQRCodeSection
          :lobby-code="lobbyCode"
          :join-url="joinUrl"
        />

        <!-- Player Counter -->
        <div class="player-counter px-3 py-1 rounded-lg font-mono text-sm mt-4">
          <span class="text-cyan-500">{{ playerList.length }}</span>
          <span class="text-cyan-300 ml-2">Spieler online</span>
        </div>
      </div>

      <!-- Player Names -->
      <div v-if="playerList.length > 0" class="relative z-10 mt-4">
        <div class="flex flex-wrap justify-center gap-2">
          <div
            v-for="player in playerList"
            :key="player.id"
            class="player-badge px-2 py-1 rounded font-mono text-xs"
          >
            {{ player.name }}
          </div>
        </div>
      </div>

      <!-- Bob's waiting message -->
      <div class="relative z-10 mt-4 text-center">
        <div class="bob-message inline-block px-4 py-2 rounded-lg font-mono text-xs">
          <span class="text-cyan-500">BOB:</span>
          <span class="text-cyan-300 ml-2">"{{ currentBobMessage }}"</span>
          <span class="cursor-blink">_</span>
        </div>
      </div>
    </div>

    <!-- Start Button -->
    <div class="text-center">
      <button
        @click="$emit('start-game')"
        :disabled="isStartingGame || playerList.length < 4"
        class="start-button py-4 px-16 rounded font-bold text-lg font-mono tracking-widest transition-all duration-300 uppercase"
        :class="{ 'loading': isStartingGame }"
      >
        <span class="button-content flex items-center justify-center gap-3">
          <span v-if="isStartingGame" class="flex items-center gap-2">
            <span class="loading-dot"></span>
            LOADING
          </span>
          <span v-else>&gt;&gt; START &lt;&lt;</span>
        </span>
      </button>
      <!-- Min players hint -->
      <p v-if="playerList.length < 4" class="text-pink-500 font-mono text-xs mt-2">
        {{ t('lobby.minPlayersRequired', { count: 4 - playerList.length }) }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import AiQRCodeSection from './AiQRCodeSection.vue'

export default {
  name: 'AiLobbyWaitingArea',
  components: {
    AiQRCodeSection
  },
  props: {
    lobbyCode: {
      type: String,
      required: true
    },
    joinUrl: {
      type: String,
      required: true
    },
    playerList: {
      type: Array,
      required: true
    },
    playerCount: {
      type: Number,
      required: true
    },
    isStartingGame: {
      type: Boolean,
      default: false
    }
  },
  emits: ['start-game'],
  setup() {
    const { t, randomMessage } = useI18n()

    const currentBobMessage = ref(randomMessage('bob.lobbyMessages'))
    let messageInterval = null

    const cycleBobMessage = () => {
      currentBobMessage.value = randomMessage('bob.lobbyMessages')
    }

    onMounted(() => {
      messageInterval = setInterval(cycleBobMessage, 5000)
    })

    onUnmounted(() => {
      if (messageInterval) {
        clearInterval(messageInterval)
      }
    })

    return {
      t,
      currentBobMessage
    }
  }
}
</script>

<style scoped>
/* Uses global ai-card, ai-corner, ai-scanlines, ai-btn classes from theme.css */
.cyber-card {
  background: var(--ai-card-bg);
  border: 1px solid var(--ai-border);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--ai-shadow-glow), inset 0 0 100px rgba(var(--ai-cyan-rgb), 0.03);
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px);
  pointer-events: none;
  z-index: 1;
}

.corner-decoration {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(var(--ai-cyan-rgb), 0.5);
  z-index: 2;
}
.corner-decoration.top-left { top: 10px; left: 10px; border-right: none; border-bottom: none; }
.corner-decoration.top-right { top: 10px; right: 10px; border-left: none; border-bottom: none; }
.corner-decoration.bottom-left { bottom: 10px; left: 10px; border-right: none; border-top: none; }
.corner-decoration.bottom-right { bottom: 10px; right: 10px; border-left: none; border-top: none; }

.player-counter {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--ai-border);
}

.player-badge {
  background: rgba(var(--ai-cyan-rgb), 0.1);
  border: 1px solid rgba(var(--ai-cyan-rgb), 0.4);
  color: var(--ai-cyan);
}

.bob-message {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(var(--ai-cyan-rgb), 0.2);
  border-left: 3px solid rgba(var(--ai-cyan-rgb), 0.8);
}

.cursor-blink {
  animation: blink 1s step-end infinite;
  color: var(--ai-cyan);
}

@keyframes blink { 50% { opacity: 0; } }

.start-button {
  background: transparent;
  border: 2px solid var(--ai-cyan);
  color: var(--ai-cyan);
  position: relative;
  overflow: hidden;
  text-shadow: var(--ai-text-glow);
  box-shadow: var(--ai-shadow-glow), inset 0 0 20px rgba(var(--ai-cyan-rgb), 0.1);
}

.start-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--ai-cyan-rgb), 0.4), transparent);
  transition: left var(--ai-transition-slow);
}

.start-button:hover:not(:disabled)::before { left: 100%; }

.start-button:hover:not(:disabled) {
  background: rgba(var(--ai-cyan-rgb), 0.15);
  box-shadow: var(--ai-shadow-glow-intense), inset 0 0 30px rgba(var(--ai-cyan-rgb), 0.2);
}

.start-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: rgba(var(--ai-cyan-rgb), 0.3);
}

.start-button .button-content { position: relative; z-index: 1; }

.loading-dot {
  width: 8px;
  height: 8px;
  background: var(--ai-cyan);
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
</style>
