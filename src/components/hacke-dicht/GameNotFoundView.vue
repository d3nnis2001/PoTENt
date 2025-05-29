<template>
  <div class="text-center py-12">
    <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
    </svg>
    <h2 class="text-xl font-semibold text-white mb-2">Quiz nicht gefunden</h2>
    <p class="text-orange-200">Das angeforderte Quiz existiert nicht oder wurde gelöscht.</p>
  </div>
</template>

<script>
export default {
  name: 'GameNotFoundView'
}
</script>