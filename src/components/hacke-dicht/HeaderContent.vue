<template>
  <div>
    <button
      @click="$emit('back')"
      class="text-purple-200 hover:text-white mb-2 flex items-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
      Zurück zur Spielauswahl
    </button>
    <h1 class="text-3xl font-bold text-white">Wer wird hacke dicht?</h1>
    <p class="text-orange-200 text-sm">Deine Trinkquiz-Spiele</p>
  </div>
</template>

<script>
export default {
  name: 'HeaderContent',
  emits: ['back']
}
</script>