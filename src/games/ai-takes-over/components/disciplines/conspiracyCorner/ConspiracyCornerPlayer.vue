<template>
  <div class="conspiracy-corner-player">
    <!-- Phase: Writing - Player writes their conspiracy theory -->
    <div v-if="phase === 'writing'" class="writing-phase">
      <!-- Timer Bar -->
      <div class="timer-bar">
        <div class="timer-fill" :style="{ width: timerPercent + '%' }"></div>
        <span class="timer-text">{{ timeRemaining }}s</span>
      </div>

      <!-- Topic Display -->
      <div class="topic-container">
        <p class="topic-label">{{ t('conspiracyCorner.player.topicLabel') }}</p>
        <p class="topic-text">{{ currentTopic?.topic }}</p>
      </div>

      <!-- Theory Input -->
      <div class="input-section">
        <label class="input-label">{{ t('conspiracyCorner.player.yourTheory') }}</label>
        <textarea
          v-model="theoryInput"
          :placeholder="t('conspiracyCorner.player.placeholder')"
          :disabled="hasSubmitted"
          class="theory-input"
          :maxlength="maxLength"
          rows="6"
        ></textarea>
        <div class="char-counter" :class="{ 'warning': charCount > maxLength * 0.9, 'valid': charCount >= minLength }">
          <span class="char-count">{{ charCount }}</span>
          <span class="char-target">/{{ maxLength }}</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        @click="submitTheory"
        :disabled="!canSubmit || hasSubmitted"
        class="submit-button"
        :class="{ 'submitted': hasSubmitted }"
      >
        <span v-if="hasSubmitted">{{ t('conspiracyCorner.player.submitted') }}</span>
        <span v-else>{{ t('conspiracyCorner.player.submitButton') }}</span>
      </button>

      <!-- Hint -->
      <p v-if="charCount < minLength && charCount > 0 && !hasSubmitted" class="hint-text">
        {{ t('conspiracyCorner.player.needMore', { min: minLength }) }}
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
        <p class="waiting-text">{{ t('conspiracyCorner.player.watchHost') }}</p>
        <p class="waiting-subtext">{{ t('conspiracyCorner.player.revealingTheories') }}</p>
      </div>
    </div>

    <!-- Phase: Voting -->
    <div v-else-if="phase === 'voting'" class="voting-phase">
      <div class="vote-header">
        <p class="vote-instruction">{{ t('conspiracyCorner.player.voteForBest') }}</p>
        <div class="timer-small">{{ timeRemaining }}s</div>
      </div>

      <!-- Topic reminder -->
      <div class="topic-reminder">
        <p class="topic-mini">{{ currentTopic?.topic }}</p>
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
          <p class="option-text">{{ truncateTheory(option.theory) }}</p>
          <span v-if="option.playerId === currentPlayerId" class="own-tag">DEINE</span>
        </button>
      </div>

      <!-- Confirm Vote Button -->
      <button
        v-if="selectedVote && !hasVoted"
        @click="confirmVote"
        class="confirm-vote-button"
      >
        {{ t('conspiracyCorner.player.confirmVote') }}
      </button>

      <!-- Already Voted -->
      <div v-if="hasVoted" class="vote-confirmed">
        <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ t('conspiracyCorner.player.voteConfirmed') }}</span>
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
        <h3 class="results-title">{{ t('conspiracyCorner.player.roundComplete') }}</h3>
        <div class="your-score">
          <span class="score-label">{{ t('conspiracyCorner.player.yourScore') }}</span>
          <span class="score-value">{{ playerScore }}</span>
          <span class="score-unit">{{ t('conspiracyCorner.player.points') }}</span>
        </div>
        <p class="results-hint">{{ t('conspiracyCorner.player.watchLeaderboard') }}</p>
      </div>
    </div>

    <!-- Phase: Waiting (default) -->
    <div v-else class="waiting-phase">
      <div class="waiting-content">
        <div class="loading-spinner"></div>
        <p class="waiting-text">{{ t('conspiracyCorner.player.waiting') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import { CONSPIRACY_CORNER_CONFIG } from '@/games/ai-takes-over/config/gameConfig'

export default {
  name: 'ConspiracyCornerPlayer',
  props: {
    phase: { type: String, default: 'waiting' },
    currentTopic: { type: Object, default: null },
    timeRemaining: { type: Number, default: 90 },
    maxTime: { type: Number, default: 90 },
    voteOptions: { type: Array, default: () => [] },
    currentPlayerId: { type: String, default: '' },
    playerScore: { type: Number, default: 0 }
  },
  emits: ['submit-theory', 'submit-vote'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const theoryInput = ref('')
    const hasSubmitted = ref(false)
    const selectedVote = ref(null)
    const hasVoted = ref(false)

    const maxLength = CONSPIRACY_CORNER_CONFIG.maxInputLength
    const minLength = CONSPIRACY_CORNER_CONFIG.minInputLength

    const timerPercent = computed(() => (props.timeRemaining / props.maxTime) * 100)
    const charCount = computed(() => theoryInput.value.length)
    const canSubmit = computed(() => charCount.value >= minLength && charCount.value <= maxLength)

    const truncateTheory = (theory) => {
      if (theory.length > 100) return theory.substring(0, 100) + '...'
      return theory
    }

    const submitTheory = () => {
      if (!canSubmit.value || hasSubmitted.value) return
      emit('submit-theory', theoryInput.value.trim())
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
      theoryInput.value = ''
      hasSubmitted.value = false
      selectedVote.value = null
      hasVoted.value = false
    }

    return {
      t,
      theoryInput,
      hasSubmitted,
      selectedVote,
      hasVoted,
      maxLength,
      minLength,
      timerPercent,
      charCount,
      canSubmit,
      truncateTheory,
      submitTheory,
      selectVote,
      confirmVote,
      resetForNewRound
    }
  }
}
</script>

<style scoped>
.conspiracy-corner-player {
  padding: 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

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

.topic-container {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-cyan);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--ai-shadow-glow);
}

.topic-label {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.topic-text {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-cyan);
  font-weight: bold;
}

.input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-cyan);
  margin-bottom: 8px;
}

.theory-input {
  flex: 1;
  min-height: 150px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border);
  border-radius: 8px;
  color: var(--ai-text);
  font-family: monospace;
  font-size: 14px;
  resize: none;
  transition: border-color 0.3s;
}

.theory-input:focus {
  outline: none;
  border-color: var(--ai-cyan);
  box-shadow: var(--ai-shadow-glow);
}

.theory-input:disabled {
  opacity: 0.6;
}

.char-counter {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 2px;
  margin-top: 8px;
  font-family: monospace;
}

.char-count {
  font-size: 16px;
  font-weight: bold;
  color: var(--ai-text-muted);
}

.char-counter.valid .char-count {
  color: var(--ai-cyan);
}

.char-counter.warning .char-count {
  color: var(--ai-pink);
}

.char-target {
  font-size: 12px;
  color: var(--ai-text-muted);
}

.hint-text {
  text-align: center;
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-pink);
  margin-top: 8px;
}

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

.topic-reminder {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 16px;
}

.topic-mini {
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
  align-items: flex-start;
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
  font-size: 13px;
  color: var(--ai-text);
  flex: 1;
  line-height: 1.4;
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
