<template>
  <div class="autocomplete-chaos-player min-h-screen ai-mobile-bg p-4">
    <!-- Writing Phase -->
    <div v-if="phase === 'writing' && !hasSubmitted" class="writing-phase">
      <div class="header text-center mb-4">
        <h2 class="text-lg font-mono font-bold text-cyan-400">
          {{ t('autocompleteChaos.name') }}
        </h2>
      </div>

      <!-- Prompt Display -->
      <div class="prompt-box mb-4">
        <div class="prompt-label">{{ t('autocompleteChaos.player.promptLabel') }}</div>
        <div class="prompt-text">
          {{ currentPrompt?.prompt }}
          <span class="cursor-blink">|</span>
        </div>
      </div>

      <!-- Input -->
      <div class="input-section mb-4">
        <label class="input-label">{{ t('autocompleteChaos.player.yourCompletion') }}</label>
        <textarea
          v-model="completion"
          :placeholder="t('autocompleteChaos.player.placeholder')"
          class="completion-input"
          :maxlength="maxLength"
          rows="3"
        ></textarea>
        <div class="char-counter">
          <span :class="{ 'text-red-400': completion.length < minLength }">
            {{ completion.length }}
          </span>
          <span class="text-cyan-600">/{{ maxLength }}</span>
          <span v-if="completion.length < minLength" class="min-warning">
            (min {{ minLength }})
          </span>
        </div>
      </div>

      <!-- Submit Button -->
      <CyberButton
        @click="submitCompletion"
        :disabled="!canSubmit || isSubmitting"
        class="w-full py-4"
      >
        {{ isSubmitting ? t('autocompleteChaos.player.submitting') : t('autocompleteChaos.player.submitButton') }}
      </CyberButton>
    </div>

    <!-- Submitted State -->
    <div v-else-if="phase === 'writing' && hasSubmitted" class="submitted-state text-center">
      <div class="success-icon mb-4">
        <div class="checkmark">&#10003;</div>
      </div>
      <h2 class="text-xl font-mono font-bold text-cyan-400 mb-2">
        {{ t('autocompleteChaos.player.submitted') }}
      </h2>
      <p class="text-cyan-600 font-mono text-sm">
        {{ t('autocompleteChaos.player.watchHost') }}
      </p>
    </div>

    <!-- Reveal Phase -->
    <div v-else-if="phase === 'reveal'" class="reveal-phase text-center">
      <div class="reveal-icon mb-4">
        <span class="text-4xl">&#128064;</span>
      </div>
      <h2 class="text-xl font-mono font-bold text-cyan-400 mb-2">
        {{ t('autocompleteChaos.player.revealingCompletions') }}
      </h2>
      <p class="text-cyan-600 font-mono text-sm">
        {{ t('autocompleteChaos.player.watchHost') }}
      </p>
    </div>

    <!-- Voting Phase -->
    <div v-else-if="phase === 'voting' && !hasVoted" class="voting-phase">
      <div class="header text-center mb-4">
        <h2 class="text-lg font-mono font-bold text-cyan-400">
          {{ t('autocompleteChaos.player.voteForBest') }}
        </h2>
        <p class="text-cyan-600 font-mono text-xs mt-1">
          {{ currentPrompt?.prompt }}
        </p>
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
          <p class="option-text">{{ option.completion }}</p>
          <div v-if="option.playerId === currentPlayerId" class="own-badge">
            {{ t('autocompleteChaos.player.yourAnswer') }}
          </div>
        </button>
      </div>

      <!-- Confirm Vote -->
      <CyberButton
        v-if="selectedVote"
        @click="confirmVote"
        :disabled="isVoting"
        class="w-full py-4 mt-4"
      >
        {{ isVoting ? t('autocompleteChaos.player.voting') : t('autocompleteChaos.player.confirmVote') }}
      </CyberButton>
    </div>

    <!-- Voted State -->
    <div v-else-if="phase === 'voting' && hasVoted" class="voted-state text-center">
      <div class="success-icon mb-4">
        <div class="checkmark">&#10003;</div>
      </div>
      <h2 class="text-xl font-mono font-bold text-cyan-400 mb-2">
        {{ t('autocompleteChaos.player.voteConfirmed') }}
      </h2>
      <p class="text-cyan-600 font-mono text-sm">
        {{ t('autocompleteChaos.player.watchHost') }}
      </p>
    </div>

    <!-- Results Phase -->
    <div v-else-if="phase === 'results'" class="results-phase text-center">
      <div class="results-icon mb-4">
        <span class="text-4xl">&#127942;</span>
      </div>
      <h2 class="text-xl font-mono font-bold text-cyan-400 mb-2">
        {{ t('autocompleteChaos.player.roundComplete') }}
      </h2>
      <div class="score-display mb-4">
        <span class="score-label">{{ t('autocompleteChaos.player.yourScore') }}</span>
        <span class="score-value">{{ playerScore }}</span>
        <span class="score-suffix">{{ t('autocompleteChaos.player.points') }}</span>
      </div>
      <p class="text-cyan-600 font-mono text-sm">
        {{ t('autocompleteChaos.player.watchLeaderboard') }}
      </p>
    </div>

    <!-- Waiting Phase -->
    <div v-else class="waiting-phase text-center">
      <div class="loading-spinner mb-4"></div>
      <p class="text-cyan-400 font-mono">{{ t('autocompleteChaos.player.waiting') }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import { AUTOCOMPLETE_CHAOS_CONFIG } from '@/games/ai-takes-over/config/gameConfig'
import CyberButton from '@/games/ai-takes-over/components/atoms/CyberButton.vue'

export default {
  name: 'AutocompleteChaosPlayer',
  components: {
    CyberButton
  },
  props: {
    phase: { type: String, default: 'waiting' },
    currentPrompt: { type: Object, default: null },
    timeRemaining: { type: Number, default: 60 },
    maxTime: { type: Number, default: 60 },
    voteOptions: { type: Array, default: () => [] },
    currentPlayerId: { type: String, default: '' },
    playerScore: { type: Number, default: 0 }
  },
  emits: ['submit-completion', 'submit-vote'],
  setup(props, { emit, expose }) {
    const { t } = useI18n()

    const completion = ref('')
    const hasSubmitted = ref(false)
    const isSubmitting = ref(false)
    const selectedVote = ref(null)
    const hasVoted = ref(false)
    const isVoting = ref(false)

    const minLength = AUTOCOMPLETE_CHAOS_CONFIG.minInputLength
    const maxLength = AUTOCOMPLETE_CHAOS_CONFIG.maxInputLength

    const canSubmit = computed(() => {
      return completion.value.trim().length >= minLength
    })

    const submitCompletion = async () => {
      if (!canSubmit.value || isSubmitting.value) return

      isSubmitting.value = true
      try {
        emit('submit-completion', completion.value.trim())
        hasSubmitted.value = true
      } finally {
        isSubmitting.value = false
      }
    }

    const selectVote = (playerId) => {
      if (playerId === props.currentPlayerId) return
      selectedVote.value = playerId
    }

    const confirmVote = async () => {
      if (!selectedVote.value || isVoting.value) return

      isVoting.value = true
      try {
        emit('submit-vote', selectedVote.value)
        hasVoted.value = true
      } finally {
        isVoting.value = false
      }
    }

    const resetForNewRound = () => {
      completion.value = ''
      hasSubmitted.value = false
      isSubmitting.value = false
      selectedVote.value = null
      hasVoted.value = false
      isVoting.value = false
    }

    expose({ resetForNewRound })

    return {
      t,
      completion,
      hasSubmitted,
      isSubmitting,
      selectedVote,
      hasVoted,
      isVoting,
      minLength,
      maxLength,
      canSubmit,
      submitCompletion,
      selectVote,
      confirmVote
    }
  }
}
</script>

<style scoped>
.autocomplete-chaos-player {
  background: linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #1a1a3a 100%);
}

.prompt-box {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-cyan);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--ai-shadow-glow);
}

