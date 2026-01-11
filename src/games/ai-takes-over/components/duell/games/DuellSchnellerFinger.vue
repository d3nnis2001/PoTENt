<template>
  <div class="schneller-finger">
    <!-- Header -->
    <div class="game-header">
      <span class="game-icon">⌨️</span>
      <span class="game-title">SCHNELLER FINGER</span>
    </div>

    <!-- Countdown Phase -->
    <div v-if="phase === 'countdown'" class="countdown-phase">
      <div class="countdown-display">
        <span class="countdown-number">{{ countdown }}</span>
      </div>
      <p class="countdown-text">Bereitet euch vor!</p>
    </div>

    <!-- Racing Phase -->
    <div v-if="phase === 'racing'" class="racing-phase">
      <!-- Timer -->
      <div class="timer-bar">
        <div class="timer-fill" :style="{ width: timerPercent + '%' }" />
        <span class="timer-text">{{ remainingTime }}s</span>
      </div>

      <!-- Text to Type -->
      <div class="text-display">
        <span
          v-for="(char, index) in targetText"
          :key="index"
          :class="getCharClass(index)"
        >{{ char === ' ' ? '␣' : char }}</span>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <textarea
          ref="inputField"
          v-model="typedText"
          class="type-input"
          :disabled="hasFinished"
          placeholder="Tippe hier..."
          @input="onInput"
          @keydown.prevent.enter
        />
      </div>

      <!-- Progress Bars -->
      <div class="progress-section">
        <div class="player-progress player-a">
          <img :src="duellState?.playerA?.icon" class="progress-avatar" />
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: getProgressPercent('a') + '%' }" />
          </div>
          <span class="progress-percent">{{ getProgressPercent('a') }}%</span>
        </div>

        <div class="player-progress player-b">
          <img :src="duellState?.playerB?.icon" class="progress-avatar" />
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: getProgressPercent('b') + '%' }" />
          </div>
          <span class="progress-percent">{{ getProgressPercent('b') }}%</span>
        </div>
      </div>

      <!-- Status -->
      <div v-if="hasFinished" class="finished-status">
        <span class="check-icon">✓</span>
        <span>Fertig! Warte auf anderen Spieler...</span>
      </div>
    </div>

    <!-- Results Phase -->
    <div v-else-if="phase === 'results'" class="results-phase">
      <!-- Winner Banner -->
      <div class="winner-banner">
        <span class="winner-icon">🏆</span>
        <span class="winner-text">{{ winnerName }} gewinnt!</span>
      </div>

      <!-- Detailed Results -->
      <div class="results-grid">
        <div class="result-card player-a" :class="{ winner: winner === 'a' }">
          <img :src="duellState?.playerA?.icon" class="result-avatar" />
          <span class="result-name">{{ duellState?.playerA?.name }}</span>
          <div class="result-stats">
            <div class="stat">
              <span class="stat-label">Zeit</span>
              <span class="stat-value">{{ formatTime(results.a?.time) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">WPM</span>
              <span class="stat-value">{{ results.a?.wpm || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Genauigkeit</span>
              <span class="stat-value">{{ results.a?.accuracy || 0 }}%</span>
            </div>
          </div>
          <div v-if="winner === 'a'" class="winner-badge">🥇</div>
        </div>

        <div class="result-card player-b" :class="{ winner: winner === 'b' }">
          <img :src="duellState?.playerB?.icon" class="result-avatar" />
          <span class="result-name">{{ duellState?.playerB?.name }}</span>
          <div class="result-stats">
            <div class="stat">
              <span class="stat-label">Zeit</span>
              <span class="stat-value">{{ formatTime(results.b?.time) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">WPM</span>
              <span class="stat-value">{{ results.b?.wpm || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Genauigkeit</span>
              <span class="stat-value">{{ results.b?.accuracy || 0 }}%</span>
            </div>
          </div>
          <div v-if="winner === 'b'" class="winner-badge">🥇</div>
        </div>
      </div>

      <!-- Spectator Leaderboard -->
      <div v-if="spectatorResults.length > 0" class="spectator-leaderboard">
        <h4 class="leaderboard-title">🏅 Zuschauer-Bestzeiten</h4>
        <div class="leaderboard-list">
          <div
            v-for="(result, index) in spectatorResults.slice(0, 5)"
            :key="result.playerId"
            class="leaderboard-item"
          >
            <span class="rank">{{ index + 1 }}.</span>
            <span class="name">{{ result.name }}</span>
            <span class="wpm">{{ result.wpm }} WPM</span>
            <span class="accuracy">{{ result.accuracy }}%</span>
          </div>
        </div>
      </div>

      <!-- Host Controls -->
      <div v-if="isHost" class="host-controls">
        <button class="finish-btn" @click="finishGame">
          Duell beenden
        </button>
      </div>
    </div>

    <!-- Spectator View (can also race!) -->
    <div v-if="isSpectator && phase === 'racing' && !spectatorFinished" class="spectator-race">
      <div class="spectator-badge">👁️ Zuschauer-Modus</div>
      <p class="spectator-hint">Du kannst auch mittippen für das Leaderboard!</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

export default {
  name: 'DuellSchnellerFinger',
  props: {
    duellState: { type: Object, required: true },
    players: { type: Array, default: () => [] },
    currentPlayerId: { type: String, default: '' },
    isHost: { type: Boolean, default: false },
    gameData: { type: Object, default: null }
  },
  emits: ['submit-answer', 'game-complete', 'spectator-submit'],
  setup(props, { emit }) {
    const inputField = ref(null)
    const typedText = ref('')
    const hasFinished = ref(false)
    const spectatorFinished = ref(false)
    const startTime = ref(null)
    const localTimer = ref(0)
    let timerInterval = null

    const phase = computed(() => props.gameData?.phase || 'countdown')
    const countdown = computed(() => props.gameData?.countdown || 3)
    const targetText = computed(() => props.gameData?.targetText || '')
    const timeLimit = computed(() => props.gameData?.timeLimit || 60)
    const progress = computed(() => props.gameData?.progress || {})
    const results = computed(() => props.gameData?.results || {})
    const winner = computed(() => props.gameData?.winner)

    const isSpectator = computed(() => {
      const playerAId = props.duellState?.playerA?.id
      const playerBId = props.duellState?.playerB?.id
      return props.currentPlayerId !== playerAId && props.currentPlayerId !== playerBId
    })

    const remainingTime = computed(() => {
      return Math.max(0, timeLimit.value - localTimer.value)
    })

    const timerPercent = computed(() => {
      return (remainingTime.value / timeLimit.value) * 100
    })

    const winnerName = computed(() => {
      if (winner.value === 'a') return props.duellState?.playerA?.name
      if (winner.value === 'b') return props.duellState?.playerB?.name
      return 'Unentschieden'
    })

    const spectatorResults = computed(() => {
      if (!props.gameData?.spectatorResults) return []
      return Object.entries(props.gameData.spectatorResults)
        .map(([id, data]) => {
          const player = props.players.find(p => p.id === id)
          return {
            playerId: id,
            name: player?.name || 'Unbekannt',
            ...data
          }
        })
        .sort((a, b) => (b.wpm || 0) - (a.wpm || 0))
    })

    const getCharClass = (index) => {
      if (index >= typedText.value.length) return 'char-pending'
      if (typedText.value[index] === targetText.value[index]) return 'char-correct'
      return 'char-wrong'
    }

    const getProgressPercent = (player) => {
      const playerId = player === 'a'
        ? props.duellState?.playerA?.id
        : props.duellState?.playerB?.id
      return progress.value[playerId] || 0
    }

    const calculateStats = () => {
      const endTime = Date.now()
      const timeInSeconds = (endTime - startTime.value) / 1000
      const words = targetText.value.split(' ').length
      const wpm = Math.round((words / timeInSeconds) * 60)

      let correctChars = 0
      for (let i = 0; i < typedText.value.length; i++) {
        if (typedText.value[i] === targetText.value[i]) correctChars++
      }
      const accuracy = Math.round((correctChars / targetText.value.length) * 100)

      return { time: timeInSeconds, wpm, accuracy }
    }

    const onInput = () => {
      if (hasFinished.value) return

      // Calculate and emit progress
      const progressPercent = Math.round((typedText.value.length / targetText.value.length) * 100)

      if (isSpectator.value) {
        emit('spectator-submit', { progress: progressPercent })
      } else {
        emit('submit-answer', { progress: progressPercent })
      }

      // Check if finished
      if (typedText.value.length >= targetText.value.length) {
        const stats = calculateStats()

        if (isSpectator.value) {
          spectatorFinished.value = true
          emit('spectator-submit', { finished: true, ...stats })
        } else {
          hasFinished.value = true
          emit('submit-answer', { finished: true, ...stats })
        }
      }
    }

    const formatTime = (seconds) => {
      if (!seconds) return '--'
      return seconds.toFixed(2) + 's'
    }

    const finishGame = () => {
      emit('game-complete', { action: 'finish' })
    }

    // Start timer when racing begins
    watch(() => props.gameData?.phase, (newPhase) => {
      if (newPhase === 'racing') {
        startTime.value = Date.now()
        localTimer.value = 0

        timerInterval = setInterval(() => {
          localTimer.value++
          if (localTimer.value >= timeLimit.value) {
            clearInterval(timerInterval)
            if (!hasFinished.value && !isSpectator.value) {
              const stats = calculateStats()
              emit('submit-answer', { finished: true, timeout: true, ...stats })
              hasFinished.value = true
            }
          }
        }, 1000)

        // Focus input
        nextTick(() => {
          if (inputField.value) {
            inputField.value.focus()
          }
        })
      }
    })

    // Auto-focus when phase changes to racing
    watch(() => phase.value, (newPhase) => {
      if (newPhase === 'racing') {
        nextTick(() => {
          if (inputField.value) {
            inputField.value.focus()
          }
        })
      }
    })

    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    })

    return {
      inputField,
      typedText,
      hasFinished,
      spectatorFinished,
      phase,
      countdown,
      targetText,
      timeLimit,
      progress,
      results,
      winner,
      isSpectator,
      remainingTime,
      timerPercent,
      winnerName,
      spectatorResults,
      getCharClass,
      getProgressPercent,
      onInput,
      formatTime,
      finishGame
    }
  }
}
</script>

<style scoped>
.schneller-finger {
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.game-icon {
  font-size: 32px;
}

.game-title {
  font-family: monospace;
  font-size: 20px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  letter-spacing: 2px;
}

/* Countdown Phase */
.countdown-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.countdown-display {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--ai-cyan, #00ffff);
  border-radius: 50%;
  animation: pulse 1s ease infinite;
}

.countdown-number {
  font-family: monospace;
  font-size: 64px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
}

.countdown-text {
  font-family: monospace;
  font-size: 18px;
  color: var(--ai-text-muted, #8892b0);
  margin-top: 20px;
}

/* Racing Phase */
.racing-phase {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timer-bar {
  position: relative;
  height: 24px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ai-cyan, #00ffff), var(--ai-green, #00ff88));
  transition: width 1s linear;
}

.timer-text {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.text-display {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 12px;
  padding: 20px;
  font-family: monospace;
  font-size: 18px;
  line-height: 1.8;
  word-wrap: break-word;
}

.char-pending {
  color: var(--ai-text-muted, #8892b0);
}

.char-correct {
  color: var(--ai-green, #00ff88);
}

.char-wrong {
  color: var(--ai-red, #ff4444);
  background: rgba(255, 0, 0, 0.2);
  border-radius: 2px;
}

.input-area {
  position: relative;
}

.type-input {
  width: 100%;
  height: 100px;
  padding: 16px;
  font-family: monospace;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-cyan, #00ffff);
  border-radius: 12px;
  color: white;
  resize: none;
  outline: none;
}

.type-input:focus {
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.type-input:disabled {
  opacity: 0.5;
  border-color: var(--ai-border, #1e3a5f);
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid;
}

.player-a .progress-avatar { border-color: var(--ai-pink, #ff00ff); }
.player-b .progress-avatar { border-color: var(--ai-cyan, #00ffff); }

.progress-bar-container {
  flex: 1;
  height: 16px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.player-a .progress-bar {
  background: linear-gradient(90deg, var(--ai-pink, #ff00ff), rgba(255, 0, 255, 0.5));
}

.player-b .progress-bar {
  background: linear-gradient(90deg, var(--ai-cyan, #00ffff), rgba(0, 255, 255, 0.5));
}

.progress-percent {
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  color: white;
  min-width: 40px;
  text-align: right;
}

.finished-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 12px;
  font-family: monospace;
  color: #00ff00;
}

.check-icon {
  font-size: 24px;
}

/* Results Phase */
.results-phase {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.winner-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  border: 2px solid gold;
  border-radius: 16px;
}

.winner-icon {
  font-size: 48px;
}

.winner-text {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
  color: gold;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.result-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
}

.result-card.winner {
  border-color: gold;
  background: rgba(255, 215, 0, 0.1);
}

.result-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid;
}

.player-a .result-avatar { border-color: var(--ai-pink, #ff00ff); }
.player-b .result-avatar { border-color: var(--ai-cyan, #00ffff); }

.result-name {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
}

.player-a .result-name { color: var(--ai-pink, #ff00ff); }
.player-b .result-name { color: var(--ai-cyan, #00ffff); }

.result-stats {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat {
  display: flex;
  justify-content: space-between;
  font-family: monospace;
  font-size: 14px;
}

.stat-label {
  color: var(--ai-text-muted, #8892b0);
}

.stat-value {
  color: white;
  font-weight: bold;
}

.winner-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  font-size: 32px;
}

.spectator-leaderboard {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--ai-border, #1e3a5f);
  border-radius: 12px;
  padding: 16px;
}

.leaderboard-title {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-cyan, #00ffff);
  margin-bottom: 12px;
  text-align: center;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
}

.leaderboard-item .rank {
  color: gold;
  font-weight: bold;
  min-width: 24px;
}

.leaderboard-item .name {
  flex: 1;
  color: white;
}

.leaderboard-item .wpm {
  color: var(--ai-cyan, #00ffff);
}

.leaderboard-item .accuracy {
  color: var(--ai-green, #00ff88);
  min-width: 40px;
  text-align: right;
}

.host-controls {
  display: flex;
  justify-content: center;
}

.finish-btn {
  padding: 16px 32px;
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, var(--ai-pink, #ff00ff), var(--ai-orange, #ff6600));
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.finish-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
}

/* Spectator View */
.spectator-race {
  text-align: center;
  padding: 12px;
  margin-top: 16px;
}

.spectator-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 165, 0, 0.2);
  border: 1px solid orange;
  border-radius: 12px;
  font-family: monospace;
  font-size: 12px;
  color: orange;
  margin-bottom: 8px;
}

.spectator-hint {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted, #8892b0);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
