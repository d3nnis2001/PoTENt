<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <GameCard
      v-for="game in games"
      :key="game.id"
      :game="game"
      @edit="$emit('edit-game', game)"
      @play="$emit('play-game', game)"
      @delete="$emit('delete-game', game.id)"
    />
  </div>
</template>

<script>
import GameCard from './GameCard.vue'

export default {
  name: 'GamesGrid',
  components: {
    GameCard
  },
  props: {
    games: {
      type: Array,
      required: true
    }
  },
  emits: ['edit-game', 'play-game', 'delete-game']
}
</script>