.prompt-label {
  font-family: monospace;
  font-size: 10px;
  color: var(--ai-pink);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.prompt-text {
  font-family: monospace;
  font-size: 18px;
  color: var(--ai-cyan);
  line-height: 1.4;
}

.cursor-blink {
  color: var(--ai-pink);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.input-section {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  padding: 16px;
}

.input-label {
  display: block;
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted);
  margin-bottom: 8px;
}

.completion-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  padding: 12px;
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-text);
  resize: none;
}

.completion-input:focus {
  outline: none;
  border-color: var(--ai-cyan);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.completion-input::placeholder {
  color: var(--ai-text-muted);
}

.char-counter {
  text-align: right;
  font-family: monospace;
  font-size: 12px;
  margin-top: 8px;
  color: var(--ai-cyan);
}

.min-warning {
  color: var(--ai-pink);
  margin-left: 8px;
}

.success-icon {
  display: flex;
  justify-content: center;
}

.checkmark {
  width: 60px;
  height: 60px;
  background: var(--ai-cyan);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #000;
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% { transform: scale(0); }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.vote-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vote-option {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border);
  border-radius: 12px;
  padding: 16px;
  text-align: left;
  transition: all 0.2s;
  position: relative;
}

.vote-option:not(:disabled):active {
  transform: scale(0.98);
}

.vote-option.selected {
  border-color: var(--ai-cyan);
  background: rgba(0, 255, 255, 0.1);
  box-shadow: var(--ai-shadow-glow);
}

.vote-option.own-answer {
  opacity: 0.5;
  border-style: dashed;
}

.option-letter {
  width: 24px;
  height: 24px;
  background: var(--ai-cyan);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 8px;
}

.option-text {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text);
  line-height: 1.4;
}

.own-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-family: monospace;
  font-size: 10px;
  color: var(--ai-pink);
  padding: 2px 6px;
  border: 1px solid var(--ai-pink);
  border-radius: 4px;
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
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
}

.score-suffix {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--ai-border);
  border-top-color: var(--ai-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
