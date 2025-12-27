<template>
  <div class="werbung-fuer-muell-host">
    <!-- Phase: Writing - Players are writing their ad pitches -->
    <div v-if="phase === 'writing'" class="writing-phase">
      <div class="phase-header text-center mb-6">
        <h2 class="text-2xl font-mono font-bold ai-text-glow mb-2">
          {{ t('werbungFuerMuell.name') }}
        </h2>
        <p class="text-cyan-600 font-mono text-sm">
          {{ t('werbungFuerMuell.host.round', { current: currentRound + 1, total: totalRounds }) }}
        </p>
      </div>

      <!-- Current Product -->
      <div class="product-display mb-8">
        <TerminalBox :title="t('werbungFuerMuell.host.productLabel')" :show-dots="true">
          <div class="p-6 text-center">
            <h3 class="text-2xl font-mono text-cyan-400 mb-3">{{ currentProduct?.name }}</h3>
            <p class="text-lg font-mono text-cyan-600">{{ currentProduct?.description }}</p>
          </div>
        </TerminalBox>
      </div>

      <!-- Timer -->
      <div class="timer-display text-center mb-6">
        <div class="timer-circle mx-auto">
          <span class="timer-value">{{ timeRemaining }}</span>
        </div>
        <p class="text-cyan-500 font-mono text-sm mt-2">{{ t('werbungFuerMuell.host.writingHint') }}</p>
      </div>

      <!-- Submission Counter -->
      <div class="submission-counter text-center">
        <TerminalBox :show-header="false" class="inline-block">
          <div class="px-8 py-4">
            <span class="text-4xl font-mono font-bold text-cyan-400">{{ submissionCount }}</span>
            <span class="text-xl font-mono text-cyan-600">/{{ totalPlayers }}</span>
            <p class="text-cyan-500 font-mono text-sm mt-2">{{ t('werbungFuerMuell.host.submitted') }}</p>
          </div>
        </TerminalBox>
      </div>

      <!-- Skip Button (when all submitted) -->
      <div v-if="allSubmitted" class="text-center mt-6">
        <CyberButton @click="$emit('start-reveal')" class="px-8 py-3">
          {{ t('werbungFuerMuell.host.revealButton') }}
        </CyberButton>
      </div>
    </div>

    <!-- Phase: Reveal - Show all pitches -->
    <div v-else-if="phase === 'reveal'" class="reveal-phase">
      <!-- Product Reminder -->
      <div class="product-reminder text-center mb-6">
        <p class="text-lg font-mono text-cyan-400">{{ currentProduct?.name }}</p>
        <p class="text-sm font-mono text-cyan-600">{{ currentProduct?.description }}</p>
      </div>

      <!-- All Pitches -->
      <div class="pitches-list">
        <div
          v-for="(submission, index) in submissions"
          :key="submission.playerId"
          class="pitch-card"
          :style="{ animationDelay: index * 0.2 + 's' }"
        >
          <div class="pitch-header">
            <div class="pitch-letter">{{ String.fromCharCode(65 + index) }}</div>
            <div class="pitch-badge">WERBEPITCH</div>
          </div>
          <p class="pitch-text">{{ submission.pitch }}</p>
          <div class="player-tag" v-if="showAuthors">
            <img :src="submission.playerIcon" class="player-mini-icon" />
            <span>{{ submission.playerName }}</span>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls text-center mt-8">
        <CyberButton @click="$emit('start-voting')" class="px-8 py-3">
          {{ t('werbungFuerMuell.host.startVoting') }}
        </CyberButton>
      </div>
    </div>

    <!-- Phase: Voting -->
    <div v-else-if="phase === 'voting'" class="voting-phase">
      <!-- Product Reminder -->
      <div class="product-reminder text-center mb-4">
        <p class="text-lg font-mono text-cyan-400">{{ currentProduct?.name }}</p>
      </div>

      <!-- Voting Timer -->
      <div class="voting-info text-center mb-4">
        <div class="timer-small">{{ timeRemaining }}s</div>
        <p class="text-cyan-500 font-mono text-sm">{{ t('werbungFuerMuell.host.votingNow') }}</p>
      </div>

      <!-- Pitches with Vote Counts -->
      <div class="pitches-list voting">
        <div
          v-for="(submission, index) in submissions"
          :key="submission.playerId"
          class="pitch-card"
          :class="{ 'has-votes': submission.votes > 0 }"
        >
          <div class="pitch-header">
            <div class="pitch-letter">{{ String.fromCharCode(65 + index) }}</div>
          </div>
          <p class="pitch-text">{{ submission.pitch }}</p>
          <div class="vote-count">
            <span class="vote-number">{{ submission.votes }}</span>
            <span class="vote-label">{{ t('werbungFuerMuell.host.votes') }}</span>
          </div>
        </div>
      </div>

      <!-- Finish Voting Button -->
      <div class="controls text-center mt-6">
        <CyberButton @click="$emit('finish-voting')" class="px-8 py-3">
          {{ t('werbungFuerMuell.host.showResults') }}
        </CyberButton>
      </div>
    </div>

    <!-- Phase: Round Results -->
    <div v-else-if="phase === 'results'" class="results-phase">
      <div class="phase-header text-center mb-6">
        <h2 class="text-2xl font-mono font-bold ai-text-glow mb-2">
          {{ t('werbungFuerMuell.host.roundComplete', { round: currentRound + 1 }) }}
        </h2>
      </div>

      <!-- Winner Announcement -->
      <div v-if="roundWinner" class="winner-announcement mb-8">
        <TerminalBox :title="t('werbungFuerMuell.host.bestPitch')" :show-dots="true">
          <div class="p-6 text-center">
            <div class="product-sold mb-4">
              <span class="sold-badge">VERKAUFT!</span>
              <span class="product-name">{{ currentProduct?.name }}</span>
            </div>
            <p class="text-lg font-mono text-cyan-400 mb-4">"{{ roundWinner.pitch }}"</p>
            <div class="winner-info">
              <img :src="roundWinner.playerIcon" class="winner-icon" />
              <span class="winner-name">{{ roundWinner.playerName }}</span>
              <span class="winner-votes">{{ roundWinner.votes }} {{ t('werbungFuerMuell.host.votes') }}</span>
            </div>
          </div>
        </TerminalBox>
      </div>

      <!-- Scoreboard -->
      <div class="scoreboard">
        <div
          v-for="(playerScore, index) in sortedScores"
          :key="playerScore.playerId"
          class="score-row"
          :class="{ 'top-three': index < 3 }"
        >
          <div class="rank">{{ index + 1 }}</div>
          <div class="player-info">
            <img :src="playerScore.icon" class="player-icon" />
            <span class="player-name">{{ playerScore.name }}</span>
          </div>
          <div class="score">{{ playerScore.score }} {{ t('werbungFuerMuell.host.points') }}</div>
        </div>
      </div>

      <!-- Next Round Button -->
      <div class="text-center mt-8">
        <CyberButton @click="$emit('next-round')" class="px-8 py-3">
          {{ hasMoreRounds ? t('werbungFuerMuell.host.nextRound') : t('werbungFuerMuell.host.finishGame') }}
        </CyberButton>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import TerminalBox from '@/games/ai-takes-over/components/molecules/TerminalBox.vue'
