<template>
  <div class="text-center">
    <button
      @click="handleContinue"
      class="bg-yellow-600 hover:bg-yellow-700 text-black py-4 px-8 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
    >
      Weiter zum Spiel
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['continue'])

const handleContinue = () => {
  emit('continue')
}
</script>