<template>
  <div class="player-selection-container">
    <!-- Title -->
    <div class="selection-title">
      <span class="title-text">{{ titleText }}</span>
      <div class="title-underline"></div>
    </div>

    <!-- Players Grid -->
    <div class="players-grid" :class="{ 'selection-active': isSelecting }">
      <div
        v-for="(player, index) in players"
        :key="player.id"
        class="player-card"
        :class="{
          'highlighted': highlightedIndex === index,
          'selected-a': selectedPlayerA?.id === player.id,
          'selected-b': selectedPlayerB?.id === player.id,
          'dimmed': selectionComplete && !isPlayerSelected(player.id)
        }"
      >
        <div class="player-avatar">
          <img :src="player.icon" :alt="player.name" />
        </div>
        <div class="player-name">{{ player.name }}</div>
        <div v-if="selectedPlayerA?.id === player.id" class="selection-badge badge-a">A</div>
        <div v-if="selectedPlayerB?.id === player.id" class="selection-badge badge-b">B</div>
      </div>
    </div>

    <!-- VS Display when both selected -->
    <div v-if="selectionComplete" class="vs-display">
      <div class="vs-player player-a">
        <div class="vs-avatar">
          <img :src="selectedPlayerA.icon" :alt="selectedPlayerA.name" />
        </div>
        <div class="vs-name">{{ selectedPlayerA.name }}</div>
      </div>

      <div class="vs-text">
        <span class="vs-letter">V</span>
        <span class="vs-letter">S</span>
      </div>

      <div class="vs-player player-b">
        <div class="vs-avatar">
          <img :src="selectedPlayerB.icon" :alt="selectedPlayerB.name" />
        </div>
        <div class="vs-name">{{ selectedPlayerB.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'DuellPlayerSelection',
  props: {
    players: {
      type: Array,
      required: true
    },
    selectionSpeed: {
      type: Number,
      default: 100 // ms between highlights
    },
    selectionDuration: {
      type: Number,
      default: 3000 // total selection animation time
    }
  },
  emits: ['selection-start', 'selection-complete'],
  setup(props, { emit, expose }) {
    const isSelecting = ref(false)
    const highlightedIndex = ref(-1)
    const selectedPlayerA = ref(null)
    const selectedPlayerB = ref(null)
    const selectionComplete = ref(false)
    const currentPhase = ref('idle') // idle, selecting-a, selecting-b, complete

    const titleText = computed(() => {
      if (currentPhase.value === 'idle') return 'DUELLANTEN GESUCHT'
      if (currentPhase.value === 'selecting-a') return 'SPIELER A WIRD GEWÄHLT...'
      if (currentPhase.value === 'selecting-b') return 'SPIELER B WIRD GEWÄHLT...'
      return 'DUELL STEHT FEST!'
    })

    const isPlayerSelected = (playerId) => {
      return selectedPlayerA.value?.id === playerId || selectedPlayerB.value?.id === playerId
    }

    const selectPlayers = (playerAIndex = null, playerBIndex = null) => {
      if (isSelecting.value || props.players.length < 2) return

      isSelecting.value = true
      selectionComplete.value = false
      selectedPlayerA.value = null
      selectedPlayerB.value = null
      currentPhase.value = 'selecting-a'

      emit('selection-start')

      // Determine final selections
      let finalA, finalB
      if (playerAIndex !== null && playerBIndex !== null) {
        finalA = playerAIndex
        finalB = playerBIndex
      } else {
        // Random selection
        const indices = [...Array(props.players.length).keys()]
        finalA = indices.splice(Math.floor(Math.random() * indices.length), 1)[0]
        finalB = indices[Math.floor(Math.random() * indices.length)]
      }

      // Animation: rapidly cycle through players
      let cycleCount = 0
      const totalCycles = Math.floor(props.selectionDuration / 2 / props.selectionSpeed)
      let currentSpeed = props.selectionSpeed

      const cycleAnimation = () => {
        highlightedIndex.value = (highlightedIndex.value + 1) % props.players.length
        cycleCount++

        // Slow down as we approach the end
        if (cycleCount > totalCycles * 0.7) {
          currentSpeed = props.selectionSpeed * (1 + (cycleCount - totalCycles * 0.7) / (totalCycles * 0.3) * 2)
        }

        if (cycleCount < totalCycles) {
          setTimeout(cycleAnimation, currentSpeed)
        } else {
          // Land on player A
          highlightedIndex.value = finalA
          setTimeout(() => {
            selectedPlayerA.value = props.players[finalA]
            currentPhase.value = 'selecting-b'

            // Start selecting player B
            cycleCount = 0
            currentSpeed = props.selectionSpeed

            const cycleBAnimation = () => {
              // Skip selected player A
              let next = (highlightedIndex.value + 1) % props.players.length
              if (next === finalA) next = (next + 1) % props.players.length
              highlightedIndex.value = next
              cycleCount++

              if (cycleCount > totalCycles * 0.7) {
                currentSpeed = props.selectionSpeed * (1 + (cycleCount - totalCycles * 0.7) / (totalCycles * 0.3) * 2)
              }

              if (cycleCount < totalCycles) {
                setTimeout(cycleBAnimation, currentSpeed)
              } else {
                // Land on player B
                highlightedIndex.value = finalB
                setTimeout(() => {
                  selectedPlayerB.value = props.players[finalB]
                  highlightedIndex.value = -1
                  currentPhase.value = 'complete'
                  selectionComplete.value = true
                  isSelecting.value = false

                  emit('selection-complete', {
                    playerA: props.players[finalA],
                    playerB: props.players[finalB]
                  })
                }, 500)
              }
            }

            setTimeout(cycleBAnimation, 500)
          }, 500)
        }
      }

      setTimeout(cycleAnimation, 300)
    }

    const reset = () => {
      isSelecting.value = false
      highlightedIndex.value = -1
      selectedPlayerA.value = null
      selectedPlayerB.value = null
      selectionComplete.value = false
      currentPhase.value = 'idle'
    }

    expose({ selectPlayers, reset })

    return {
      isSelecting,
      highlightedIndex,
      selectedPlayerA,
      selectedPlayerB,
      selectionComplete,
      titleText,
      isPlayerSelected
    }
  }
}
</script>

<style scoped>
.player-selection-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 20px;
}

