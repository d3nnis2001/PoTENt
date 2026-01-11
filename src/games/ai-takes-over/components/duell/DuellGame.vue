<template>
  <div class="duell-game">
    <!-- Loading state -->
    <div v-if="!gameReady" class="loading-state">
      <div class="loading-icon">⏳</div>
      <p class="loading-text">Spiel wird geladen...</p>
    </div>

    <!-- Dynamic game component -->
    <component
      v-else
      :is="currentGameComponent"
      :duell-state="duellState"
      :players="players"
      :current-player-id="currentPlayerId"
      :is-host="isHost"
      :game-data="gameData"
      @submit-answer="handleSubmitAnswer"
      @game-complete="handleGameComplete"
      @spectator-submit="handleSpectatorSubmit"
    />
  </div>
</template>

<script>
import { computed, defineAsyncComponent } from 'vue'

// Lazy load game components
const DuellSchaetzDuell = defineAsyncComponent(() =>
  import('./games/DuellSchaetzDuell.vue')
)
const DuellKiOderKind = defineAsyncComponent(() =>
  import('./games/DuellKiOderKind.vue')
)
const DuellTuringTest = defineAsyncComponent(() =>
  import('./games/DuellTuringTest.vue')
)
const DuellHigherLower = defineAsyncComponent(() =>
  import('./games/DuellHigherLower.vue')
)
const DuellSchnellerFinger = defineAsyncComponent(() =>
  import('./games/DuellSchnellerFinger.vue')
)
const DuellBobsCaptcha = defineAsyncComponent(() =>
  import('./games/DuellBobsCaptcha.vue')
)

// Fallback component for unknown games
const DuellFallback = {
  template: `
    <div class="duell-fallback">
      <div class="fallback-icon">🎮</div>
      <p class="fallback-text">Unbekanntes Spiel: {{ gameId }}</p>
    </div>
  `,
  props: ['gameId']
}

export default {
  name: 'DuellGame',
  components: {
    DuellSchaetzDuell,
    DuellKiOderKind,
    DuellTuringTest,
    DuellHigherLower,
    DuellSchnellerFinger,
    DuellBobsCaptcha,
    DuellFallback
  },
  props: {
    duellState: {
      type: Object,
      required: true
    },
    players: {
      type: Array,
      default: () => []
    },
    currentPlayerId: {
      type: String,
      default: ''
    },
    isHost: {
      type: Boolean,
      default: false
    },
    gameData: {
      type: Object,
      default: null
    }
  },
  emits: ['submit-answer', 'game-complete', 'spectator-submit'],
  setup(props, { emit }) {
    // Map game IDs to components
    const gameComponentMap = {
      'schaetz-duell': 'DuellSchaetzDuell',
      'ki-oder-kind': 'DuellKiOderKind',
      'turing-test': 'DuellTuringTest',
      'higher-lower': 'DuellHigherLower',
      'schneller-finger': 'DuellSchnellerFinger',
      'bobs-captcha': 'DuellBobsCaptcha'
    }

    const gameReady = computed(() => {
      return props.duellState?.game?.id && props.duellState?.phase === 'playing'
    })

    const currentGameComponent = computed(() => {
      const gameId = props.duellState?.game?.id
      return gameComponentMap[gameId] || 'DuellFallback'
    })

    const handleSubmitAnswer = (data) => {
      emit('submit-answer', data)
    }

    const handleGameComplete = (data) => {
      emit('game-complete', data)
    }

    const handleSpectatorSubmit = (data) => {
      emit('spectator-submit', data)
    }

    return {
      gameReady,
      currentGameComponent,
      handleSubmitAnswer,
      handleGameComplete,
      handleSpectatorSubmit
    }
  }
}
</script>

<style scoped>
.duell-game {
  width: 100%;
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
}

.loading-icon {
  font-size: 48px;
  animation: pulse 1.5s ease infinite;
}

.loading-text {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-cyan, #00ffff);
}

.duell-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid rgba(255, 0, 0, 0.3);
  border-radius: 16px;
  padding: 40px;
}

.fallback-icon {
  font-size: 48px;
}

.fallback-text {
  font-family: monospace;
  font-size: 16px;
  color: #ff6666;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
}
</style>
