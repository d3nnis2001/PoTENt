<template>
  <div class="drei-wort-chaos-player">
    <!-- Phase: Writing - Player writes their 3 words -->
    <div v-if="phase === 'writing'" class="writing-phase">
      <!-- Timer Bar -->
      <div class="timer-bar">
        <div class="timer-fill" :style="{ width: timerPercent + '%' }"></div>
        <span class="timer-text">{{ timeRemaining }}s</span>
      </div>

      <!-- Prompt Display -->
      <div class="prompt-container">
        <p class="prompt-label">{{ t('dreiWortChaos.player.promptLabel') }}</p>
        <p class="prompt-text">{{ currentPrompt?.prompt }}</p>
      </div>

      <!-- Answer Input -->
      <div class="input-section">
        <label class="input-label">{{ t('dreiWortChaos.player.yourAnswer') }}</label>
        <input
          v-model="answerInput"
          type="text"
          :placeholder="t('dreiWortChaos.player.placeholder')"
          :disabled="hasSubmitted"
          class="answer-input"
          :class="{ 'invalid': wordCount !== 3 && answerInput.length > 0 }"
          maxlength="60"
          @keyup.enter="submitAnswer"
        />
        <div class="word-counter" :class="{ 'valid': wordCount === 3, 'invalid': wordCount !== 3 && wordCount > 0 }">
          <span class="word-count">{{ wordCount }}</span>
          <span class="word-target">/3 {{ t('dreiWortChaos.player.words') }}</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        @click="submitAnswer"
        :disabled="!canSubmit || hasSubmitted"
        class="submit-button"
        :class="{ 'submitted': hasSubmitted }"
      >
        <span v-if="hasSubmitted">{{ t('dreiWortChaos.player.submitted') }}</span>
        <span v-else>{{ t('dreiWortChaos.player.submitButton') }}</span>
      </button>

      <!-- Word count hint -->
      <p v-if="wordCount !== 3 && wordCount > 0 && !hasSubmitted" class="hint-text">
        {{ wordCount < 3 ? t('dreiWortChaos.player.needMore') : t('dreiWortChaos.player.tooMany') }}
      </p>
    </div>

    <!-- Phase: Reveal - Watch the host screen -->
    <div v-else-if="phase === 'reveal'" class="waiting-phase">
      <div class="waiting-content">
        <div class="pulse-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <p class="waiting-text">{{ t('dreiWortChaos.player.watchHost') }}</p>
        <p class="waiting-subtext">{{ t('dreiWortChaos.player.revealingAnswers') }}</p>
      </div>
    </div>

    <!-- Phase: Voting -->
    <div v-else-if="phase === 'voting'" class="voting-phase">
      <div class="vote-header">
        <p class="vote-instruction">{{ t('dreiWortChaos.player.voteForBest') }}</p>
        <div class="timer-small">{{ timeRemaining }}s</div>
      </div>

      <!-- Prompt reminder -->
      <div class="prompt-reminder">
        <p class="prompt-mini">{{ currentPrompt?.prompt }}</p>
      </div>

      <!-- Vote Options -->
      <div class="vote-options">
        <button
          v-for="(option, index) in voteOptions"
          :key="option.playerId"
          @click="selectVote(option.playerId)"
          :disabled="option.playerId === currentPlayerId"
          class="vote-option"
          :class="{
            'selected': selectedVote === option.playerId,
            'own-answer': option.playerId === currentPlayerId
          }"
        >
          <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
          <p class="option-text">{{ option.answer }}</p>
          <span v-if="option.playerId === currentPlayerId" class="own-tag">{{ t('dreiWortChaos.player.yourAnswer') }}</span>
        </button>
      </div>

      <!-- Confirm Vote Button -->
      <button
        v-if="selectedVote && !hasVoted"
        @click="confirmVote"
        class="confirm-vote-button"
      >
        {{ t('dreiWortChaos.player.confirmVote') }}
      </button>

      <!-- Already Voted -->
      <div v-if="hasVoted" class="vote-confirmed">
        <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ t('dreiWortChaos.player.voteConfirmed') }}</span>
      </div>
    </div>

    <!-- Phase: Results -->
    <div v-else-if="phase === 'results'" class="results-phase">
      <div class="results-content">
        <div class="results-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="results-title">{{ t('dreiWortChaos.player.roundComplete') }}</h3>
        <div class="your-score">
          <span class="score-label">{{ t('dreiWortChaos.player.yourScore') }}</span>
          <span class="score-value">{{ playerScore }}</span>
          <span class="score-unit">{{ t('dreiWortChaos.player.points') }}</span>
        </div>
        <p class="results-hint">{{ t('dreiWortChaos.player.watchLeaderboard') }}</p>
      </div>
    </div>

    <!-- Phase: Waiting (default) -->
    <div v-else class="waiting-phase">
      <div class="waiting-content">
        <div class="loading-spinner"></div>
        <p class="waiting-text">{{ t('dreiWortChaos.player.waiting') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import { countWords } from '@/games/ai-takes-over/data/dreiWortChaosPrompts'

export default {
  name: 'DreiWortChaosPlayer',
  props: {
    phase: {
      type: String,
      default: 'waiting'
    },
    currentPrompt: {
      type: Object,
      default: null
    },
    timeRemaining: {
      type: Number,
      default: 45
    },
    maxTime: {
      type: Number,
      default: 45
    },
    voteOptions: {
      type: Array,
      default: () => []
    },
    currentPlayerId: {
      type: String,
      default: ''
    },
    playerScore: {
      type: Number,
      default: 0
    }
  },
  emits: ['submit-answer', 'submit-vote'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const answerInput = ref('')
    const hasSubmitted = ref(false)
    const selectedVote = ref(null)
    const hasVoted = ref(false)

    const timerPercent = computed(() => {
      return (props.timeRemaining / props.maxTime) * 100
    })

    const wordCount = computed(() => {
      return countWords(answerInput.value)
    })

    const canSubmit = computed(() => {
      return wordCount.value === 3
    })

    const submitAnswer = () => {
      if (!canSubmit.value || hasSubmitted.value) return
      emit('submit-answer', answerInput.value.trim())
      hasSubmitted.value = true
    }

    const selectVote = (playerId) => {
      if (hasVoted.value || playerId === props.currentPlayerId) return
      selectedVote.value = playerId
    }

    const confirmVote = () => {
      if (!selectedVote.value || hasVoted.value) return
      emit('submit-vote', selectedVote.value)
      hasVoted.value = true
    }

    const resetForNewRound = () => {
      answerInput.value = ''
      hasSubmitted.value = false
      selectedVote.value = null
      hasVoted.value = false
    }

    return {
      t,
      answerInput,
      hasSubmitted,
      selectedVote,
      hasVoted,
      timerPercent,
      wordCount,
      canSubmit,
      submitAnswer,
      selectVote,
      confirmVote,
      resetForNewRound
    }
  }
}
</script>

<style scoped>
.drei-wort-chaos-player {
  padding: 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Timer Bar - reused from Bildertitel */
.timer-bar {
  position: relative;
  height: 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  margin-bottom: 16px;
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ai-cyan), var(--ai-pink));
  transition: width 1s linear;
}

.timer-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-family: monospace;
  font-size: 10px;
  color: var(--ai-cyan);
}

