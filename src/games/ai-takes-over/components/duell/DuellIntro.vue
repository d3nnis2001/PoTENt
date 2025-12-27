<template>
  <div class="duell-intro min-h-screen ai-background">
    <!-- Background effects -->
    <div class="background-effects">
      <div class="grid-overlay"></div>
      <div class="scanlines"></div>
    </div>

    <!-- Content -->
    <div class="intro-content">
      <!-- Phase 1: Bob Announcement -->
      <div v-if="phase === 'announcement'" class="announcement-phase">
        <div class="bob-message">
          <div class="bob-icon">🤖</div>
          <div class="message-box">
            <div class="message-text typewriter">
              {{ currentMessage }}
              <span class="cursor">|</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Phase 2: Player Selection -->
      <div v-else-if="phase === 'player-selection'" class="selection-phase">
        <DuellPlayerSelection
          ref="playerSelectionRef"
          :players="players"
          @selection-complete="onPlayersSelected"
        />
      </div>

      <!-- Phase 3: Wheel Spin -->
      <div v-else-if="phase === 'wheel-spin'" class="wheel-phase">
        <div class="wheel-header">
          <h2 class="wheel-title">WELCHES DUELL?</h2>
          <p class="wheel-subtitle">Bob dreht das Rad...</p>
        </div>

        <DuellWheel
          ref="wheelRef"
          :segments="duellGames"
          @spin-end="onWheelResult"
        />
      </div>

      <!-- Phase 4: Final Reveal -->
      <div v-else-if="phase === 'reveal'" class="reveal-phase">
        <div class="reveal-container">
          <!-- Players VS -->
          <div class="final-matchup">
            <div class="final-player player-a">
              <div class="final-avatar">
                <img :src="selectedPlayers.playerA.icon" :alt="selectedPlayers.playerA.name" />
              </div>
              <div class="final-name">{{ selectedPlayers.playerA.name }}</div>
            </div>

            <div class="final-vs">VS</div>

            <div class="final-player player-b">
              <div class="final-avatar">
                <img :src="selectedPlayers.playerB.icon" :alt="selectedPlayers.playerB.name" />
              </div>
              <div class="final-name">{{ selectedPlayers.playerB.name }}</div>
            </div>
          </div>

          <!-- Selected Game -->
          <div class="selected-game">
            <div class="game-icon">{{ selectedGame.icon }}</div>
            <div class="game-name">{{ selectedGame.name }}</div>
            <div class="game-description">{{ selectedGame.description }}</div>
          </div>

          <!-- Start Button (Host only) -->
          <div v-if="isHost" class="start-section">
            <button class="start-button" @click="startDuell">
              <span class="button-text">DUELL STARTEN</span>
              <span class="button-glow"></span>
            </button>
          </div>
          <div v-else class="waiting-text">
            Warte auf Host...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import DuellWheel from './DuellWheel.vue'
import DuellPlayerSelection from './DuellPlayerSelection.vue'

