<template>
  <div class="flex justify-center items-center min-h-[70vh]">
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-2xl text-center">
      <div class="mb-6">
        <svg class="w-20 h-20 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 class="text-4xl font-bold text-white mb-4">Quiz beendet!</h2>
        <p class="text-orange-200 text-xl">Du hast alle 15 Fragen geschafft! 🎉</p>
        <p class="text-orange-200 text-lg mt-2">Zeit für den finalen Drink! 🍻</p>
      </div>

      <div class="flex gap-4 justify-center">
        <button
          @click="$emit('restart')"
          class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all"
        >
          Nochmal spielen
        </button>
        <button
          @click="$emit('back-to-gallery')"
          class="bg-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/30 transition-all"
        >
          Zurück zur Galerie
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultsView',
  emits: ['restart', 'back-to-gallery']
}
</script>