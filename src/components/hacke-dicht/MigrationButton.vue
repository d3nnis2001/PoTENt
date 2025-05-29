<template>
  <button
    @click="$emit('migrate')"
    class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 flex items-center gap-2"
  >
    <span>📤</span>
    Lokale Daten übertragen
  </button>
</template>

<script>
export default {
  name: 'MigrationButton',
  emits: ['migrate']
}
</script>