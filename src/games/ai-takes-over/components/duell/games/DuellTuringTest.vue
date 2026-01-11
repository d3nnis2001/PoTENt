<template>
  <div class="turing-test">
    <!-- Question Header -->
    <div class="question-header">
      <span class="game-icon">🤖</span>
      <span class="game-title">TURING TEST</span>
      <span class="round-indicator">Runde {{ currentRound }}/{{ totalRounds }}</span>
    </div>

    <!-- Text Display -->
    <div class="text-container">
      <div class="text-type-badge">{{ currentText?.type }}</div>
      <div class="text-content">
        <p>{{ currentText?.text }}</p>
      </div>
    </div>

    <!-- Voting Phase -->
    <div v-if="phase === 'voting'" class="voting-phase">
      <p class="voting-prompt">Wer hat diesen Text geschrieben?</p>

      <div v-if="!hasVoted" class="vote-buttons">
        <button class="vote-btn human-btn" @click="submitVote('human')">
          <span class="vote-icon">👤</span>
          <span class="vote-label">MENSCH</span>
        </button>
        <button class="vote-btn ai-btn" @click="submitVote('ai')">
          <span class="vote-icon">🤖</span>
          <span class="vote-label">KI</span>
        </button>
      </div>

      <div v-else class="voted-message">
        <span class="check-icon">✓</span>
        <span>Du hast für {{ playerVote === 'human' ? 'MENSCH' : 'KI' }} gestimmt</span>
      </div>

      <!-- Waiting status -->
      <div class="waiting-status">
        <p class="waiting-text">{{ votedCount }}/{{ totalPlayers }} haben abgestimmt</p>
        <div class="waiting-dots">
          <span v-for="i in totalPlayers" :key="i" :class="['dot', { filled: i <= votedCount }]" />
        </div>
      </div>

      <!-- Host controls -->
      <div v-if="isHost" class="host-controls">
        <button class="force-reveal-btn" @click="forceReveal">
          Jetzt auflösen
        </button>
      </div>
    </div>

    <!-- Reveal Phase -->
    <div v-else-if="phase === 'reveal'" class="reveal-phase">
      <!-- Correct Answer -->
      <div class="answer-reveal">
        <p class="answer-label">Der Text wurde geschrieben von:</p>
        <div class="answer-badge" :class="currentText?.author">
          <span class="answer-icon">{{ currentText?.author === 'human' ? '👤' : '🤖' }}</span>
          <span class="answer-text">{{ currentText?.author === 'human' ? 'MENSCH' : 'KI' }}</span>
        </div>
        <p v-if="currentText?.explanation" class="answer-explanation">
          {{ currentText.explanation }}
        </p>
      </div>

      <!-- Vote Statistics -->
      <div class="vote-stats">
        <div class="stat-bar">
          <div class="stat-label human">
            <span class="icon">👤</span>
            <span>{{ humanVotePercent }}%</span>
          </div>
          <div class="bar-container">
            <div class="bar human-bar" :style="{ width: humanVotePercent + '%' }" />
            <div class="bar ai-bar" :style="{ width: aiVotePercent + '%' }" />
          </div>
          <div class="stat-label ai">
            <span>{{ aiVotePercent }}%</span>
            <span class="icon">🤖</span>
          </div>
        </div>
      </div>

      <!-- Duellists Results -->
      <div class="duelists-results">
        <div class="duelist-result player-a" :class="{ correct: isCorrect('a'), wrong: !isCorrect('a') }">
          <img :src="duellState?.playerA?.icon" class="duelist-avatar" />
          <span class="duelist-name">{{ duellState?.playerA?.name }}</span>
          <span class="duelist-vote">
            {{ getPlayerVoteText(duellState?.playerA?.id) }}
          </span>
          <span class="result-icon">{{ isCorrect('a') ? '✓' : '✗' }}</span>
        </div>

        <div class="score-display">
          <span class="score">{{ scores.a || 0 }}</span>
          <span class="vs">:</span>
          <span class="score">{{ scores.b || 0 }}</span>
        </div>

        <div class="duelist-result player-b" :class="{ correct: isCorrect('b'), wrong: !isCorrect('b') }">
          <img :src="duellState?.playerB?.icon" class="duelist-avatar" />
          <span class="duelist-name">{{ duellState?.playerB?.name }}</span>
          <span class="duelist-vote">
            {{ getPlayerVoteText(duellState?.playerB?.id) }}
          </span>
          <span class="result-icon">{{ isCorrect('b') ? '✓' : '✗' }}</span>
        </div>
      </div>

      <!-- Spectator Results -->
      <div v-if="spectatorResults.length > 0" class="spectator-results">
        <h4 class="spectator-title">🎯 Zuschauer-Ergebnisse</h4>
        <div class="spectator-grid">
          <div
            v-for="result in spectatorResults"
            :key="result.playerId"
            class="spectator-item"
            :class="{ correct: result.correct }"
          >
            <span class="name">{{ result.name }}</span>
            <span class="vote">{{ result.vote === 'human' ? '👤' : '🤖' }}</span>
            <span class="result">{{ result.correct ? '✓' : '✗' }}</span>
          </div>
        </div>
      </div>

      <!-- Host controls for next round -->
      <div v-if="isHost" class="host-controls">
        <button v-if="currentRound < totalRounds" class="next-btn" @click="nextRound">
          Nächste Runde →
        </button>
        <button v-else class="finish-btn" @click="finishGame">
          Duell beenden
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'DuellTuringTest',
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
    const currentRound = computed(() => props.gameData?.currentRound || 1)
    const totalRounds = computed(() => props.gameData?.totalRounds || 5)
    const currentText = computed(() => props.gameData?.currentText)
    const votes = computed(() => props.gameData?.votes || {})
    const scores = computed(() => props.gameData?.scores || { a: 0, b: 0 })

    const isSpectator = computed(() => {
      const playerAId = props.duellState?.playerA?.id
      const playerBId = props.duellState?.playerB?.id
      return props.currentPlayerId !== playerAId && props.currentPlayerId !== playerBId
    })

    const votedCount = computed(() => Object.keys(votes.value).length)
    const totalPlayers = computed(() => props.players.length)

    const humanVotePercent = computed(() => {
      const total = Object.values(votes.value).length
      if (total === 0) return 50
      const humanVotes = Object.values(votes.value).filter(v => v === 'human').length
      return Math.round((humanVotes / total) * 100)
    })

    const aiVotePercent = computed(() => 100 - humanVotePercent.value)

    const spectatorResults = computed(() => {
      const playerAId = props.duellState?.playerA?.id
      const playerBId = props.duellState?.playerB?.id
      const correctAnswer = currentText.value?.author

      return Object.entries(votes.value)
        .filter(([id]) => id !== playerAId && id !== playerBId)
        .map(([id, vote]) => {
          const player = props.players.find(p => p.id === id)
          return {
            playerId: id,
            name: player?.name || 'Unbekannt',
            vote,
            correct: vote === correctAnswer
          }
        })
    })

    const getPlayerVote = (playerId) => votes.value[playerId]

    const getPlayerVoteText = (playerId) => {
      const vote = getPlayerVote(playerId)
      if (!vote) return 'Nicht abgestimmt'
      return vote === 'human' ? '👤 MENSCH' : '🤖 KI'
    }

    const isCorrect = (player) => {
      const playerId = player === 'a'
        ? props.duellState?.playerA?.id
        : props.duellState?.playerB?.id
      const vote = getPlayerVote(playerId)
      return vote === currentText.value?.author
    }

    const submitVote = (vote) => {
      if (hasVoted.value) return

      playerVote.value = vote

      if (isSpectator.value) {
        emit('spectator-submit', { vote })
      } else {
        emit('submit-answer', { vote })
      }

      hasVoted.value = true
    }

    const forceReveal = () => {
      emit('game-complete', { action: 'force-reveal' })
    }

    const nextRound = () => {
      hasVoted.value = false
      playerVote.value = null
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
      currentText,
      votes,
      scores,
      isSpectator,
      votedCount,
      totalPlayers,
      humanVotePercent,
      aiVotePercent,
      spectatorResults,
      getPlayerVote,
      getPlayerVoteText,
      isCorrect,
      submitVote,
      forceReveal,
      nextRound,
      finishGame
    }
  }
}
</script>

