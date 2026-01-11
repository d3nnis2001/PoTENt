<template>
  <div class="bobs-captcha">
    <!-- Header -->
    <div class="game-header">
      <span class="game-icon">🔐</span>
      <span class="game-title">BOB'S CAPTCHA</span>
      <span class="round-indicator">{{ currentCaptcha }}/{{ totalCaptchas }}</span>
    </div>

    <!-- Countdown Phase -->
    <div v-if="phase === 'countdown'" class="countdown-phase">
      <div class="countdown-display">
        <span class="countdown-number">{{ countdown }}</span>
      </div>
      <p class="countdown-text">Beweise dass du kein Roboter bist!</p>
    </div>

    <!-- Captcha Phase -->
    <div v-if="phase === 'solving'" class="captcha-phase">
      <!-- Progress Bar -->
      <div class="captcha-progress">
        <div
          v-for="i in totalCaptchas"
          :key="i"
          :class="['progress-dot', { solved: i <= solvedCount, current: i === currentCaptcha }]"
        />
      </div>

      <!-- Current Captcha Display -->
      <div class="captcha-container">
        <!-- Text Captcha -->
        <div v-if="captcha?.type === 'text'" class="captcha-text">
          <div class="captcha-label">Gib den Text ein:</div>
          <div class="distorted-text" :style="distortionStyle">
            {{ captcha.display }}
          </div>
          <input
            ref="textInput"
            v-model="textAnswer"
            type="text"
            class="captcha-input"
            placeholder="Text eingeben..."
            :disabled="hasAnswered"
            @keyup.enter="submitTextAnswer"
          />
          <button
            v-if="!hasAnswered"
            class="submit-btn"
            :disabled="!textAnswer"
            @click="submitTextAnswer"
          >
            PRÜFEN
          </button>
        </div>

        <!-- Math Captcha -->
        <div v-else-if="captcha?.type === 'math'" class="captcha-math">
          <div class="captcha-label">Löse die Aufgabe:</div>
          <div class="math-display">{{ captcha.display }}</div>
          <input
            ref="mathInput"
            v-model="mathAnswer"
            type="number"
            class="captcha-input"
            placeholder="Ergebnis..."
            :disabled="hasAnswered"
            @keyup.enter="submitMathAnswer"
          />
          <button
            v-if="!hasAnswered"
            class="submit-btn"
            :disabled="!mathAnswer"
            @click="submitMathAnswer"
          >
            PRÜFEN
          </button>
        </div>

        <!-- Word Captcha -->
        <div v-else-if="captcha?.type === 'word'" class="captcha-word">
          <div class="captcha-label">{{ captcha.display }}</div>
          <div class="word-options">
            <button
              v-for="option in captcha.options"
              :key="option"
              class="word-option"
              :class="{ selected: selectedWord === option }"
              :disabled="hasAnswered"
              @click="selectWord(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <!-- Answer Feedback -->
      <div v-if="hasAnswered" class="answer-feedback" :class="{ correct: lastAnswerCorrect, wrong: !lastAnswerCorrect }">
        <span class="feedback-icon">{{ lastAnswerCorrect ? '✅' : '❌' }}</span>
        <span class="feedback-text">{{ lastAnswerCorrect ? 'Richtig!' : 'Falsch!' }}</span>
      </div>

      <!-- Live Scores -->
      <div class="live-scores">
        <div class="score-item player-a">
          <img :src="duellState?.playerA?.icon" class="score-avatar" />
          <span class="score-name">{{ duellState?.playerA?.name }}</span>
          <span class="score-value">{{ scores.a || 0 }}</span>
        </div>
        <div class="score-divider">:</div>
        <div class="score-item player-b">
          <img :src="duellState?.playerB?.icon" class="score-avatar" />
          <span class="score-name">{{ duellState?.playerB?.name }}</span>
          <span class="score-value">{{ scores.b || 0 }}</span>
        </div>
      </div>

      <!-- Spectator Stats -->
      <div v-if="isSpectator" class="spectator-info">
        <span class="spectator-badge">👁️ Zuschauer</span>
        <span class="spectator-score">Deine Punkte: {{ spectatorScore }}</span>
      </div>
    </div>

    <!-- Results Phase -->
    <div v-else-if="phase === 'results'" class="results-phase">
      <!-- Winner Banner -->
      <div class="winner-banner">
        <span class="winner-icon">🏆</span>
        <span class="winner-text">{{ winnerName }} gewinnt!</span>
      </div>

      <!-- Final Scores -->
      <div class="final-scores">
        <div class="final-score player-a" :class="{ winner: winner === 'a' }">
          <img :src="duellState?.playerA?.icon" class="final-avatar" />
          <span class="final-name">{{ duellState?.playerA?.name }}</span>
          <span class="final-value">{{ scores.a || 0 }}</span>
          <div class="stats-row">
            <span class="stat">{{ results.a?.correct || 0 }} richtig</span>
            <span class="stat">{{ formatTime(results.a?.avgTime) }} avg</span>
          </div>
          <div v-if="winner === 'a'" class="winner-badge">🥇</div>
        </div>

        <div class="vs-divider">VS</div>

        <div class="final-score player-b" :class="{ winner: winner === 'b' }">
          <img :src="duellState?.playerB?.icon" class="final-avatar" />
          <span class="final-name">{{ duellState?.playerB?.name }}</span>
          <span class="final-value">{{ scores.b || 0 }}</span>
          <div class="stats-row">
            <span class="stat">{{ results.b?.correct || 0 }} richtig</span>
            <span class="stat">{{ formatTime(results.b?.avgTime) }} avg</span>
          </div>
          <div v-if="winner === 'b'" class="winner-badge">🥇</div>
        </div>
      </div>

      <!-- Spectator Leaderboard -->
      <div v-if="spectatorLeaderboard.length > 0" class="spectator-leaderboard">
        <h4 class="leaderboard-title">🎯 Zuschauer-Rangliste</h4>
        <div class="leaderboard-list">
          <div
            v-for="(result, index) in spectatorLeaderboard.slice(0, 5)"
            :key="result.playerId"
            class="leaderboard-item"
          >
            <span class="rank">{{ index + 1 }}.</span>
            <span class="name">{{ result.name }}</span>
            <span class="correct">{{ result.correct }}/{{ totalCaptchas }}</span>
            <span class="score">{{ result.score }} pts</span>
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
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'

