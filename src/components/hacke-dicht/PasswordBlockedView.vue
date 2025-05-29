<template>
  <div class="flex justify-center items-center min-h-[60vh]">
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-md text-center">
      <svg class="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>
      <h2 class="text-xl font-bold text-white mb-2">Quiz ist gesperrt</h2>
      <p class="text-orange-200 mb-6">Dieses Quiz ist passwortgeschützt. Du wirst zur Galerie weitergeleitet.</p>
      <button
        @click="$emit('go-to-gallery')"
        class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all"
      >
        Zur Galerie
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordBlockedView',
  emits: ['go-to-gallery']
}
</script>