<style scoped>
.turing-test {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
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

.text-container {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  position: relative;
}

.text-type-badge {
  position: absolute;
  top: -12px;
  left: 20px;
  background: var(--ai-purple, #9945ff);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-family: monospace;
  font-size: 12px;
  text-transform: uppercase;
}

.text-content {
  font-family: Georgia, serif;
  font-size: 16px;
  line-height: 1.8;
  color: white;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

.voting-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.voting-prompt {
  font-family: monospace;
  font-size: 18px;
  color: var(--ai-cyan, #00ffff);
  text-align: center;
}

.vote-buttons {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 400px;
}

.vote-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border-radius: 16px;
  border: 3px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.4);
}

.human-btn {
  border-color: var(--ai-green, #00ff88);
}

.human-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
}

.ai-btn {
  border-color: var(--ai-pink, #ff00ff);
}

.ai-btn:hover {
  background: rgba(255, 0, 255, 0.2);
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.3);
}

.vote-icon {
  font-size: 48px;
}

.vote-label {
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.human-btn .vote-label { color: var(--ai-green, #00ff88); }
.ai-btn .vote-label { color: var(--ai-pink, #ff00ff); }

.voted-message {
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
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
}

.answer-label {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
  margin-bottom: 16px;
}

.answer-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  border-radius: 12px;
  border: 3px solid;
}

.answer-badge.human {
  background: rgba(0, 255, 136, 0.2);
  border-color: var(--ai-green, #00ff88);
}

.answer-badge.ai {
  background: rgba(255, 0, 255, 0.2);
  border-color: var(--ai-pink, #ff00ff);
}

.answer-icon {
  font-size: 32px;
}

.answer-text {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
}

.answer-badge.human .answer-text { color: var(--ai-green, #00ff88); }
.answer-badge.ai .answer-text { color: var(--ai-pink, #ff00ff); }

.answer-explanation {
  margin-top: 16px;
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
  font-style: italic;
}

.vote-stats {
  padding: 16px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}

.stat-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  min-width: 60px;
}

.stat-label.human {
  color: var(--ai-green, #00ff88);
  justify-content: flex-end;
}

.stat-label.ai {
  color: var(--ai-pink, #ff00ff);
}

.bar-container {
  flex: 1;
  display: flex;
  height: 24px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  overflow: hidden;
}

.bar {
  height: 100%;
  transition: width 0.5s ease;
}

.human-bar {
  background: linear-gradient(90deg, var(--ai-green, #00ff88), rgba(0, 255, 136, 0.5));
}

.ai-bar {
  background: linear-gradient(90deg, rgba(255, 0, 255, 0.5), var(--ai-pink, #ff00ff));
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
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s;
}

.duelist-result.correct {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid rgba(0, 255, 0, 0.3);
}

.duelist-result.wrong {
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid rgba(255, 0, 0, 0.3);
}

.duelist-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid;
}

.player-a .duelist-avatar { border-color: var(--ai-pink, #ff00ff); }
.player-b .duelist-avatar { border-color: var(--ai-cyan, #00ffff); }

.duelist-name {
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
}

.player-a .duelist-name { color: var(--ai-pink, #ff00ff); }
.player-b .duelist-name { color: var(--ai-cyan, #00ffff); }

.duelist-vote {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted, #8892b0);
}

.result-icon {
  font-size: 24px;
}

.duelist-result.correct .result-icon { color: #00ff00; }
.duelist-result.wrong .result-icon { color: #ff0000; }

.score-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
}

.score {
  font-size: 32px;
  font-weight: bold;
  color: gold;
}

.vs {
  font-size: 24px;
  color: var(--ai-text-muted, #8892b0);
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

.spectator-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.spectator-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
}

.spectator-item.correct {
  background: rgba(0, 255, 0, 0.1);
}

.spectator-item .name {
  color: white;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spectator-item .vote {
  margin: 0 8px;
}

.spectator-item .result {
  font-weight: bold;
}

.spectator-item.correct .result { color: #00ff00; }
.spectator-item:not(.correct) .result { color: #ff0000; }

.host-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
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
</style>
