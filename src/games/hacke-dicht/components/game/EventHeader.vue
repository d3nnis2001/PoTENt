<template>
  <div class="flex items-center justify-center gap-4 mb-6">
    <svg class="w-16 h-16 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
    <h2 class="text-4xl font-bold text-white animate-bounce">EREIGNIS!</h2>
    <svg class="w-16 h-16 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'EventHeader'
}
</script>