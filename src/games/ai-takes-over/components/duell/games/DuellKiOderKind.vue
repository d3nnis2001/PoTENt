<template>
  <div class="ki-oder-kind">
    <!-- Header -->
    <div class="game-header">
      <span class="game-icon">👶</span>
      <span class="game-title">KI ODER KIND?</span>
      <span class="round-indicator">{{ currentRound + 1 }}/{{ totalRounds }}</span>
    </div>

    <!-- Image Display -->
    <div class="image-container">
      <div class="image-wrapper" :class="{ 'reveal-mode': phase === 'reveal' }">
        <!-- Placeholder with description -->
        <div class="image-placeholder">
          <div class="placeholder-icon">🎨</div>
          <p class="placeholder-text">{{ currentImage?.description }}</p>
        </div>
      </div>

      <!-- Answer badge (after reveal) -->
      <div v-if="phase === 'reveal'" class="answer-badge" :class="currentImage?.answer">
        {{ currentImage?.answer === 'ai' ? '🤖 KI' : '👶 KIND' }}
      </div>
    </div>

    <!-- Voting Phase -->
    <div v-if="phase === 'voting'" class="voting-phase">
      <div class="vote-buttons">
        <button
          class="vote-btn ai-btn"
          :class="{ selected: playerVote === 'ai', disabled: hasVoted }"
          :disabled="hasVoted"
          @click="submitVote('ai')"
        >
          <span class="btn-icon">🤖</span>
          <span class="btn-label">KI</span>
        </button>

        <button
          class="vote-btn child-btn"
          :class="{ selected: playerVote === 'child', disabled: hasVoted }"
          :disabled="hasVoted"
          @click="submitVote('child')"
        >
          <span class="btn-icon">👶</span>
          <span class="btn-label">KIND</span>
        </button>
      </div>

      <div v-if="hasVoted" class="voted-message">
        <span class="check-icon">✓</span>
        <span>Du hast für {{ playerVote === 'ai' ? 'KI' : 'Kind' }} gestimmt!</span>
      </div>

      <!-- Voting progress -->
      <div class="voting-progress">
        <p class="progress-text">{{ votedCount }}/{{ totalPlayers }} haben gewählt</p>
      </div>
    </div>

    <!-- Reveal Phase -->
    <div v-else-if="phase === 'reveal'" class="reveal-phase">
      <p class="explanation">{{ currentImage?.explanation }}</p>

      <!-- Vote statistics -->
      <div class="vote-stats">
        <div class="stat-bar">
          <div class="stat-fill ai-fill" :style="{ width: aiPercentage + '%' }">
            🤖 {{ aiPercentage }}%
          </div>
          <div class="stat-fill child-fill" :style="{ width: childPercentage + '%' }">
            👶 {{ childPercentage }}%
          </div>
        </div>
      </div>

      <!-- Duelist Scores -->
      <div class="duelists-score">
        <div class="duelist player-a" :class="{ correct: playerACorrect }">
          <img :src="duellState?.playerA?.icon" class="duelist-avatar" />
          <span class="duelist-name">{{ duellState?.playerA?.name }}</span>
          <span class="duelist-points">{{ scores[duellState?.playerA?.id] || 0 }}/{{ currentRound + 1 }}</span>
          <span v-if="playerACorrect" class="correct-badge">✓</span>
        </div>

        <div class="score-divider">:</div>

        <div class="duelist player-b" :class="{ correct: playerBCorrect }">
          <img :src="duellState?.playerB?.icon" class="duelist-avatar" />
          <span class="duelist-name">{{ duellState?.playerB?.name }}</span>
          <span class="duelist-points">{{ scores[duellState?.playerB?.id] || 0 }}/{{ currentRound + 1 }}</span>
          <span v-if="playerBCorrect" class="correct-badge">✓</span>
        </div>
      </div>

      <!-- Your result (if you voted) -->
      <div v-if="playerVote" class="your-result" :class="{ correct: isPlayerCorrect }">
        {{ isPlayerCorrect ? '✓ Richtig!' : '✗ Leider falsch!' }}
      </div>
    </div>

    <!-- Host Controls -->
    <div v-if="isHost" class="host-controls">
      <button v-if="phase === 'voting'" class="control-btn" @click="forceReveal">
        Jetzt auflösen
      </button>
      <button v-if="phase === 'reveal' && currentRound < totalRounds - 1" class="control-btn" @click="nextRound">
        Nächstes Bild →
      </button>
      <button v-if="phase === 'reveal' && currentRound >= totalRounds - 1" class="control-btn finish" @click="finishGame">
        Duell beenden
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'DuellKiOderKind',
  props: {
    duellState: { type: Object, required: true },
    players: { type: Array, default: () => [] },
    currentPlayerId: { type: String, default: '' },
    isHost: { type: Boolean, default: false },
    gameData: { type: Object, default: null }
  },
  emits: ['submit-answer', 'game-complete', 'spectator-submit'],
  setup(props, { emit }) {
    const playerVote = ref(null)
    const hasVoted = ref(false)

    const phase = computed(() => props.gameData?.phase || 'voting')
    const currentRound = computed(() => props.gameData?.currentRound || 0)
    const totalRounds = computed(() => props.gameData?.images?.length || 5)
    const currentImage = computed(() => props.gameData?.images?.[currentRound.value])
    const votes = computed(() => props.gameData?.votes || {})
    const scores = computed(() => props.gameData?.scores || {})

    const isSpectator = computed(() => {
      return props.currentPlayerId !== props.duellState?.playerA?.id &&
             props.currentPlayerId !== props.duellState?.playerB?.id
    })

    const votedCount = computed(() => Object.keys(votes.value).length)
    const totalPlayers = computed(() => props.players.length)

    const aiVotes = computed(() =>
      Object.values(votes.value).filter(v => v === 'ai').length
    )
    const childVotes = computed(() =>
      Object.values(votes.value).filter(v => v === 'child').length
    )

    const aiPercentage = computed(() => {
      const total = aiVotes.value + childVotes.value
      return total > 0 ? Math.round((aiVotes.value / total) * 100) : 50
    })

    const childPercentage = computed(() => 100 - aiPercentage.value)

    const playerAVote = computed(() => votes.value[props.duellState?.playerA?.id])
    const playerBVote = computed(() => votes.value[props.duellState?.playerB?.id])

    const playerACorrect = computed(() =>
      playerAVote.value === currentImage.value?.answer
    )
    const playerBCorrect = computed(() =>
      playerBVote.value === currentImage.value?.answer
    )

    const isPlayerCorrect = computed(() =>
      playerVote.value === currentImage.value?.answer
    )

    const submitVote = (vote) => {
      if (hasVoted.value) return

      playerVote.value = vote
      hasVoted.value = true

      if (isSpectator.value) {
        emit('spectator-submit', { vote, round: currentRound.value })
      } else {
        emit('submit-answer', { vote, round: currentRound.value })
      }
    }

    const forceReveal = () => {
      emit('game-complete', { action: 'reveal' })
    }

    const nextRound = () => {
      playerVote.value = null
      hasVoted.value = false
      emit('game-complete', { action: 'next-round' })
    }

    const finishGame = () => {
      emit('game-complete', { action: 'finish' })
    }

    return {
      playerVote,
      hasVoted,
      phase,
      currentRound,
      totalRounds,
      currentImage,
      votes,
      scores,
      isSpectator,
      votedCount,
      totalPlayers,
      aiPercentage,
      childPercentage,
      playerACorrect,
      playerBCorrect,
      isPlayerCorrect,
      submitVote,
      forceReveal,
      nextRound,
      finishGame
    }
  }
}
</script>

