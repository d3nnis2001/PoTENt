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
          class="backdrop-blur-sm rounded-lg px-3 py-2 border shadow-lg transform-gpu"
          :style="getPlayerBackgroundStyle(player.id)"
        >
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 flex items-center justify-center">
              <img 
                v-if="player.icon && (player.icon.startsWith('/') || player.icon.includes('Character'))" 
                :src="player.icon" 
                alt="Character" 
                class="w-full h-full object-contain" 
              />
              <span v-else class="text-sm">{{ player.icon || '🎮' }}</span>
            </div>
            <span 
              class="font-bold text-sm whitespace-nowrap text-shadow"
              :style="getPlayerTextStyle(player.id)"
            >
              {{ player.name }}
            </span>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'PlayerNameDisplay',
  props: {
    players: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      playerPositions: new Map(), // Cache für Player-Positionen
      usedPositions: new Set() // Tracking für belegte Positionen
    }
  },
  methods: {
    getColorPalette(playerId) {
      const palettes = [
        { primary: '#ef4444', secondary: '#fca5a5' }, // red-pink
        { primary: '#3b82f6', secondary: '#93c5fd' }, // blue-cyan
        { primary: '#10b981', secondary: '#6ee7b7' }, // emerald-green
        { primary: '#f59e0b', secondary: '#fcd34d' }, // amber-orange
        { primary: '#8b5cf6', secondary: '#c4b5fd' }, // violet-purple
        { primary: '#ec4899', secondary: '#f9a8d4' }, // pink-rose
        { primary: '#06b6d4', secondary: '#67e8f9' }, // cyan-teal
        { primary: '#84cc16', secondary: '#bef264' }, // lime-green
        { primary: '#f97316', secondary: '#fed7aa' }, // orange
        { primary: '#14b8a6', secondary: '#99f6e4' }, // teal
        { primary: '#a855f7', secondary: '#d8b4fe' }, // purple
        { primary: '#dc2626', secondary: '#fca5a5' }, // red
        { primary: '#059669', secondary: '#a7f3d0' }, // emerald
        { primary: '#7c3aed', secondary: '#c4b5fd' }, // violet
        { primary: '#be185d', secondary: '#f9a8d4' }, // pink
        { primary: '#0891b2', secondary: '#a5f3fc' }  // cyan
      ]
      
      // Hash der playerId für konsistente Farben
      let hash = 0
      for (let i = 0; i < playerId.length; i++) {
        hash = ((hash << 5) - hash + playerId.charCodeAt(i)) & 0xffffffff
      }
      return palettes[Math.abs(hash) % palettes.length]
    },

    getAllPossiblePositions() {
      const positions = []
      
      // Mehr Positionen für bessere Verteilung
      // Links (erweitert)
      for (let i = 0; i < 8; i++) {
        positions.push({
          top: `${5 + (i * 11)}%`,
          left: `${Math.random() * 8 + 1}%`, // 1-9%
          transform: `rotate(${-20 + Math.random() * 15}deg)` // -20 bis -5 grad
        })
      }
      
      // Rechts (erweitert) 
      for (let i = 0; i < 8; i++) {
        positions.push({
          top: `${5 + (i * 11)}%`,
          right: `${Math.random() * 8 + 1}%`, // 1-9%
          transform: `rotate(${5 + Math.random() * 15}deg)` // 5 bis 20 grad
        })
      }
      
      return positions
    },

    getPlayerPosition(playerId) {
      // Wenn Position bereits zugewiesen, diese verwenden
      if (this.playerPositions.has(playerId)) {
        return this.playerPositions.get(playerId)
      }
      
      // Neue zufällige Position finden
      const allPositions = this.getAllPossiblePositions()
      const availablePositions = allPositions.filter((_, index) => !this.usedPositions.has(index))
      
      if (availablePositions.length === 0) {
        // Falls alle Positionen belegt, überlappend platzieren
        const randomIndex = Math.floor(Math.random() * allPositions.length)
        const position = allPositions[randomIndex]
        this.playerPositions.set(playerId, position)
        return position
      }
      
      // Zufällige verfügbare Position wählen
      const randomIndex = Math.floor(Math.random() * availablePositions.length)
      const chosenPosition = availablePositions[randomIndex]
      const originalIndex = allPositions.indexOf(chosenPosition)
      
      this.usedPositions.add(originalIndex)
      this.playerPositions.set(playerId, chosenPosition)
      
      return chosenPosition
    },

    getPlayerBackgroundStyle(playerId) {
      const palette = this.getColorPalette(playerId)
      return {
        background: `linear-gradient(135deg, ${palette.primary}40, ${palette.secondary}30)`,
        borderColor: palette.primary + '80',
        boxShadow: `0 4px 15px ${palette.primary}30, 0 0 20px ${palette.primary}20`
      }
    },

    getPlayerTextStyle(playerId) {
      const palette = this.getColorPalette(playerId)
      return {
        background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textShadow: `0 0 10px ${palette.primary}50`,
        filter: `drop-shadow(0 2px 4px ${palette.primary}40)`
      }
    },
    
    getPlayerClasses(playerId) {
      return [
        'animate-bounce-subtle'
      ]
    }
  },
  
  watch: {
    players: {
      handler(newPlayers, oldPlayers) {
        // Cleanup für Spieler die die Lobby verlassen haben
        const currentPlayerIds = new Set(newPlayers.map(p => p.id))
        
        for (const [playerId, position] of this.playerPositions.entries()) {
          if (!currentPlayerIds.has(playerId)) {
            // Spieler hat Lobby verlassen, Position freigeben
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
/* Join Animation */
.player-join-enter-active {
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.player-join-leave-active {
  transition: all 0.5s ease-in;
}

.player-join-enter-from {
  opacity: 0;
  transform: scale(0) rotate(180deg) translateY(-50px);
  filter: blur(10px);
}

.player-join-enter-to {
  opacity: 1;
  transform: scale(1) var(--player-rotation) translateY(0);
  filter: blur(0px);
}

.player-join-leave-from {
  opacity: 1;
  transform: scale(1) var(--player-rotation);
}

.player-join-leave-to {
  opacity: 0;
  transform: scale(0.3) var(--player-rotation) translateY(20px);
  filter: blur(5px);
}

/* Floating Animation */
@keyframes bounce-subtle {
  0%, 100% { 
    transform: translateY(0px) var(--player-rotation);
  }
  50% { 
    transform: translateY(-3px) var(--player-rotation);
  }
}

@keyframes glow-pulse {
  0%, 100% { 
    filter: brightness(1) saturate(1) drop-shadow(0 0 5px currentColor);
    transform: scale(1) var(--player-rotation);
  }
  50% { 
    filter: brightness(1.15) saturate(1.2) drop-shadow(0 0 15px currentColor);
    transform: scale(1.02) var(--player-rotation);
  }
}

@keyframes wiggle {
  0%, 100% { transform: var(--player-rotation); }
  25% { transform: var(--player-rotation) rotate(1deg); }
  75% { transform: var(--player-rotation) rotate(-1deg); }
}

.animate-bounce-subtle {
  animation: 
    bounce-subtle 4s ease-in-out infinite,
    glow-pulse 6s ease-in-out infinite,
    wiggle 8s ease-in-out infinite;
}

.player-badge {
  --player-rotation: var(--tw-transform, rotate(0deg));
  will-change: transform, opacity, filter;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Transform optimization */
.transform-gpu {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Hover effects */
.player-badge:hover {
  transform: scale(1.1) var(--player-rotation) !important;
  z-index: 10;
  transition: transform 0.2s ease-out;
}

.player-badge:hover .backdrop-blur-sm {
  backdrop-filter: blur(8px);
  transform: scale(1.05);
}
</style>