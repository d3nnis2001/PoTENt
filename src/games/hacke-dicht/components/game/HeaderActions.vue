<template>
  <div class="flex gap-4">
    <!-- Migration Button -->
    <MigrationButton 
      v-if="hasLocalData"
      @migrate="$emit('migrate-data')"
    />
    
    <!-- Play Selected Button -->
    <PlaySelectedButton
      v-if="selectedDecks.length > 0"
      :selected-count="selectedDecks.length"
      @play="$emit('play-selected')"
    />
    
    <!-- Create New Game Button -->
    <CreateGameButton @create="$emit('create-game')" />
  </div>
</template>

<script>
import MigrationButton from './MigrationButton.vue'
import PlaySelectedButton from './PlaySelectedButton.vue'
import CreateGameButton from './CreateGameButton.vue'

export default {
  name: 'HeaderActions',
  components: {
    MigrationButton,
    PlaySelectedButton,
    CreateGameButton
  },
  props: {
    hasLocalData: {
      type: Boolean,
      required: true
    },
    selectedDecks: {
      type: Array,
      required: true
    },
    totalSelectedCards: {
      type: Number,
      required: true
    },
    getDeckName: {
      type: Function,
      required: true
    }
  },
  emits: ['migrate-data', 'play-selected', 'create-game']
}
</script>