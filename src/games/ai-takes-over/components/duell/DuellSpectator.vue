<template>
  <div class="duell-spectator min-h-screen ai-mobile-bg p-4">
    <!-- Header -->
    <div class="header text-center mb-6">
      <div class="duell-badge">DUELL</div>
      <h2 class="text-xl font-mono font-bold text-cyan-400 mt-2">
        {{ duellState?.game?.name || 'DUELL' }}
      </h2>
    </div>

    <!-- VS Display -->
    <div class="vs-container mb-6">
      <div class="player player-a">
        <div class="player-avatar">
          <img :src="duellState?.playerA?.icon" :alt="duellState?.playerA?.name" />
        </div>
        <div class="player-name">{{ duellState?.playerA?.name || 'Spieler A' }}</div>
        <div v-if="isCurrentPlayerA" class="you-badge">DU</div>
      </div>

      <div class="vs-text">VS</div>

      <div class="player player-b">
        <div class="player-avatar">
          <img :src="duellState?.playerB?.icon" :alt="duellState?.playerB?.name" />
        </div>
        <div class="player-name">{{ duellState?.playerB?.name || 'Spieler B' }}</div>
        <div v-if="isCurrentPlayerB" class="you-badge">DU</div>
      </div>
    </div>

    <!-- Spectator Message -->
    <div v-if="!isInDuell" class="spectator-message">
      <div class="spectator-icon">👀</div>
      <p class="spectator-text">Du schaust zu...</p>
      <p class="spectator-subtext">Schau auf den Hauptbildschirm!</p>
    </div>

    <!-- Active Duelist Message -->
    <div v-else class="duelist-message">
      <div class="duelist-icon">⚔️</div>
      <p class="duelist-text">Du bist im Duell!</p>
      <p class="duelist-subtext">Schau auf den Hauptbildschirm für Anweisungen</p>
    </div>

    <!-- Winner Display -->
    <div v-if="duellState?.phase === 'results' && duellState?.winner" class="winner-display">
      <div class="winner-icon">🏆</div>
      <h3 class="winner-title">GEWINNER</h3>
      <div class="winner-name">
        {{ winnerName }}
      </div>
      <div v-if="isWinner" class="winner-you">DAS BIST DU!</div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'DuellSpectator',
  props: {
    duellState: {
      type: Object,
      default: null
    },
    currentPlayerId: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const isCurrentPlayerA = computed(() => {
      return props.duellState?.playerA?.id === props.currentPlayerId
    })

    const isCurrentPlayerB = computed(() => {
      return props.duellState?.playerB?.id === props.currentPlayerId
    })

    const isInDuell = computed(() => {
      return isCurrentPlayerA.value || isCurrentPlayerB.value
    })

    const winnerName = computed(() => {
      if (!props.duellState?.winner) return ''
      if (props.duellState.winner === props.duellState.playerA?.id) {
        return props.duellState.playerA.name
      }
      return props.duellState.playerB?.name || ''
    })

    const isWinner = computed(() => {
      return props.duellState?.winner === props.currentPlayerId
    })

    return {
      isCurrentPlayerA,
      isCurrentPlayerB,
      isInDuell,
      winnerName,
      isWinner
    }
  }
}
</script>

<style scoped>
.duell-spectator {
  background: linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #1a1a3a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.duell-badge {
  display: inline-block;
  padding: 4px 16px;
  background: linear-gradient(135deg, var(--ai-pink, #ff00ff), var(--ai-cyan, #00ffff));
  border-radius: 20px;
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
  color: white;
  letter-spacing: 2px;
}

.vs-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
}

.player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.player-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid;
}

.player-a .player-avatar {
  border-color: var(--ai-pink, #ff00ff);
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.4);
}

.player-b .player-avatar {
  border-color: var(--ai-cyan, #00ffff);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-name {
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.player-a .player-name {
  color: var(--ai-pink, #ff00ff);
}

.player-b .player-name {
  color: var(--ai-cyan, #00ffff);
}

.you-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--ai-cyan, #00ffff);
  color: black;
  font-family: monospace;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
}

.vs-text {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(180deg, var(--ai-pink, #ff00ff), var(--ai-cyan, #00ffff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.spectator-message,
.duelist-message {
  text-align: center;
  padding: 30px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
  margin-top: 20px;
}

.spectator-icon,
.duelist-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.spectator-text,
.duelist-text {
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  margin-bottom: 8px;
}

.spectator-subtext,
.duelist-subtext {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
}

.duelist-message {
  border-color: var(--ai-pink, #ff00ff);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.2);
}

.duelist-text {
  color: var(--ai-pink, #ff00ff);
}

.winner-display {
  margin-top: 30px;
  text-align: center;
  padding: 30px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid gold;
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
  animation: winnerAppear 0.5s ease;
}

@keyframes winnerAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.winner-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.winner-title {
  font-family: monospace;
  font-size: 14px;
  color: gold;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.winner-name {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
  color: gold;
  text-transform: uppercase;
}

.winner-you {
  margin-top: 12px;
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
