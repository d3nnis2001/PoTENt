<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
    <div class="flex items-center mb-4">
      <input
        :id="`deck-${deck.id}`"
        type="checkbox"
        :checked="isSelected"
        @change="$emit('toggle-select', deck.id)"
        class="w-5 h-5 bg-white/20 border-2 border-white/30 rounded text-purple-600 focus:ring-purple-500 focus:ring-2"
      />
      <label :for="`deck-${deck.id}`" class="ml-3 text-lg font-semibold text-white group-hover:text-purple-200 transition-colors cursor-pointer">
        {{ deck.name }}
      </label>
    </div>
    
    <div class="flex justify-between items-start mb-4">
      <p class="text-purple-200 text-sm">
        {{ deck.cards.length }} Karten
      </p>
      <button
        @click.stop="$emit('delete', deck.id)"
        class="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
    
    <div class="flex gap-2">
      <button
        @click="$emit('edit', deck.id)"
        class="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30 transition-all duration-200"
      >
        Bearbeiten
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeckCard',
  props: {
    deck: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit', 'delete', 'toggle-select']
}
</script>