export default {
  name: 'DuellBobsCaptcha',
  props: {
    duellState: { type: Object, required: true },
    players: { type: Array, default: () => [] },
    currentPlayerId: { type: String, default: '' },
    isHost: { type: Boolean, default: false },
    gameData: { type: Object, default: null }
  },
  emits: ['submit-answer', 'game-complete', 'spectator-submit'],
  setup(props, { emit }) {
    const textInput = ref(null)
    const mathInput = ref(null)
    const textAnswer = ref('')
    const mathAnswer = ref('')
    const selectedWord = ref(null)
    const hasAnswered = ref(false)
    const lastAnswerCorrect = ref(false)
    const spectatorScore = ref(0)
    const answerStartTime = ref(null)

    const phase = computed(() => props.gameData?.phase || 'countdown')
    const countdown = computed(() => props.gameData?.countdown || 3)
    const captcha = computed(() => props.gameData?.currentCaptcha)
    const currentCaptcha = computed(() => props.gameData?.currentIndex || 1)
    const totalCaptchas = computed(() => props.gameData?.totalCaptchas || 5)
    const solvedCount = computed(() => props.gameData?.solvedCount || 0)
    const scores = computed(() => props.gameData?.scores || { a: 0, b: 0 })
    const results = computed(() => props.gameData?.results || {})
    const winner = computed(() => props.gameData?.winner)

    const isSpectator = computed(() => {
      const playerAId = props.duellState?.playerA?.id
      const playerBId = props.duellState?.playerB?.id
      return props.currentPlayerId !== playerAId && props.currentPlayerId !== playerBId
    })

    const winnerName = computed(() => {
      if (winner.value === 'a') return props.duellState?.playerA?.name
      if (winner.value === 'b') return props.duellState?.playerB?.name
      return 'Unentschieden'
    })

    const spectatorLeaderboard = computed(() => {
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
        .sort((a, b) => (b.score || 0) - (a.score || 0))
    })

    const distortionStyle = computed(() => {
      const skewX = (Math.random() - 0.5) * 15
      const skewY = (Math.random() - 0.5) * 8
      return {
        transform: `skewX(${skewX}deg) skewY(${skewY}deg)`,
        letterSpacing: '4px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }
    })

    const calculateScore = (correct, timeMs) => {
      if (!correct) return 0
      // Base score + time bonus (faster = more points)
      const baseScore = 100
      const timeBonus = Math.max(0, 50 - Math.floor(timeMs / 100))
      return baseScore + timeBonus
    }

    const submitAnswer = (answer) => {
      if (hasAnswered.value) return

      const timeMs = Date.now() - (answerStartTime.value || Date.now())
      const correct = answer.toLowerCase() === captcha.value?.solution?.toLowerCase()
      lastAnswerCorrect.value = correct

      const score = calculateScore(correct, timeMs)

      if (isSpectator.value) {
        if (correct) spectatorScore.value += score
        emit('spectator-submit', { answer, correct, time: timeMs, score })
      } else {
        emit('submit-answer', { answer, correct, time: timeMs, score })
      }

      hasAnswered.value = true
    }

    const submitTextAnswer = () => {
      if (!textAnswer.value) return
      submitAnswer(textAnswer.value)
    }

    const submitMathAnswer = () => {
      if (!mathAnswer.value) return
      submitAnswer(mathAnswer.value.toString())
    }

    const selectWord = (word) => {
      if (hasAnswered.value) return
      selectedWord.value = word
      submitAnswer(word)
    }

    const formatTime = (ms) => {
      if (!ms) return '--'
      return (ms / 1000).toFixed(2) + 's'
    }

    const finishGame = () => {
      emit('game-complete', { action: 'finish' })
    }

    // Reset state and focus input when captcha changes
    watch(() => props.gameData?.currentCaptcha?.id, () => {
      hasAnswered.value = false
      textAnswer.value = ''
      mathAnswer.value = ''
      selectedWord.value = null
      answerStartTime.value = Date.now()

      nextTick(() => {
        if (captcha.value?.type === 'text' && textInput.value) {
          textInput.value.focus()
        } else if (captcha.value?.type === 'math' && mathInput.value) {
          mathInput.value.focus()
        }
      })
    })

    // Set start time when phase changes to solving
    watch(() => phase.value, (newPhase) => {
      if (newPhase === 'solving') {
        answerStartTime.value = Date.now()
      }
    })

    return {
      textInput,
      mathInput,
      textAnswer,
      mathAnswer,
      selectedWord,
      hasAnswered,
      lastAnswerCorrect,
      spectatorScore,
      phase,
      countdown,
      captcha,
      currentCaptcha,
      totalCaptchas,
      solvedCount,
      scores,
      results,
      winner,
      isSpectator,
      winnerName,
      spectatorLeaderboard,
      distortionStyle,
      submitTextAnswer,
      submitMathAnswer,
      selectWord,
      formatTime,
      finishGame
    }
  }
}
</script>

<style scoped>
.bobs-captcha {
  padding: 20px;
  max-width: 600px;
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

.round-indicator {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}

/* Countdown */
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
  border: 4px solid var(--ai-pink, #ff00ff);
  border-radius: 50%;
  animation: pulse 1s ease infinite;
}

.countdown-number {
  font-family: monospace;
  font-size: 64px;
  font-weight: bold;
  color: var(--ai-pink, #ff00ff);
}

.countdown-text {
  font-family: monospace;
  font-size: 18px;
  color: var(--ai-text-muted, #8892b0);
  margin-top: 20px;
}

/* Captcha Phase */
.captcha-phase {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.captcha-progress {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.progress-dot.solved {
  background: var(--ai-green, #00ff88);
  box-shadow: 0 0 10px var(--ai-green, #00ff88);
}

.progress-dot.current {
  background: var(--ai-cyan, #00ffff);
  box-shadow: 0 0 15px var(--ai-cyan, #00ffff);
  animation: pulse 1s ease infinite;
}

.captcha-container {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
  padding: 24px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.captcha-label {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #8892b0);
  margin-bottom: 16px;
}

.distorted-text {
  font-family: 'Courier New', monospace;
  font-size: 36px;
  font-weight: bold;
  color: white;
  background: linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1));
  padding: 16px 32px;
  border-radius: 8px;
  margin-bottom: 20px;
  user-select: none;
}

.math-display {
  font-family: monospace;
  font-size: 32px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  padding: 16px 32px;
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  margin-bottom: 20px;
}

.captcha-input {
  width: 100%;
  max-width: 300px;
  padding: 16px;
  font-family: monospace;
  font-size: 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 12px;
  color: white;
  outline: none;
  margin-bottom: 16px;
}

.captcha-input:focus {
  border-color: var(--ai-cyan, #00ffff);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.captcha-input:disabled {
  opacity: 0.5;
}

.submit-btn {
  padding: 14px 40px;
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, var(--ai-pink, #ff00ff), var(--ai-cyan, #00ffff));
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.word-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 400px;
}

.word-option {
  padding: 16px;
  font-family: monospace;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.word-option:hover:not(:disabled) {
  border-color: var(--ai-cyan, #00ffff);
  background: rgba(0, 255, 255, 0.1);
}

.word-option.selected {
  border-color: var(--ai-pink, #ff00ff);
  background: rgba(255, 0, 255, 0.2);
}

.word-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.answer-feedback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  font-family: monospace;
  animation: fadeIn 0.3s ease;
}

.answer-feedback.correct {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid rgba(0, 255, 0, 0.3);
  color: #00ff00;
}

.answer-feedback.wrong {
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid rgba(255, 0, 0, 0.3);
  color: #ff4444;
}

.feedback-icon {
  font-size: 24px;
}

.feedback-text {
  font-size: 16px;
  font-weight: bold;
}

.live-scores {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid;
}

.player-a .score-avatar { border-color: var(--ai-pink, #ff00ff); }
.player-b .score-avatar { border-color: var(--ai-cyan, #00ffff); }

.score-name {
  font-family: monospace;
  font-size: 14px;
}

.player-a .score-name { color: var(--ai-pink, #ff00ff); }
.player-b .score-name { color: var(--ai-cyan, #00ffff); }

.score-value {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
  color: gold;
}

.score-divider {
  font-family: monospace;
  font-size: 24px;
  color: var(--ai-text-muted, #8892b0);
}

.spectator-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px;
}

.spectator-badge {
  padding: 4px 12px;
  background: rgba(255, 165, 0, 0.2);
  border: 1px solid orange;
  border-radius: 12px;
  font-family: monospace;
  font-size: 12px;
  color: orange;
}

.spectator-score {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-cyan, #00ffff);
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

.final-scores {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.final-score {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 16px;
}

.final-score.winner {
  border-color: gold;
  background: rgba(255, 215, 0, 0.1);
}

.final-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid;
}

.player-a .final-avatar { border-color: var(--ai-pink, #ff00ff); }
.player-b .final-avatar { border-color: var(--ai-cyan, #00ffff); }

.final-name {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
}

.player-a .final-name { color: var(--ai-pink, #ff00ff); }
.player-b .final-name { color: var(--ai-cyan, #00ffff); }

.final-value {
  font-family: monospace;
  font-size: 36px;
  font-weight: bold;
  color: gold;
}

.stats-row {
  display: flex;
  gap: 16px;
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted, #8892b0);
}

.winner-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  font-size: 32px;
}

.vs-divider {
  font-family: monospace;
  font-size: 20px;
  font-weight: bold;
  color: var(--ai-text-muted, #8892b0);
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

.leaderboard-item .correct {
  color: var(--ai-green, #00ff88);
}

.leaderboard-item .score {
  color: var(--ai-cyan, #00ffff);
  min-width: 50px;
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

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