export default {
  name: 'DuellIntro',
  components: {
    DuellWheel,
    DuellPlayerSelection
  },
  props: {
    players: {
      type: Array,
      required: true
    },
    isHost: {
      type: Boolean,
      default: false
    },
    duellGames: {
      type: Array,
      default: () => [
        {
          id: 'schneller-finger',
          name: 'SCHNELLER FINGER',
          shortName: 'SCHNELL',
          icon: '⚡',
          color: '#1a1a3a',
          description: 'Wer tippt schneller?'
        },
        {
          id: 'schaetz-duell',
          name: 'SCHÄTZ-DUELL',
          shortName: 'SCHÄTZEN',
          icon: '📊',
          color: '#2a1a3a',
          description: 'Wer schätzt besser?'
        },
        {
          id: 'higher-lower',
          name: 'HIGHER LOWER',
          shortName: 'HI-LO',
          icon: '⬆️',
          color: '#1a2a3a',
          description: 'Höher oder niedriger?'
        },
        {
          id: 'bobs-captcha',
          name: "BOB'S CAPTCHA",
          shortName: 'CAPTCHA',
          icon: '🤖',
          color: '#3a1a2a',
          description: 'Beweise dass du kein Bot bist!'
        },
        {
          id: 'ki-oder-kind',
          name: 'KI ODER KIND?',
          shortName: 'KI/KIND',
          icon: '👶',
          color: '#1a3a2a',
          description: 'Wer hat das gemalt?'
        },
        {
          id: 'turing-test',
          name: "BOB'S TURING TEST",
          shortName: 'TURING',
          icon: '🧠',
          color: '#2a2a1a',
          description: 'Mensch oder Maschine?'
        }
      ]
    },
    // Pre-selected values (for syncing with other players)
    preSelectedPlayerA: {
      type: Object,
      default: null
    },
    preSelectedPlayerB: {
      type: Object,
      default: null
    },
    preSelectedGame: {
      type: Object,
      default: null
    }
  },
  emits: ['duell-ready', 'start-duell'],
  setup(props, { emit, expose }) {
    const phase = ref('announcement')
    const currentMessage = ref('')
    const playerSelectionRef = ref(null)
    const wheelRef = ref(null)
    const selectedPlayers = ref({ playerA: null, playerB: null })
    const selectedGame = ref(null)

    const bobMessages = [
      'Zeit für ein DUELL!',
      'Wer wird gegeneinander antreten?',
      'Lasst uns die Kämpfer auswählen...'
    ]

    const typeMessage = async (message) => {
      currentMessage.value = ''
      for (let i = 0; i < message.length; i++) {
        currentMessage.value += message[i]
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    const runAnnouncement = async () => {
      for (const message of bobMessages) {
        await typeMessage(message)
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      phase.value = 'player-selection'

      // Start player selection after a brief delay
      setTimeout(() => {
        if (props.preSelectedPlayerA && props.preSelectedPlayerB) {
          // Use pre-selected players (for non-host sync)
          const indexA = props.players.findIndex(p => p.id === props.preSelectedPlayerA.id)
          const indexB = props.players.findIndex(p => p.id === props.preSelectedPlayerB.id)
          playerSelectionRef.value?.selectPlayers(indexA, indexB)
        } else {
          // Random selection (host)
          playerSelectionRef.value?.selectPlayers()
        }
      }, 500)
    }

    const onPlayersSelected = (result) => {
      selectedPlayers.value = result

      // Delay before wheel phase
      setTimeout(() => {
        phase.value = 'wheel-spin'

        // Start wheel spin after a brief delay
        setTimeout(() => {
          if (props.preSelectedGame) {
            // Use pre-selected game (for non-host sync)
            const gameIndex = props.duellGames.findIndex(g => g.id === props.preSelectedGame.id)
            wheelRef.value?.spin(gameIndex >= 0 ? gameIndex : null)
          } else {
            // Random spin (host)
            wheelRef.value?.spin()
          }
        }, 1000)
      }, 2000)
    }

    const onWheelResult = (game) => {
      selectedGame.value = game

      // Delay before final reveal
      setTimeout(() => {
        phase.value = 'reveal'

        emit('duell-ready', {
          playerA: selectedPlayers.value.playerA,
          playerB: selectedPlayers.value.playerB,
          game: selectedGame.value
        })
      }, 1500)
    }

    const startDuell = () => {
      emit('start-duell', {
        playerA: selectedPlayers.value.playerA,
        playerB: selectedPlayers.value.playerB,
        game: selectedGame.value
      })
    }

    const reset = () => {
      phase.value = 'announcement'
      currentMessage.value = ''
      selectedPlayers.value = { playerA: null, playerB: null }
      selectedGame.value = null
      playerSelectionRef.value?.reset()
      wheelRef.value?.reset()
    }

    const start = () => {
      runAnnouncement()
    }

    // Skip to reveal phase (for syncing)
    const skipToReveal = (playerA, playerB, game) => {
      selectedPlayers.value = { playerA, playerB }
      selectedGame.value = game
      phase.value = 'reveal'
    }

    expose({ start, reset, skipToReveal })

    onMounted(() => {
      // Auto-start if not controlled externally
      // start()
    })

    return {
      phase,
      currentMessage,
      playerSelectionRef,
      wheelRef,
      selectedPlayers,
      selectedGame,
      onPlayersSelected,
      onWheelResult,
      startDuell
    }
  }
}
</script>

<style scoped>
.duell-intro {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #1a1a3a 100%);
}

.background-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
}

.intro-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 800px;
  padding: 40px 20px;
}

/* Announcement Phase */
.announcement-phase {
  display: flex;
  justify-content: center;
}

.bob-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.bob-icon {
  font-size: 80px;
  animation: bobFloat 3s ease-in-out infinite;
}

@keyframes bobFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.message-box {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--ai-cyan, #00ffff);
  border-radius: 16px;
  padding: 24px 40px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
}

.message-text {
  font-family: monospace;
  font-size: 24px;
  color: var(--ai-cyan, #00ffff);
  text-align: center;
}

.cursor {
  animation: blink 1s step-end infinite;
  color: var(--ai-pink, #ff00ff);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Selection Phase */
.selection-phase {
  animation: fadeIn 0.5s ease;
}

/* Wheel Phase */
.wheel-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  animation: fadeIn 0.5s ease;
}

.wheel-header {
  text-align: center;
}

.wheel-title {
  font-family: monospace;
  font-size: 32px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.wheel-subtitle {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-text-muted, #8892b0);
}

/* Reveal Phase */
.reveal-phase {
  animation: fadeIn 0.5s ease;
}

.reveal-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.final-matchup {
  display: flex;
  align-items: center;
  gap: 40px;
}

.final-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.final-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid;
  animation: avatarGlow 2s ease infinite alternate;
}

.player-a .final-avatar {
  border-color: var(--ai-pink, #ff00ff);
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.5);
}

.player-b .final-avatar {
  border-color: var(--ai-cyan, #00ffff);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

@keyframes avatarGlow {
  from { filter: brightness(1); }
  to { filter: brightness(1.2); }
}

.final-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.final-name {
  font-family: monospace;
  font-size: 20px;
  font-weight: bold;
  text-transform: uppercase;
}

.player-a .final-name {
  color: var(--ai-pink, #ff00ff);
}

.player-b .final-name {
  color: var(--ai-cyan, #00ffff);
}

.final-vs {
  font-family: monospace;
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(180deg, var(--ai-pink, #ff00ff), var(--ai-cyan, #00ffff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: vsPulse 1s ease infinite alternate;
}

@keyframes vsPulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.selected-game {
  text-align: center;
  padding: 30px 50px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--ai-cyan, #00ffff);
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.3);
  animation: gameReveal 0.5s ease;
}

@keyframes gameReveal {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.game-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.game-name {
  font-family: monospace;
  font-size: 28px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 8px;
}

.game-description {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-text-muted, #8892b0);
}

.start-section {
  margin-top: 20px;
}

.start-button {
  position: relative;
  padding: 16px 48px;
  background: linear-gradient(135deg, var(--ai-pink, #ff00ff), var(--ai-cyan, #00ffff));
  border: none;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.start-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

.start-button:active {
  transform: scale(0.98);
}

.button-text {
  position: relative;
  z-index: 1;
  font-family: monospace;
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.button-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--ai-pink, #ff00ff), var(--ai-cyan, #00ffff));
  filter: blur(10px);
  opacity: 0.5;
  z-index: 0;
}

.waiting-text {
  font-family: monospace;
  font-size: 16px;
  color: var(--ai-text-muted, #8892b0);
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
