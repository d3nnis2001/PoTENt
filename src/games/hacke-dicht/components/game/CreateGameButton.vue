<template>
  <button
    @click="$emit('create')"
    class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
    </svg>
    Neues Quiz erstellen
  </button>
</template>

<script>
export default {
  name: 'CreateGameButton',
  emits: ['create']
}
</script>