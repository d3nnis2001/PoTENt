<template>
  <div class="text-center py-12">
    <svg class="w-16 h-16 text-orange-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <h2 class="text-xl font-semibold text-white mb-2">Noch keine Quiz-Spiele</h2>
    <p class="text-orange-200 mb-6">Erstelle dein erstes "Wer wird hacke dicht?" Quiz!</p>
    <button
      @click="$emit('create-game')"
      class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200"
    >
      Quiz erstellen
    </button>
  </div>
</template>

<script>
export default {
  name: 'EmptyGalleryState',
  emits: ['create-game']
}
</script>