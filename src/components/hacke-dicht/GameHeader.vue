<template>
  <div class="text-center mb-6">
    <button
      @click="$emit('back')"
      class="text-purple-200 hover:text-white mb-4 inline-flex items-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
      Zurück zur Galerie
    </button>
    <h1 class="text-3xl font-bold text-white mb-2">{{ gameName }}</h1>
  </div>
</template>

<script>
export default {
  name: 'GameHeader',
  props: {
    gameName: {
      type: String,
      required: true
    }
  },
  emits: ['back']
}
</script>