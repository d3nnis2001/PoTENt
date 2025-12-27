<template>
  <div class="max-w-md mx-auto">
    <!-- Main Setup Card -->
    <div class="cyber-card p-6 mb-6">
      <!-- Scanline Effect -->
      <div class="scanlines"></div>

      <div class="relative z-10">
        <!-- Header with glitch effect -->
        <h2 class="text-xl font-bold text-cyan-400 mb-6 font-mono tracking-wider glitch-text">
          <span class="text-pink-500">&gt;</span> {{ t('lobby.setup.title') }}
        </h2>

        <div class="space-y-5">
          <!-- Host Name Input -->
          <div>
            <label class="block text-cyan-300 font-mono text-sm mb-2 tracking-wide">
              <span class="text-pink-500">{{ t('lobby.setup.subtitle') }}</span>
            </label>
            <div class="relative">
              <input
                v-model="hostName"
                type="text"
                maxlength="20"
                class="w-full px-4 py-3 bg-black/60 border-2 border-cyan-500/50 rounded-lg text-cyan-100 placeholder-cyan-700 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] font-mono transition-all duration-300"
                :placeholder="t('lobby.setup.namePlaceholder')"
                required
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500/50 font-mono text-xs">
                {{ hostName.length }}/20
              </div>
            </div>
          </div>

          <!-- Start Button -->
          <button
            @click="$emit('create-lobby', hostName)"
            :disabled="!hostName.trim() || isCreatingLobby || !gameLoaded"
            class="cyber-button w-full py-4 px-6 font-bold text-lg font-mono tracking-wider transition-all duration-300"
            :class="{ 'loading': isCreatingLobby }"
          >
            <span class="button-content flex items-center justify-center gap-3">
              <svg v-if="isCreatingLobby" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span v-if="isCreatingLobby">{{ t('lobby.setup.creating') }}</span>
              <span v-else-if="!gameLoaded">LADE_SYSTEM...</span>
              <span v-else>{{ t('lobby.setup.createButton') }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bob Info Card -->
    <div class="cyber-card p-4">
      <div class="scanlines"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
            <span class="text-2xl">🤖</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-cyan-400 font-mono">{{ t('lobby.setup.bobInfo.name') }}</h3>
            <p class="text-cyan-600 text-xs font-mono">{{ t('lobby.setup.bobInfo.subtitle') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="cyber-stat">
            <div class="text-2xl text-cyan-400 mb-1 font-mono">4</div>
            <div class="text-xs text-cyan-600 font-mono">{{ t('lobby.setup.bobInfo.stats.disciplines') }}</div>
          </div>
          <div class="cyber-stat">
            <div class="text-2xl text-pink-400 mb-1 font-mono">∞</div>
            <div class="text-xs text-pink-600 font-mono">{{ t('lobby.setup.bobInfo.stats.chaos') }}</div>
          </div>
          <div class="cyber-stat">
            <div class="text-2xl text-purple-400 mb-1 font-mono">99%</div>
            <div class="text-xs text-purple-600 font-mono">{{ t('lobby.setup.bobInfo.stats.sarcasm') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'

export default {
  name: 'AiLobbySetupForm',
  props: {
    isCreatingLobby: {
      type: Boolean,
      default: false
    },
    gameLoaded: {
      type: Boolean,
      default: true
    }
  },
  emits: ['create-lobby'],
  setup() {
    const { t } = useI18n()
    const hostName = ref('Host')

    return {
      t,
      hostName
    }
  }
}
</script>

<style scoped>
.cyber-card {
  background: linear-gradient(135deg, rgba(0, 10, 20, 0.9), rgba(0, 20, 40, 0.8));
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.1),
    inset 0 0 60px rgba(0, 255, 255, 0.05);
}

.cyber-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 1;
}

.cyber-button {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2));
  border: 2px solid rgba(0, 255, 255, 0.5);
  color: #00ffff;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.cyber-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3));
  opacity: 0;
  transition: opacity 0.3s;
}

.cyber-button:hover:not(:disabled)::before {
  opacity: 1;
}

.cyber-button:hover:not(:disabled) {
  border-color: rgba(0, 255, 255, 0.8);
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.4),
    0 0 40px rgba(255, 0, 255, 0.2);
  transform: translateY(-2px);
}

.cyber-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cyber-button .button-content {
  position: relative;
  z-index: 1;
}

.cyber-stat {
  padding: 8px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.glitch-text {
  animation: glitch 3s infinite;
}

@keyframes glitch {
  0%, 90%, 100% {
    transform: translate(0);
    text-shadow:
      2px 0 #ff00ff,
      -2px 0 #00ffff;
  }
  92% {
    transform: translate(-2px, 1px);
    text-shadow:
      4px 0 #ff00ff,
      -4px 0 #00ffff;
  }
  94% {
    transform: translate(2px, -1px);
    text-shadow:
      -2px 0 #ff00ff,
      2px 0 #00ffff;
  }
  96% {
    transform: translate(0);
  }
}
</style>
