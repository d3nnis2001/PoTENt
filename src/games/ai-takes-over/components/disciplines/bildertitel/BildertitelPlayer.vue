<template>
  <div class="bildertitel-player">
    <!-- Phase: Writing - Player writes a title for their image -->
    <div v-if="phase === 'writing'" class="writing-phase">
      <!-- Timer -->
      <div class="timer-bar">
        <div class="timer-fill" :style="{ width: timerPercent + '%' }"></div>
        <span class="timer-text">{{ timeRemaining }}s</span>
      </div>

      <!-- Assigned Image -->
      <div class="image-container">
        <div class="image-frame">
          <img :src="assignedImage?.src" :alt="t('bildertitel.player.yourImage')" class="assigned-image" />
        </div>
      </div>

      <!-- Title Input -->
      <div class="input-section">
        <label class="input-label">{{ t('bildertitel.player.writeTitle') }}</label>
        <input
          v-model="titleInput"
          type="text"
          :placeholder="t('bildertitel.player.titlePlaceholder')"
          :disabled="hasSubmitted"
          class="title-input"
          maxlength="100"
          @keyup.enter="submitTitle"
        />
        <div class="char-count">{{ titleInput.length }}/100</div>
      </div>

      <!-- Submit Button -->
      <button
        @click="submitTitle"
        :disabled="!canSubmit || hasSubmitted"
        class="submit-button"
        :class="{ 'submitted': hasSubmitted }"
      >
        <span v-if="hasSubmitted">{{ t('bildertitel.player.submitted') }}</span>
        <span v-else>{{ t('bildertitel.player.submitButton') }}</span>
      </button>
    </div>

    <!-- Phase: Waiting for Reveal -->
    <div v-else-if="phase === 'reveal'" class="waiting-phase">
      <div class="waiting-content">
        <div class="pulse-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <p class="waiting-text">{{ t('bildertitel.player.watchHost') }}</p>
        <p class="waiting-subtext">{{ t('bildertitel.player.revealingTitles') }}</p>
      </div>
    </div>

    <!-- Phase: Voting -->
    <div v-else-if="phase === 'voting'" class="voting-phase">
      <!-- Can Vote -->
      <div v-if="canVote">
        <div class="vote-header">
          <p class="vote-instruction">{{ t('bildertitel.player.voteForBest') }}</p>
          <div class="timer-small">{{ timeRemaining }}s</div>
        </div>

        <!-- Vote Options -->
        <div class="vote-options">
          <button
            v-for="(option, index) in voteOptions"
            :key="option.playerId"
            @click="selectVote(option.playerId)"
            class="vote-option"
            :class="{ 'selected': selectedVote === option.playerId }"
          >
            <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
            <p class="option-title">{{ option.title }}</p>
          </button>
        </div>

        <!-- Confirm Vote Button -->
        <button
          v-if="selectedVote && !hasVoted"
          @click="confirmVote"
          class="confirm-vote-button"
        >
          {{ t('bildertitel.player.confirmVote') }}
        </button>

        <!-- Already Voted -->
        <div v-if="hasVoted" class="vote-confirmed">
          <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ t('bildertitel.player.voteConfirmed') }}</span>
        </div>
      </div>

      <!-- Can't Vote (own image) -->
      <div v-else class="cant-vote">
        <div class="cant-vote-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <p class="cant-vote-text">{{ t('bildertitel.player.cantVoteOwn') }}</p>
        <p class="cant-vote-subtext">{{ t('bildertitel.player.waitForNext') }}</p>
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
        <h3 class="results-title">{{ t('bildertitel.player.roundComplete') }}</h3>
        <div class="your-score">
          <span class="score-label">{{ t('bildertitel.player.yourScore') }}</span>
          <span class="score-value">{{ playerScore }}</span>
          <span class="score-unit">{{ t('bildertitel.player.points') }}</span>
        </div>
        <p class="results-hint">{{ t('bildertitel.player.watchLeaderboard') }}</p>
      </div>
    </div>

    <!-- Phase: Waiting (default) -->
    <div v-else class="waiting-phase">
      <div class="waiting-content">
        <div class="loading-spinner"></div>
        <p class="waiting-text">{{ t('bildertitel.player.waiting') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'

export default {
  name: 'BildertitelPlayer',
  props: {
    phase: {
      type: String,
      default: 'waiting'
    },
    assignedImage: {
      type: Object,
      default: null
    },
    timeRemaining: {
      type: Number,
      default: 60
    },
    maxTime: {
      type: Number,
      default: 60
    },
    voteOptions: {
      type: Array,
      default: () => []
    },
    canVote: {
      type: Boolean,
      default: true
    },
    playerScore: {
      type: Number,
      default: 0
    },
    currentImageId: {
      type: String,
      default: ''
    }
  },
  emits: ['submit-title', 'submit-vote'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const titleInput = ref('')
    const hasSubmitted = ref(false)
    const selectedVote = ref(null)
    const hasVoted = ref(false)

    const timerPercent = computed(() => {
      return (props.timeRemaining / props.maxTime) * 100
    })

    const canSubmit = computed(() => {
      return titleInput.value.trim().length >= 3
    })

    const submitTitle = () => {
      if (!canSubmit.value || hasSubmitted.value) return
      emit('submit-title', titleInput.value.trim())
      hasSubmitted.value = true
    }

    const selectVote = (playerId) => {
      if (hasVoted.value) return
      selectedVote.value = playerId
    }

    const confirmVote = () => {
      if (!selectedVote.value || hasVoted.value) return
      emit('submit-vote', selectedVote.value, props.currentImageId)
      hasVoted.value = true
    }

    // Reset state when phase changes
    const resetForNewImage = () => {
      selectedVote.value = null
      hasVoted.value = false
    }

    const resetForNewRound = () => {
      titleInput.value = ''
      hasSubmitted.value = false
      selectedVote.value = null
      hasVoted.value = false
    }

    return {
      t,
      titleInput,
      hasSubmitted,
      selectedVote,
      hasVoted,
      timerPercent,
      canSubmit,
      submitTitle,
      selectVote,
      confirmVote,
      resetForNewImage,
      resetForNewRound
    }
  }
}
</script>

<style scoped>
.bildertitel-player {
  padding: 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Timer Bar */
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

/* Image Container */
.image-container {
  margin-bottom: 20px;
}

.image-frame {
  border: 2px solid var(--ai-cyan);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--ai-shadow-glow);
}

.assigned-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  background: #000;
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

.title-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border);
  border-radius: 8px;
  color: var(--ai-text);
  font-family: monospace;
  font-size: 16px;
  transition: border-color 0.3s;
}

.title-input:focus {
  outline: none;
  border-color: var(--ai-cyan);
  box-shadow: var(--ai-shadow-glow);
}

.title-input:disabled {
  opacity: 0.6;
}

.char-count {
  text-align: right;
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted);
  margin-top: 4px;
}

/* Submit Button */
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

/* Waiting Phase */
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
  margin-bottom: 16px;
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

.vote-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
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
}

.vote-option:hover {
  border-color: rgba(var(--ai-cyan-rgb), 0.5);
}

.vote-option.selected {
  border-color: var(--ai-cyan);
  background: rgba(var(--ai-cyan-rgb), 0.15);
  box-shadow: var(--ai-shadow-glow);
}

.option-letter {
  width: 32px;
  height: 32px;
  background: var(--ai-cyan);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-weight: bold;
  flex-shrink: 0;
}

.option-title {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text);
  flex: 1;
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

/* Can't Vote */
.cant-vote {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.cant-vote-icon {
  width: 64px;
  height: 64px;
  color: var(--ai-text-muted);
  margin-bottom: 16px;
}

.cant-vote-text {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-text-muted);
  margin-bottom: 8px;
}

.cant-vote-subtext {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted);
  opacity: 0.7;
}

/* Results Phase */
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
