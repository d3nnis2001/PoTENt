<template>
  <div class="text-left mb-4">
    <button
      @click="$emit('back')"
      class="text-purple-200 hover:text-white inline-flex items-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
      Zurück zur Galerie
    </button>
  </div>
</template>

<script>
export default {
  name: 'GameHeader',
  emits: ['back']
}
</script>