import CyberButton from '@/games/ai-takes-over/components/atoms/CyberButton.vue'

export default {
  name: 'WerbungFuerMuellHost',
  components: {
    TerminalBox,
    CyberButton
  },
  props: {
    phase: { type: String, required: true },
    currentRound: { type: Number, default: 0 },
    totalRounds: { type: Number, default: 4 },
    currentProduct: { type: Object, default: null },
    timeRemaining: { type: Number, default: 120 },
    submissionCount: { type: Number, default: 0 },
    totalPlayers: { type: Number, default: 0 },
    allSubmitted: { type: Boolean, default: false },
    submissions: { type: Array, default: () => [] },
    showAuthors: { type: Boolean, default: false },
    scores: { type: Object, default: () => ({}) },
    players: { type: Array, default: () => [] }
  },
  emits: ['start-reveal', 'start-voting', 'finish-voting', 'next-round'],
  setup(props) {
    const { t } = useI18n()

    const hasMoreRounds = computed(() => props.currentRound < props.totalRounds - 1)

    const roundWinner = computed(() => {
      if (!props.submissions.length) return null
      const sorted = [...props.submissions].sort((a, b) => b.votes - a.votes)
      return sorted[0]?.votes > 0 ? sorted[0] : null
    })

    const sortedScores = computed(() => {
      return props.players
        .map(player => ({
          playerId: player.id,
          name: player.name,
          icon: player.icon,
          score: props.scores[player.id] || 0
        }))
        .sort((a, b) => b.score - a.score)
    })

    return { t, hasMoreRounds, roundWinner, sortedScores }
  }
}
</script>

<style scoped>
.werbung-fuer-muell-host {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.timer-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid var(--ai-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--ai-shadow-glow);
}

.timer-value {
  font-size: 40px;
  font-family: monospace;
  font-weight: bold;
  color: var(--ai-cyan);
}

.timer-small {
  font-size: 24px;
  font-family: monospace;
  font-weight: bold;
  color: var(--ai-cyan);
}

.product-reminder {
  padding: 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
}

.pitches-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pitch-card {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  animation: revealPitch 0.5s ease forwards;
}

@keyframes revealPitch {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pitch-card.has-votes {
  border-color: var(--ai-cyan);
  box-shadow: var(--ai-shadow-glow);
}

.pitch-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.pitch-letter {
  background: var(--ai-cyan);
  color: #000;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-weight: bold;
  font-size: 14px;
}

.pitch-badge {
  font-family: monospace;
  font-size: 10px;
  color: var(--ai-pink);
  text-transform: uppercase;
  padding: 2px 8px;
  border: 1px solid var(--ai-pink);
  border-radius: 4px;
}

.pitch-text {
  color: var(--ai-text);
  font-family: monospace;
  font-size: 16px;
  line-height: 1.6;
  font-style: italic;
}

.player-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--ai-border);
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text-muted);
}

.player-mini-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.vote-count {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--ai-border);
}

.vote-number {
  font-size: 28px;
  font-family: monospace;
  font-weight: bold;
  color: var(--ai-cyan);
}

.vote-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--ai-text-muted);
  text-transform: uppercase;
}

.winner-announcement {
  max-width: 700px;
  margin: 0 auto;
}

.product-sold {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.sold-badge {
  background: var(--ai-pink);
  color: #fff;
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 4px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.product-name {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-text);
}

.winner-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.winner-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid var(--ai-cyan);
}

.winner-name {
  font-family: monospace;
  font-size: 18px;
  color: var(--ai-text);
}

.winner-votes {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-cyan);
  padding: 4px 12px;
  background: rgba(var(--ai-cyan-rgb), 0.2);
  border-radius: 20px;
}

.scoreboard {
  max-width: 500px;
  margin: 0 auto;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  margin-bottom: 8px;
}

.score-row.top-three {
  background: rgba(var(--ai-cyan-rgb), 0.1);
  border-color: var(--ai-cyan);
}

.rank {
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
  font-size: 14px;
}

.player-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--ai-border);
}

.player-name {
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text);
}

.score {
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  color: var(--ai-cyan);
}
</style>
