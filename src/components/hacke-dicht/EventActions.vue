<template>
  <div class="text-center">
    <button
      @click="$emit('continue')"
      class="bg-yellow-600 hover:bg-yellow-700 text-black py-4 px-8 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
    >
      Weiter zum Spiel
    </button>
  </div>
</template>

<script>
export default {
  name: 'EventActions',
  emits: ['continue']
}
</script>