/* Prompt Container */
.prompt-container {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-cyan);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--ai-shadow-glow);
}

.prompt-label {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.prompt-text {
  font-family: monospace;
  font-size: 18px;
  color: var(--ai-cyan);
  font-weight: bold;
}

/* Input Section */
.input-section {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-cyan);
  margin-bottom: 8px;
}

.answer-input {
  width: 100%;
  padding: 16px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border);
  border-radius: 8px;
  color: var(--ai-text);
  font-family: monospace;
  font-size: 18px;
  text-align: center;
  transition: border-color 0.3s;
}

.answer-input:focus {
  outline: none;
  border-color: var(--ai-cyan);
  box-shadow: var(--ai-shadow-glow);
}

.answer-input.invalid {
  border-color: var(--ai-pink);
}

.answer-input:disabled {
  opacity: 0.6;
}

.word-counter {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 4px;
  margin-top: 8px;
  font-family: monospace;
}

.word-count {
  font-size: 24px;
  font-weight: bold;
  color: var(--ai-text-muted);
}

.word-counter.valid .word-count {
  color: var(--ai-cyan);
}

.word-counter.invalid .word-count {
  color: var(--ai-pink);
}

.word-target {
  font-size: 14px;
  color: var(--ai-text-muted);
}

.hint-text {
  text-align: center;
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-pink);
  margin-top: 8px;
}

