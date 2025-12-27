<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
    <h3 class="text-xl font-bold text-white mb-4">Spieler Status</h3>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="player in players"
        :key="player.id"
        :class="[
          'bg-white/5 rounded-lg p-4 border transition-all',
          player.isOnline ? 'border-green-400/30' : 'border-gray-400/30',
          hasPlayerVoted(player.id) ? 'bg-green-600/20' : 'bg-white/5'
        ]"
      >
        <div class="flex items-center gap-3">
          <div class="text-2xl">{{ player.icon }}</div>
          <div class="flex-1 min-w-0">
            <div class="text-white font-medium truncate">{{ player.name }}</div>
            <div class="text-xs text-orange-200">
              {{ hasPlayerVoted(player.id) ? '✓ Abgestimmt' : 'Wartet...' }}
            </div>
            <div v-if="showPlayerAnswers && hasPlayerVoted(player.id)" class="text-xs text-green-300 mt-1">
              Antwort: {{ getPlayerAnswer(player.id) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-if="players.length === 0" class="text-center py-6">
      <p class="text-white/50 text-sm">Keine Spieler in der Lobby</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerStatusGrid',
  props: {
    players: {
      type: Array,
      required: true
    },
    hasPlayerVoted: {
      type: Function,
      required: true
    },
    showPlayerAnswers: {
      type: Boolean,
      required: true
    },
    getPlayerAnswer: {
      type: Function,
      required: true
    }
  }
}
</script>