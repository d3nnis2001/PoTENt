<template>
  <div class="bildertitel-host">
    <!-- Phase: Writing - Players are writing titles -->
    <div v-if="phase === 'writing'" class="writing-phase">
      <div class="phase-header text-center mb-8">
        <h2 class="text-3xl font-mono font-bold ai-text-glow mb-2">
          {{ t('bildertitel.host.writingTitle') }}
        </h2>
        <p class="text-cyan-600 font-mono">{{ t('bildertitel.host.writingSubtitle') }}</p>
      </div>

      <!-- Timer -->
      <div class="timer-display text-center mb-8">
        <div class="timer-circle mx-auto">
          <span class="timer-value">{{ timeRemaining }}</span>
        </div>
      </div>

      <!-- Submission Counter -->
      <div class="submission-counter text-center">
        <TerminalBox :show-header="false" class="inline-block">
          <div class="px-8 py-4">
            <span class="text-5xl font-mono font-bold text-cyan-400">{{ submissionCount }}</span>
            <span class="text-2xl font-mono text-cyan-600">/{{ totalPlayers }}</span>
            <p class="text-cyan-500 font-mono text-sm mt-2">{{ t('bildertitel.host.submitted') }}</p>
          </div>
        </TerminalBox>
      </div>

      <!-- Skip Button (when all submitted) -->
      <div v-if="allSubmitted" class="text-center mt-8">
        <CyberButton @click="$emit('start-reveal')" class="px-8 py-3">
          {{ t('bildertitel.host.revealButton') }}
        </CyberButton>
      </div>
    </div>

    <!-- Phase: Reveal & Voting -->
    <div v-else-if="phase === 'reveal' || phase === 'voting'" class="reveal-phase">
      <!-- Current Image -->
      <div class="image-container mb-6">
        <div class="image-frame">
          <img :src="currentImage?.src" :alt="'Bild ' + (currentRevealIndex + 1)" class="reveal-image" />
          <div class="image-number">{{ currentRevealIndex + 1 }}/{{ totalImages }}</div>
        </div>
      </div>

      <!-- Titles for this image -->
      <div class="titles-grid">
        <div
          v-for="(submission, index) in titlesForCurrentImage"
          :key="submission.playerId"
          class="title-card"
          :class="{ 'has-votes': submission.votes > 0 }"
        >
          <div class="title-letter">{{ String.fromCharCode(65 + index) }}</div>
          <p class="title-text">{{ submission.title }}</p>
          <div class="vote-count" v-if="phase === 'voting' || showVotes">
            <span class="vote-number">{{ submission.votes }}</span>
            <span class="vote-label">{{ t('bildertitel.host.votes') }}</span>
          </div>
        </div>
      </div>

      <!-- Voting Timer -->
      <div v-if="phase === 'voting'" class="voting-info text-center mt-6">
        <div class="timer-small">{{ timeRemaining }}s</div>
        <p class="text-cyan-500 font-mono text-sm">{{ t('bildertitel.host.votingNow') }}</p>
      </div>

      <!-- Controls -->
      <div class="controls text-center mt-6">
        <CyberButton
          v-if="phase === 'reveal'"
          @click="$emit('start-voting')"
          class="px-8 py-3"
        >
          {{ t('bildertitel.host.startVoting') }}
        </CyberButton>

        <CyberButton
          v-else-if="phase === 'voting'"
          @click="$emit('finish-voting')"
          class="px-8 py-3"
        >
          {{ t('bildertitel.host.nextImage') }}
        </CyberButton>
      </div>
    </div>

    <!-- Phase: Round Results -->
    <div v-else-if="phase === 'results'" class="results-phase">
      <div class="phase-header text-center mb-8">
        <h2 class="text-3xl font-mono font-bold ai-text-glow mb-2">
          {{ t('bildertitel.host.roundComplete', { round: currentRound + 1 }) }}
        </h2>
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
          <div class="score">{{ playerScore.score }} {{ t('bildertitel.host.points') }}</div>
        </div>
      </div>

      <!-- Next Round Button -->
      <div class="text-center mt-8">
        <CyberButton @click="$emit('next-round')" class="px-8 py-3">
          {{ hasMoreRounds ? t('bildertitel.host.nextRound') : t('bildertitel.host.finishGame') }}
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
  name: 'BildertitelHost',
  components: {
    TerminalBox,
    CyberButton
  },
  props: {
    phase: {
      type: String,
      required: true
    },
    currentRound: {
      type: Number,
      default: 0
    },
    totalRounds: {
      type: Number,
      default: 3
    },
    timeRemaining: {
      type: Number,
      default: 60
    },
    submissionCount: {
      type: Number,
      default: 0
    },
    totalPlayers: {
      type: Number,
      default: 0
    },
    allSubmitted: {
      type: Boolean,
      default: false
    },
    currentImage: {
      type: Object,
      default: null
    },
    currentRevealIndex: {
      type: Number,
      default: 0
    },
    totalImages: {
      type: Number,
      default: 0
    },
    titlesForCurrentImage: {
      type: Array,
      default: () => []
    },
    showVotes: {
      type: Boolean,
      default: false
    },
    scores: {
      type: Object,
      default: () => ({})
    },
    players: {
      type: Array,
      default: () => []
    }
  },
  emits: ['start-reveal', 'start-voting', 'finish-voting', 'next-round'],
  setup(props) {
    const { t } = useI18n()

    const hasMoreRounds = computed(() => props.currentRound < props.totalRounds - 1)

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

    return {
      t,
      hasMoreRounds,
      sortedScores
    }
  }
}
</script>

<style scoped>
.bildertitel-host {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.timer-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--ai-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--ai-shadow-glow);
}

.timer-value {
  font-size: 48px;
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

.image-container {
  display: flex;
  justify-content: center;
}

.image-frame {
  position: relative;
  max-width: 800px;
  border: 3px solid var(--ai-cyan);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--ai-shadow-glow);
}

.reveal-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  background: #000;
}

.image-number {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: var(--ai-cyan);
  padding: 4px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.titles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.title-card {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border);
  border-radius: 8px;
  padding: 16px;
  position: relative;
  transition: all 0.3s;
}

.title-card.has-votes {
  border-color: var(--ai-cyan);
  box-shadow: var(--ai-shadow-glow);
}

.title-letter {
  position: absolute;
  top: -12px;
  left: 16px;
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
  font-size: 16px;
}

.title-text {
  color: var(--ai-text);
  font-family: monospace;
  font-size: 18px;
  margin-top: 8px;
  min-height: 60px;
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
  font-size: 32px;
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

.scoreboard {
  max-width: 600px;
  margin: 0 auto;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
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
}

.player-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--ai-border);
}

.player-name {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-text);
}

.score {
  font-family: monospace;
  font-size: 20px;
  font-weight: bold;
  color: var(--ai-cyan);
}
</style>