/* Submit Button - reused from Bildertitel */
.submit-button {
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 2px solid var(--ai-cyan);
  border-radius: 8px;
  color: var(--ai-cyan);
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-button:hover:not(:disabled) {
  background: rgba(var(--ai-cyan-rgb), 0.2);
  box-shadow: var(--ai-shadow-glow);
}

.submit-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.submit-button.submitted {
  background: rgba(var(--ai-cyan-rgb), 0.2);
  border-color: var(--ai-cyan);
}

/* Waiting Phase - reused from Bildertitel */
.waiting-phase {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.waiting-content {
  text-align: center;
}

.pulse-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: var(--ai-cyan);
  animation: pulse 2s ease-in-out infinite;
}

.waiting-text {
  font-family: monospace;
  font-size: 18px;
  color: var(--ai-cyan);
  margin-bottom: 8px;
}

.waiting-subtext {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--ai-border);
  border-top-color: var(--ai-cyan);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.95); }
}

/* Voting Phase */
.voting-phase {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.vote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.vote-instruction {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-cyan);
}

.timer-small {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  color: var(--ai-pink);
}

.prompt-reminder {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 16px;
}

.prompt-mini {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted);
  text-align: center;
}

.vote-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
}

.vote-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid var(--ai-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  position: relative;
}

.vote-option:hover:not(:disabled) {
  border-color: rgba(var(--ai-cyan-rgb), 0.5);
}

.vote-option.selected {
  border-color: var(--ai-cyan);
  background: rgba(var(--ai-cyan-rgb), 0.15);
  box-shadow: var(--ai-shadow-glow);
}

.vote-option.own-answer {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-letter {
  width: 28px;
  height: 28px;
  background: var(--ai-cyan);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}

.option-text {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  color: var(--ai-text);
  flex: 1;
}

.own-tag {
  position: absolute;
  top: 4px;
  right: 8px;
  font-family: monospace;
  font-size: 10px;
  color: var(--ai-text-muted);
  text-transform: uppercase;
}

.confirm-vote-button {
  margin-top: 16px;
  width: 100%;
  padding: 16px;
  background: var(--ai-cyan);
  border: none;
  border-radius: 8px;
  color: #000;
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-vote-button:hover {
  box-shadow: var(--ai-shadow-glow-intense);
}

.vote-confirmed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 16px;
  background: rgba(var(--ai-cyan-rgb), 0.1);
  border: 1px solid var(--ai-cyan);
  border-radius: 8px;
  color: var(--ai-cyan);
  font-family: monospace;
}

.check-icon {
  width: 24px;
  height: 24px;
}

/* Results Phase - reused from Bildertitel */
.results-phase {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-content {
  text-align: center;
}

.results-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: var(--ai-cyan);
}

.results-title {
  font-family: monospace;
  font-size: 20px;
  color: var(--ai-cyan);
  margin-bottom: 20px;
}

.your-score {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.score-label {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted);
}

.score-value {
  font-family: monospace;
  font-size: 48px;
  font-weight: bold;
  color: var(--ai-cyan);
  text-shadow: var(--ai-text-glow);
}

.score-unit {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted);
}

.results-hint {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted);
}
</style>
