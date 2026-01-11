<template>
  <div class="schaetz-duell">
    <!-- Question Display -->
    <div class="question-container">
      <div class="question-header">
        <span class="game-icon">📊</span>
        <span class="game-title">SCHÄTZ-DUELL</span>
      </div>
      <p class="question-text">{{ currentQuestion?.question }}</p>
      <p v-if="currentQuestion?.hint" class="question-hint">💡 {{ currentQuestion.hint }}</p>
    </div>

    <!-- Input Phase -->
    <div v-if="phase === 'input'" class="input-phase">
      <div class="input-container">
        <input
          v-model="playerEstimate"
          type="number"
          class="estimate-input"
          placeholder="Deine Schätzung..."
          :disabled="hasSubmitted"
          @keyup.enter="submitEstimate"
        />
        <span class="unit-label">{{ currentQuestion?.unit }}</span>
      </div>

      <button
        v-if="!hasSubmitted"
        class="submit-btn"
        :disabled="!playerEstimate"
        @click="submitEstimate"
      >
        SCHÄTZEN
      </button>

      <div v-else class="submitted-message">
        <span class="check-icon">✓</span>
        <span>Deine Schätzung: {{ formatNumber(playerEstimate) }} {{ currentQuestion?.unit }}</span>
      </div>

      <!-- Waiting for others -->
      <div class="waiting-status">
        <p class="waiting-text">{{ submittedCount }}/{{ totalPlayers }} haben geschätzt</p>
        <div class="waiting-dots">
          <span v-for="i in totalPlayers" :key="i" :class="['dot', { filled: i <= submittedCount }]" />
        </div>
      </div>
    </div>

    <!-- Reveal Phase -->
    <div v-else-if="phase === 'reveal'" class="reveal-phase">
      <div class="answer-reveal">
        <p class="answer-label">Die richtige Antwort ist:</p>
        <p class="answer-value">{{ formatNumber(currentQuestion?.answer) }} {{ currentQuestion?.unit }}</p>
      </div>

      <!-- Duellists results -->
      <div class="duelists-results">
        <div class="duelist-result player-a">
          <img :src="duellState?.playerA?.icon" class="duelist-avatar" />
          <span class="duelist-name">{{ duellState?.playerA?.name }}</span>
          <span class="duelist-estimate">{{ formatNumber(estimates[duellState?.playerA?.id]) }}</span>
          <span class="duelist-diff" :class="{ winner: isCloser('a') }">
            {{ getDifferenceText(estimates[duellState?.playerA?.id]) }}
          </span>
        </div>

        <div class="vs-divider">VS</div>

        <div class="duelist-result player-b">
          <img :src="duellState?.playerB?.icon" class="duelist-avatar" />
          <span class="duelist-name">{{ duellState?.playerB?.name }}</span>
          <span class="duelist-estimate">{{ formatNumber(estimates[duellState?.playerB?.id]) }}</span>
          <span class="duelist-diff" :class="{ winner: isCloser('b') }">
            {{ getDifferenceText(estimates[duellState?.playerB?.id]) }}
          </span>
        </div>
      </div>

      <!-- Spectator leaderboard -->
      <div v-if="spectatorResults.length > 0" class="spectator-results">
        <h4 class="spectator-title">🏆 Beste Zuschauer-Schätzungen</h4>
        <div class="spectator-list">
          <div
            v-for="(result, index) in spectatorResults.slice(0, 3)"
            :key="result.playerId"
            class="spectator-item"
          >
            <span class="rank">{{ index + 1 }}.</span>
            <span class="name">{{ result.name }}</span>
            <span class="estimate">{{ formatNumber(result.estimate) }}</span>
            <span class="diff">{{ getDifferenceText(result.estimate) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Host Controls -->
    <div v-if="isHost && phase === 'input'" class="host-controls">
      <button class="force-reveal-btn" @click="forceReveal">
        Jetzt auflösen
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'DuellSchaetzDuell',
  props: {
    duellState: { type: Object, required: true },
    players: { type: Array, default: () => [] },
    currentPlayerId: { type: String, default: '' },
    isHost: { type: Boolean, default: false },
    gameData: { type: Object, default: null }
  },
  emits: ['submit-answer', 'game-complete', 'spectator-submit'],
  setup(props, { emit }) {
    const playerEstimate = ref('')
    const hasSubmitted = ref(false)

    const phase = computed(() => props.gameData?.phase || 'input')
    const currentQuestion = computed(() => props.gameData?.question)
    const estimates = computed(() => props.gameData?.estimates || {})

    const isSpectator = computed(() => {
      const playerAId = props.duellState?.playerA?.id
      const playerBId = props.duellState?.playerB?.id
      return props.currentPlayerId !== playerAId && props.currentPlayerId !== playerBId
    })

    const submittedCount = computed(() => Object.keys(estimates.value).length)
    const totalPlayers = computed(() => props.players.length)

    const spectatorResults = computed(() => {
      if (!currentQuestion.value) return []

      const playerAId = props.duellState?.playerA?.id
      const playerBId = props.duellState?.playerB?.id

      return Object.entries(estimates.value)
        .filter(([id]) => id !== playerAId && id !== playerBId)
        .map(([id, estimate]) => {
          const player = props.players.find(p => p.id === id)
          return {
            playerId: id,
            name: player?.name || 'Unbekannt',
            estimate,
            diff: Math.abs(estimate - currentQuestion.value.answer)
          }
        })
        .sort((a, b) => a.diff - b.diff)
    })

    const formatNumber = (num) => {
      if (!num) return '-'
      return num.toLocaleString('de-DE')
    }

    const getDifferenceText = (estimate) => {
      if (!estimate || !currentQuestion.value) return ''
      const diff = Math.abs(estimate - currentQuestion.value.answer)
      const percent = Math.round((diff / currentQuestion.value.answer) * 100)
      return `${diff > estimate ? '+' : ''}${formatNumber(diff)} (${percent}% daneben)`
    }

    const isCloser = (player) => {
      const answer = currentQuestion.value?.answer
      if (!answer) return false

      const estimateA = estimates.value[props.duellState?.playerA?.id]
      const estimateB = estimates.value[props.duellState?.playerB?.id]

      if (!estimateA || !estimateB) return false

      const diffA = Math.abs(estimateA - answer)
      const diffB = Math.abs(estimateB - answer)

      return player === 'a' ? diffA < diffB : diffB < diffA
    }

    const submitEstimate = () => {
      if (!playerEstimate.value || hasSubmitted.value) return

      const estimate = parseFloat(playerEstimate.value)

      if (isSpectator.value) {
        emit('spectator-submit', { estimate })
      } else {
        emit('submit-answer', { estimate })
      }

      hasSubmitted.value = true
    }

    const forceReveal = () => {
      emit('game-complete', { action: 'force-reveal' })
    }

    return {
      playerEstimate,
      hasSubmitted,
      phase,
      currentQuestion,
      estimates,
      isSpectator,
      submittedCount,
      totalPlayers,
      spectatorResults,
      formatNumber,
      getDifferenceText,
      isCloser,
      submitEstimate,
      forceReveal
    }
  }
}
</script>

<style scoped>
.schaetz-duell {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.question-container {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
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

.question-text {
  font-family: monospace;
  font-size: 18px;
  color: white;
  line-height: 1.5;
}

.question-hint {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
  margin-top: 12px;
}

.input-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 300px;
}

.estimate-input {
  flex: 1;
  padding: 16px;
  font-family: monospace;
  font-size: 24px;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 12px;
  color: white;
  outline: none;
  transition: border-color 0.3s;
}

.estimate-input:focus {
  border-color: var(--ai-cyan, #00ffff);
}

.estimate-input:disabled {
  opacity: 0.5;
}

.unit-label {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
}

.submit-btn {
  padding: 16px 48px;
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, var(--ai-pink, #ff00ff), var(--ai-cyan, #00ffff));
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submitted-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 12px;
  font-family: monospace;
  color: #00ff00;
}

.check-icon {
  font-size: 24px;
}

.waiting-status {
  text-align: center;
  margin-top: 20px;
}

.waiting-text {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
  margin-bottom: 12px;
}

.waiting-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.3s;
}

.dot.filled {
  background: var(--ai-cyan, #00ffff);
  box-shadow: 0 0 10px var(--ai-cyan, #00ffff);
}

.reveal-phase {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.answer-reveal {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  border: 2px solid gold;
  border-radius: 16px;
}

.answer-label {
  font-family: monospace;
  font-size: 14px;
  color: gold;
  margin-bottom: 8px;
}

.answer-value {
  font-family: monospace;
  font-size: 32px;
  font-weight: bold;
  color: gold;
}

.duelists-results {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
}

.duelist-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.duelist-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid;
}

.player-a .duelist-avatar {
  border-color: var(--ai-pink, #ff00ff);
}

.player-b .duelist-avatar {
  border-color: var(--ai-cyan, #00ffff);
}

.duelist-name {
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
}

.player-a .duelist-name { color: var(--ai-pink, #ff00ff); }
.player-b .duelist-name { color: var(--ai-cyan, #00ffff); }

.duelist-estimate {
  font-family: monospace;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.duelist-diff {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted, #8892b0);
}

.duelist-diff.winner {
  color: gold;
  font-weight: bold;
}

.vs-divider {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(180deg, var(--ai-pink, #ff00ff), var(--ai-cyan, #00ffff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.spectator-results {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--ai-border, #1e3a5f);
  border-radius: 12px;
  padding: 16px;
}

.spectator-title {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-cyan, #00ffff);
  margin-bottom: 12px;
  text-align: center;
}

.spectator-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spectator-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
}

.spectator-item .rank {
  color: gold;
  font-weight: bold;
}

.spectator-item .name {
  flex: 1;
  color: white;
}

.spectator-item .estimate {
  color: var(--ai-cyan, #00ffff);
}

.spectator-item .diff {
  color: var(--ai-text-muted, #8892b0);
}

.host-controls {
  margin-top: 24px;
  text-align: center;
}

.force-reveal-btn {
  padding: 12px 24px;
  font-family: monospace;
  font-size: 14px;
  background: rgba(255, 165, 0, 0.2);
  border: 2px solid orange;
  border-radius: 8px;
  color: orange;
  cursor: pointer;
}

.force-reveal-btn:hover {
  background: rgba(255, 165, 0, 0.3);
}
</style>
