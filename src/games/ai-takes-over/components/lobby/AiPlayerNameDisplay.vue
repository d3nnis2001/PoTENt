<template>
  <div class="absolute inset-0 pointer-events-none overflow-hidden">
    <transition-group name="player-join" tag="div">
      <div
        v-for="player in players"
        :key="player.id"
        :class="[
          'absolute transition-all duration-700 ease-out transform pointer-events-auto player-badge',
          getPlayerClasses(player.id)
        ]"
        :style="getPlayerPosition(player.id)"
      >
        <div
          class="cyber-badge backdrop-blur-md rounded-lg px-4 py-2 transform-gpu"
          :style="getPlayerStyle(player.id)"
        >
          <div class="flex items-center gap-2">
            <!-- Robot Icon -->
            <div class="w-6 h-6 flex items-center justify-center">
              <img
                v-if="player.icon && (player.icon.startsWith('/') || player.icon.includes('Character') || player.icon.includes('Ai'))"
                :src="player.icon"
                alt="Character"
                class="w-full h-full object-contain"
              />
              <span v-else class="text-lg">🤖</span>
            </div>
            <!-- Player Name -->
            <span
              class="font-mono font-bold text-sm whitespace-nowrap"
              :style="getTextStyle(player.id)"
            >
              {{ player.name }}
            </span>
            <!-- Glitch decoration -->
            <span class="text-xs opacity-50" :style="{ color: getColor(player.id) }">_</span>
          </div>
          <!-- Scan line inside badge -->
          <div class="scan-line"></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'AiPlayerNameDisplay',
  props: {
    players: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      playerPositions: new Map(),
      usedPositions: new Set()
    }
  },
  methods: {
    getColor(playerId) {
      const colors = [
        '#00ffff', // cyan
        '#ff00ff', // magenta
        '#00ff88', // green
        '#ff6b6b', // red
        '#ffd93d', // yellow
        '#6bcfff', // light blue
        '#ff8888', // pink
        '#88ff88', // light green
        '#ffaa00', // orange
        '#aa88ff', // purple
        '#00ffaa', // teal
        '#ff88ff', // light magenta
      ]

      let hash = 0
      for (let i = 0; i < playerId.length; i++) {
        hash = ((hash << 5) - hash + playerId.charCodeAt(i)) & 0xffffffff
      }
      return colors[Math.abs(hash) % colors.length]
    },

    getAllPossiblePositions() {
      const positions = []

      // Left side
      for (let i = 0; i < 8; i++) {
        positions.push({
          top: `${5 + (i * 11)}%`,
          left: `${Math.random() * 8 + 1}%`,
          transform: `rotate(${-15 + Math.random() * 10}deg)`
        })
      }

      // Right side
      for (let i = 0; i < 8; i++) {
        positions.push({
          top: `${5 + (i * 11)}%`,
          right: `${Math.random() * 8 + 1}%`,
          transform: `rotate(${5 + Math.random() * 10}deg)`
        })
      }

      return positions
    },

    getPlayerPosition(playerId) {
      if (this.playerPositions.has(playerId)) {
        return this.playerPositions.get(playerId)
      }

      const allPositions = this.getAllPossiblePositions()
      const availablePositions = allPositions.filter((_, index) => !this.usedPositions.has(index))

      if (availablePositions.length === 0) {
        const randomIndex = Math.floor(Math.random() * allPositions.length)
        const position = allPositions[randomIndex]
        this.playerPositions.set(playerId, position)
        return position
      }

      const randomIndex = Math.floor(Math.random() * availablePositions.length)
      const chosenPosition = availablePositions[randomIndex]
      const originalIndex = allPositions.indexOf(chosenPosition)

      this.usedPositions.add(originalIndex)
      this.playerPositions.set(playerId, chosenPosition)

      return chosenPosition
    },

    getPlayerStyle(playerId) {
      const color = this.getColor(playerId)
      return {
        background: `linear-gradient(135deg, rgba(0, 10, 20, 0.9), rgba(0, 20, 40, 0.8))`,
        border: `1px solid ${color}80`,
        boxShadow: `0 0 20px ${color}40, inset 0 0 30px ${color}10`
      }
    },

    getTextStyle(playerId) {
      const color = this.getColor(playerId)
      return {
        color: color,
        textShadow: `0 0 10px ${color}80, 0 0 20px ${color}40`
      }
    },

    getPlayerClasses() {
      return ['animate-float']
    }
  },

  watch: {
    players: {
      handler(newPlayers) {
        const currentPlayerIds = new Set(newPlayers.map(p => p.id))

        for (const [playerId, position] of this.playerPositions.entries()) {
          if (!currentPlayerIds.has(playerId)) {
            const allPositions = this.getAllPossiblePositions()
            const positionIndex = allPositions.findIndex(pos =>
              pos.top === position.top &&
              (pos.left === position.left || pos.right === position.right)
            )

            if (positionIndex !== -1) {
              this.usedPositions.delete(positionIndex)
            }
            this.playerPositions.delete(playerId)
          }
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.cyber-badge {
  position: relative;
  overflow: hidden;
}

.cyber-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0.5;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { top: 0; opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* Join Animation */
.player-join-enter-active {
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.player-join-leave-active {
  transition: all 0.5s ease-in;
}

.player-join-enter-from {
  opacity: 0;
  transform: scale(0) translateY(-50px);
  filter: blur(10px);
}

.player-join-enter-to {
  opacity: 1;
  filter: blur(0px);
}

.player-join-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(20px);
  filter: blur(5px);
}

/* Float Animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes glitch-float {
  0%, 90%, 100% {
    transform: translateY(0px) skew(0deg);
  }
  92% {
    transform: translateY(-2px) skew(-1deg);
  }
  94% {
    transform: translateY(1px) skew(1deg);
  }
  96% {
    transform: translateY(-1px) skew(0deg);
  }
}

.animate-float {
  animation:
    float 4s ease-in-out infinite,
    glitch-float 8s ease-in-out infinite;
}

.player-badge {
  will-change: transform, opacity, filter;
}

.player-badge:hover {
  z-index: 10;
}

.player-badge:hover .cyber-badge {
  transform: scale(1.1);
  transition: transform 0.2s ease-out;
}

.transform-gpu {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
