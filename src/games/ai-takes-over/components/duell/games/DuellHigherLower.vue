<template>
  <div class="higher-lower">
    <!-- Header -->
    <div class="game-header">
      <span class="game-icon">📈</span>
      <span class="game-title">HIGHER LOWER</span>
      <span class="round-indicator">Runde {{ currentRound }}/{{ totalRounds }}</span>
    </div>

    <!-- Current Turn Indicator -->
    <div class="turn-indicator">
      <span :class="['turn-label', { active: currentTurn === 'a' }]">
        {{ duellState?.playerA?.name }}
      </span>
      <span class="turn-vs">ist dran</span>
    </div>

    <!-- Cards Display -->
    <div class="cards-container">
      <!-- Known Card -->
      <div class="card known-card">
        <div class="card-category">{{ currentCard?.category }}</div>
        <div class="card-name">{{ currentCard?.name }}</div>
        <div class="card-volume">
          <span class="volume-label">Suchanfragen/Monat:</span>
          <span class="volume-value">{{ formatVolume(currentCard?.searchVolume) }}</span>
        </div>
      </div>

      <!-- VS Divider -->
      <div class="vs-divider">VS</div>

      <!-- Mystery Card -->
      <div class="card mystery-card" :class="{ revealed: phase === 'reveal' }">
        <div class="card-category">{{ nextCard?.category }}</div>
        <div class="card-name">{{ nextCard?.name }}</div>
        <div v-if="phase === 'reveal'" class="card-volume">
          <span class="volume-label">Suchanfragen/Monat:</span>
          <span class="volume-value">{{ formatVolume(nextCard?.searchVolume) }}</span>
        </div>
        <div v-else class="card-mystery">
          <span class="mystery-icon">?</span>
          <span class="mystery-text">Higher or Lower?</span>
        </div>
      </div>
    </div>

    <!-- Guessing Phase (Active Player) -->
    <div v-if="phase === 'guessing' && isActivePlayer" class="guessing-phase">
      <p class="guess-prompt">Hat "{{ nextCard?.name }}" mehr oder weniger Suchanfragen?</p>

      <div v-if="!hasGuessed" class="guess-buttons">
        <button class="guess-btn higher-btn" @click="submitGuess('higher')">
          <span class="guess-icon">⬆️</span>
          <span class="guess-label">HIGHER</span>
        </button>
        <button class="guess-btn lower-btn" @click="submitGuess('lower')">
          <span class="guess-icon">⬇️</span>
          <span class="guess-label">LOWER</span>
        </button>
      </div>

      <div v-else class="guessed-message">
        <span class="check-icon">✓</span>
        <span>Du hast {{ playerGuess === 'higher' ? 'HIGHER' : 'LOWER' }} gewählt</span>
      </div>
    </div>

    <!-- Waiting Phase (Non-Active Players) -->
    <div v-else-if="phase === 'guessing' && !isActivePlayer" class="waiting-phase">
      <div class="waiting-message">
        <span class="waiting-icon">⏳</span>
        <span>Warte auf {{ activePlayerName }}...</span>
      </div>

      <!-- Spectator Guess (Optional) -->
      <div v-if="isSpectator && !hasGuessed" class="spectator-guess">
        <p class="spectator-prompt">Was denkst du?</p>
        <div class="spectator-buttons">
          <button class="mini-btn higher" @click="submitSpectatorGuess('higher')">⬆️</button>
          <button class="mini-btn lower" @click="submitSpectatorGuess('lower')">⬇️</button>
        </div>
      </div>
    </div>

    <!-- Reveal Phase -->
    <div v-else-if="phase === 'reveal'" class="reveal-phase">
      <!-- Result Banner -->
      <div class="result-banner" :class="{ correct: lastGuessCorrect, wrong: !lastGuessCorrect }">
        <span class="result-icon">{{ lastGuessCorrect ? '✅' : '❌' }}</span>
        <span class="result-text">
          {{ lastGuessCorrect ? 'Richtig!' : 'Falsch!' }}
          {{ nextCard?.name }} hat {{ comparisonText }} Suchanfragen.
        </span>
      </div>

      <!-- Scores -->
      <div class="scores-display">
        <div class="score-card player-a" :class="{ active: currentTurn === 'a' }">
          <img :src="duellState?.playerA?.icon" class="player-avatar" />
          <span class="player-name">{{ duellState?.playerA?.name }}</span>
          <span class="player-score">{{ scores.a || 0 }}</span>
        </div>

        <div class="score-divider">:</div>

        <div class="score-card player-b" :class="{ active: currentTurn === 'b' }">
          <img :src="duellState?.playerB?.icon" class="player-avatar" />
          <span class="player-name">{{ duellState?.playerB?.name }}</span>
          <span class="player-score">{{ scores.b || 0 }}</span>
        </div>
      </div>

      <!-- Spectator Stats -->
      <div v-if="spectatorStats.total > 0" class="spectator-stats">
        <p class="stats-title">🎯 Zuschauer-Tipp-Quote</p>
        <p class="stats-text">
          {{ spectatorStats.correct }}/{{ spectatorStats.total }} haben richtig getippt
        </p>
      </div>

      <!-- Host Controls -->
      <div v-if="isHost" class="host-controls">
        <button v-if="currentRound < totalRounds" class="next-btn" @click="nextRound">
          Nächste Runde →
        </button>
        <button v-else class="finish-btn" @click="finishGame">
          Duell beenden
        </button>
      </div>
    </div>

    <!-- Streak Display -->
    <div v-if="streak > 0" class="streak-display">
      <span class="streak-fire">🔥</span>
      <span class="streak-count">{{ streak }} in Folge!</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'DuellHigherLower',
  props: {
    duellState: { type: Object, required: true },
    players: { type: Array, default: () => [] },
    currentPlayerId: { type: String, default: '' },
    isHost: { type: Boolean, default: false },
    gameData: { type: Object, default: null }
  },
  emits: ['submit-answer', 'game-complete', 'spectator-submit'],
  setup(props, { emit }) {
    const playerGuess = ref(null)
    const hasGuessed = ref(false)

    const phase = computed(() => props.gameData?.phase || 'guessing')
    const currentRound = computed(() => props.gameData?.currentRound || 1)
    const totalRounds = computed(() => props.gameData?.totalRounds || 10)
    const currentCard = computed(() => props.gameData?.currentCard)
    const nextCard = computed(() => props.gameData?.nextCard)
    const currentTurn = computed(() => props.gameData?.currentTurn || 'a')
    const scores = computed(() => props.gameData?.scores || { a: 0, b: 0 })
    const streak = computed(() => props.gameData?.streak || 0)
    const lastGuessCorrect = computed(() => props.gameData?.lastGuessCorrect)
    const spectatorGuesses = computed(() => props.gameData?.spectatorGuesses || {})

    const isSpectator = computed(() => {
      const playerAId = props.duellState?.playerA?.id
      const playerBId = props.duellState?.playerB?.id
      return props.currentPlayerId !== playerAId && props.currentPlayerId !== playerBId
    })

    const isActivePlayer = computed(() => {
      const activePlayerId = currentTurn.value === 'a'
        ? props.duellState?.playerA?.id
        : props.duellState?.playerB?.id
      return props.currentPlayerId === activePlayerId
    })

    const activePlayerName = computed(() => {
      return currentTurn.value === 'a'
        ? props.duellState?.playerA?.name
        : props.duellState?.playerB?.name
    })

    const comparisonText = computed(() => {
      if (!currentCard.value || !nextCard.value) return ''
      return nextCard.value.searchVolume > currentCard.value.searchVolume ? 'mehr' : 'weniger'
    })

    const spectatorStats = computed(() => {
      const guesses = Object.values(spectatorGuesses.value)
      const total = guesses.length
      const correctAnswer = nextCard.value?.searchVolume > currentCard.value?.searchVolume ? 'higher' : 'lower'
      const correct = guesses.filter(g => g === correctAnswer).length
      return { total, correct }
    })

    const formatVolume = (volume) => {
      if (!volume) return '???'
      if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
      if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K`
      return volume.toString()
    }

    const submitGuess = (guess) => {
      if (hasGuessed.value || !isActivePlayer.value) return

      playerGuess.value = guess
      emit('submit-answer', { guess })
      hasGuessed.value = true
    }

    const submitSpectatorGuess = (guess) => {
      if (hasGuessed.value) return

      playerGuess.value = guess
      emit('spectator-submit', { guess })
      hasGuessed.value = true
    }

    const nextRound = () => {
      hasGuessed.value = false
      playerGuess.value = null
      emit('game-complete', { action: 'next-round' })
    }

    const finishGame = () => {
      emit('game-complete', { action: 'finish' })
    }

    return {
      playerGuess,
      hasGuessed,
      phase,
      currentRound,
      totalRounds,
      currentCard,
      nextCard,
      currentTurn,
      scores,
      streak,
      lastGuessCorrect,
      spectatorGuesses,
      isSpectator,
      isActivePlayer,
      activePlayerName,
      comparisonText,
      spectatorStats,
      formatVolume,
      submitGuess,
      submitSpectatorGuess,
      nextRound,
      finishGame
    }
  }
}
</script>

<style scoped>
.higher-lower {
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.game-header {
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

.round-indicator {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}

.turn-indicator {
  text-align: center;
  margin-bottom: 20px;
  font-family: monospace;
}

.turn-label {
  font-size: 18px;
  font-weight: bold;
  color: var(--ai-pink, #ff00ff);
  padding: 4px 12px;
  background: rgba(255, 0, 255, 0.1);
  border-radius: 8px;
}

.turn-label.active {
  color: var(--ai-cyan, #00ffff);
  background: rgba(0, 255, 255, 0.1);
}

.turn-vs {
  color: var(--ai-text-muted, #8892b0);
  margin-left: 8px;
}

.cards-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  flex: 1;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.known-card {
  border-color: var(--ai-green, #00ff88);
}

.mystery-card {
  border-color: var(--ai-pink, #ff00ff);
}

.mystery-card.revealed {
  border-color: gold;
}

.card-category {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted, #8892b0);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.card-name {
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
}

.card-volume {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.volume-label {
  font-family: monospace;
  font-size: 10px;
  color: var(--ai-text-muted, #8892b0);
}

.volume-value {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
  color: gold;
}

.card-mystery {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.mystery-icon {
  font-size: 48px;
  animation: pulse 1.5s ease infinite;
}

.mystery-text {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-pink, #ff00ff);
}

.vs-divider {
  font-family: monospace;
  font-size: 20px;
  font-weight: bold;
  color: var(--ai-text-muted, #8892b0);
}

.guessing-phase, .waiting-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.guess-prompt {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-cyan, #00ffff);
  text-align: center;
}

.guess-buttons {
  display: flex;
  gap: 20px;
}

.guess-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 40px;
  border-radius: 16px;
  border: 3px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.4);
}

.higher-btn {
  border-color: var(--ai-green, #00ff88);
}

.higher-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
}

.lower-btn {
  border-color: var(--ai-red, #ff4444);
}

.lower-btn:hover {
  background: rgba(255, 68, 68, 0.2);
  transform: translateY(5px);
  box-shadow: 0 -10px 30px rgba(255, 68, 68, 0.3);
}

.guess-icon {
  font-size: 36px;
}

.guess-label {
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.higher-btn .guess-label { color: var(--ai-green, #00ff88); }
.lower-btn .guess-label { color: var(--ai-red, #ff4444); }

.guessed-message {
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

.waiting-message {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-text-muted, #8892b0);
}

.waiting-icon {
  font-size: 24px;
  animation: pulse 1.5s ease infinite;
}

.spectator-guess {
  text-align: center;
}

.spectator-prompt {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted, #8892b0);
  margin-bottom: 8px;
}

.spectator-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.mini-btn {
  padding: 8px 16px;
  font-size: 20px;
  border-radius: 8px;
  border: 2px solid;
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.2s;
}

.mini-btn.higher {
  border-color: var(--ai-green, #00ff88);
}

.mini-btn.lower {
  border-color: var(--ai-red, #ff4444);
}

.mini-btn:hover {
  transform: scale(1.1);
}

.reveal-phase {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  border-radius: 12px;
  font-family: monospace;
}

.result-banner.correct {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid rgba(0, 255, 0, 0.3);
}

.result-banner.wrong {
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid rgba(255, 0, 0, 0.3);
}

.result-icon {
  font-size: 32px;
}

.result-text {
  font-size: 16px;
  color: white;
}

.scores-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
}

.score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s;
}

.score-card.active {
  background: rgba(255, 255, 255, 0.1);
}

.player-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid;
}

.player-a .player-avatar { border-color: var(--ai-pink, #ff00ff); }
.player-b .player-avatar { border-color: var(--ai-cyan, #00ffff); }

.player-name {
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
}

.player-a .player-name { color: var(--ai-pink, #ff00ff); }
.player-b .player-name { color: var(--ai-cyan, #00ffff); }

.player-score {
  font-family: monospace;
  font-size: 32px;
  font-weight: bold;
  color: gold;
}

.score-divider {
  font-family: monospace;
  font-size: 32px;
  color: var(--ai-text-muted, #8892b0);
}

.spectator-stats {
  text-align: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
}

.stats-title {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-cyan, #00ffff);
  margin-bottom: 4px;
}

.stats-text {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted, #8892b0);
}

.host-controls {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.next-btn, .finish-btn {
  padding: 16px 32px;
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.next-btn {
  background: linear-gradient(135deg, var(--ai-cyan, #00ffff), var(--ai-purple, #9945ff));
  color: white;
}

.next-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
}

.finish-btn {
  background: linear-gradient(135deg, var(--ai-pink, #ff00ff), var(--ai-orange, #ff6600));
  color: white;
}

.finish-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
}

.streak-display {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 100, 0, 0.2);
  border: 2px solid orange;
  border-radius: 24px;
  font-family: monospace;
  animation: bounce 0.5s ease;
}

.streak-fire {
  font-size: 24px;
}

.streak-count {
  font-size: 16px;
  font-weight: bold;
  color: orange;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