<style scoped>
.ki-oder-kind {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.game-icon {
  font-size: 28px;
}

.game-title {
  font-family: monospace;
  font-size: 18px;
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

.image-container {
  position: relative;
  margin-bottom: 24px;
}

.image-wrapper {
  aspect-ratio: 4/3;
  background: rgba(0, 0, 0, 0.6);
  border: 3px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.image-wrapper.reveal-mode {
  border-color: gold;
}

.image-placeholder {
  text-align: center;
  padding: 20px;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.placeholder-text {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-text-muted, #8892b0);
}

.answer-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  padding: 8px 16px;
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  border-radius: 20px;
  animation: popIn 0.3s ease;
}

.answer-badge.ai {
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  color: white;
}

.answer-badge.child {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: black;
}

@keyframes popIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.voting-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.vote-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
}

.vote-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 3px solid;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: all 0.3s;
}

.ai-btn {
  border-color: #9333ea;
}

.child-btn {
  border-color: #f59e0b;
}

.vote-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.vote-btn.selected {
  transform: scale(1.05);
}

.ai-btn.selected {
  background: rgba(147, 51, 234, 0.3);
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.4);
}

.child-btn.selected {
  background: rgba(245, 158, 11, 0.3);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 36px;
}

.btn-label {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
}

.ai-btn .btn-label { color: #9333ea; }
.child-btn .btn-label { color: #f59e0b; }

.voted-message {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 14px;
  color: #00ff00;
}

.voting-progress {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted, #8892b0);
}

.reveal-phase {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.explanation {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
  text-align: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}

.vote-stats {
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}

.stat-bar {
  display: flex;
  height: 32px;
  border-radius: 16px;
  overflow: hidden;
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
}

.stat-fill {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.5s ease;
}

.ai-fill {
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  color: white;
}

.child-fill {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: black;
}

.duelists-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 12px;
}

.duelist {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.duelist.correct {
  opacity: 1;
}

.duelist:not(.correct) {
  opacity: 0.5;
}

.duelist-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid;
}

.player-a .duelist-avatar { border-color: var(--ai-pink, #ff00ff); }
.player-b .duelist-avatar { border-color: var(--ai-cyan, #00ffff); }

.duelist-name {
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
}

.player-a .duelist-name { color: var(--ai-pink, #ff00ff); }
.player-b .duelist-name { color: var(--ai-cyan, #00ffff); }

.duelist-points {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.correct-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #00ff00;
  color: black;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.score-divider {
  font-family: monospace;
  font-size: 24px;
  color: var(--ai-text-muted, #8892b0);
}

.your-result {
  text-align: center;
  padding: 12px;
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
}

.your-result.correct {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  color: #00ff00;
}

.your-result:not(.correct) {
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid #ff0000;
  color: #ff0000;
}

.host-controls {
  margin-top: 24px;
  text-align: center;
}

.control-btn {
  padding: 12px 24px;
  font-family: monospace;
  font-size: 14px;
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid var(--ai-cyan, #00ffff);
  border-radius: 8px;
  color: var(--ai-cyan, #00ffff);
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(0, 255, 255, 0.2);
}

.control-btn.finish {
  border-color: gold;
  color: gold;
  background: rgba(255, 215, 0, 0.1);
}
</style>
