<template>
  <div class="mb-6 p-4 bg-purple-600/20 rounded-lg border border-purple-400/30">
    <p class="text-white text-sm">
      <strong>{{ selectedDecks.length }} Deck(s) ausgewählt</strong> - 
      {{ totalSelectedCards }} Karten insgesamt
    </p>
    <div class="flex flex-wrap gap-2 mt-2">
      <span 
        v-for="deckId in selectedDecks" 
        :key="deckId"
        class="bg-purple-600/50 text-white px-3 py-1 rounded-full text-xs"
      >
        {{ getDeckName(deckId) }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectedDecksInfo',
  props: {
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
  }
}
</script>