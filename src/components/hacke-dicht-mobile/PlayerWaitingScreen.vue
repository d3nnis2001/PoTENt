<template>
  <div class="text-center">
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
      <div class="w-20 h-20 rounded-full bg-green-600/30 flex items-center justify-center mx-auto mb-3">
        <img v-if="player?.icon && (player.icon.startsWith('/') || player.icon.includes('Character'))" 
             :src="player.icon" 
             alt="Character" 
             class="w-16 h-16 object-contain" />
        <span v-else class="text-4xl">{{ player?.icon || '🎮' }}</span>
      </div>
      <h2 class="text-xl font-bold text-white mb-1">{{ player?.name }}</h2>
      <div class="text-green-300 text-sm">Bereit zum Spielen!</div>
    </div>

    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <h3 class="text-lg font-bold text-white mb-3">Warte auf Spielstart...</h3>
      <div class="text-center">
        <div class="text-2xl text-orange-300 mb-1">{{ playerCount }}</div>
        <div class="text-xs text-orange-200">Spieler in der Lobby</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerWaitingScreen',
  props: {
    player: {
      type: Object,
      required: true
    },
    playerCount: {
      type: Number,
      required: true
    }
  }
}
</script>