.selection-title {
  text-align: center;
}

.title-text {
  font-family: monospace;
  font-size: 28px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.title-underline {
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--ai-cyan, #00ffff), transparent);
  margin-top: 8px;
  animation: underlinePulse 2s ease infinite;
}

@keyframes underlinePulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.players-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  max-width: 600px;
}

.player-card {
  position: relative;
  width: 100px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border, #1e3a5f);
  border-radius: 12px;
  text-align: center;
  transition: all 0.15s ease;
}

.player-card.highlighted {
  border-color: var(--ai-cyan, #00ffff);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.1);
  transform: scale(1.1);
  z-index: 10;
}

.player-card.selected-a {
  border-color: var(--ai-pink, #ff00ff);
  box-shadow: 0 0 25px rgba(255, 0, 255, 0.6);
  transform: scale(1.05);
}

.player-card.selected-b {
  border-color: var(--ai-cyan, #00ffff);
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.6);
  transform: scale(1.05);
}

.player-card.dimmed {
  opacity: 0.3;
  transform: scale(0.9);
}

.player-avatar {
  width: 60px;
  height: 60px;
  margin: 0 auto 8px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--ai-border, #1e3a5f);
}

.player-card.highlighted .player-avatar,
.player-card.selected-a .player-avatar,
.player-card.selected-b .player-avatar {
  border-color: inherit;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-name {
  font-family: monospace;
  font-size: 12px;
  color: var(--ai-text, #e0e0e0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selection-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  animation: badgePop 0.3s ease;
}

@keyframes badgePop {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.badge-a {
  background: var(--ai-pink, #ff00ff);
  color: white;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.8);
}

.badge-b {
  background: var(--ai-cyan, #00ffff);
  color: black;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

/* VS Display */
.vs-display {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 30px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--ai-cyan, #00ffff);
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  animation: vsAppear 0.5s ease;
}

@keyframes vsAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.vs-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.vs-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid;
}

.player-a .vs-avatar {
  border-color: var(--ai-pink, #ff00ff);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
}

.player-b .vs-avatar {
  border-color: var(--ai-cyan, #00ffff);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.vs-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vs-name {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  color: var(--ai-text, #e0e0e0);
  text-transform: uppercase;
}

.player-a .vs-name {
  color: var(--ai-pink, #ff00ff);
}

.player-b .vs-name {
  color: var(--ai-cyan, #00ffff);
}

.vs-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vs-letter {
  font-family: monospace;
  font-size: 48px;
  font-weight: bold;
  line-height: 0.8;
  background: linear-gradient(180deg, var(--ai-pink, #ff00ff), var(--ai-cyan, #00ffff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
  animation: vsPulse 1s ease infinite alternate;
}

@keyframes vsPulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
</style>
