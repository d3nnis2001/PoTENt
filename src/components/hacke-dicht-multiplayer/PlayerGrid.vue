<template>
  <div class="flex-1 max-w-xs">
    <div class="text-center mb-4">
      <h4 v-if="showTitle" class="text-white font-bold text-sm mb-3">
        {{ showTitle === 'left' ? `Spieler: ${playerCount}` : '' }}
      </h4>
      <h4 v-else class="text-white font-bold text-sm mb-3">&nbsp;</h4>
    </div>
    
    <div class="grid grid-cols-2 gap-2">
      <div 
        v-for="player in players" 
        :key="player.id"
        class="flex flex-col items-center p-2 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
      >
        <div class="w-8 h-8 mb-1 flex items-center justify-center">
          <img v-if="player.icon && (player.icon.startsWith('/') || player.icon.includes('Character'))" 
               :src="player.icon" 
               alt="Character" 
               class="w-full h-full object-contain" />
          <span v-else class="text-xl">{{ player.icon || '🎮' }}</span>
        </div>
        <div class="text-xs text-white text-center truncate w-full" :title="player.name">
          {{ player.name }}
        </div>
      </div>
    </div>
    
    <div v-if="players.length === 0 && showTitle === 'left'" class="text-center py-4">
      <div class="text-2xl mb-1">👥</div>
      <p class="text-orange-200 text-xs">Warte auf Spieler...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerGrid',
  props: {
    players: {
      type: Array,
      required: true
    },
    playerCount: {
      type: Number,
      required: true
    },
    showTitle: {
      type: [String, Boolean],
      default: false // 'left', 'right', or false
    }
  }
}
</script>