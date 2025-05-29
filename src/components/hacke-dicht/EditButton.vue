<template>
  <button
    @click="$emit('edit')"
    class="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30 transition-all duration-200"
  >
    Bearbeiten
  </button>
</template>

<script>
export default {
  name: 'EditButton',
  emits: ['edit']
}
</script>