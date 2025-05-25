<template>
  <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 shadow-2xl border border-white/20 min-h-[600px] flex flex-col">
    <!-- Story/Frage - Obere Hälfte -->
    <div class="flex-1 bg-white/10 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-center">
      <h2 class="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        Story/Frage
      </h2>
      <p class="text-white text-lg leading-relaxed text-center">{{ card.story }}</p>
    </div>

    <!-- Space zwischen den Hälften -->
    <div class="py-3"></div>

    <!-- Pantomime - Untere Hälfte -->
    <div class="flex-1 bg-white/10 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-center">
      <h2 class="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3"></path>
        </svg>
        Pantomime
      </h2>
      <p class="text-white text-lg leading-relaxed text-center">{{ card.pantomime }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameCard',
  props: {
    card: {
      type: Object,
      required: true
    }
  }
}
</script>