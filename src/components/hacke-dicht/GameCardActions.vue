<!-- Update für src/components/hacke-dicht/GameCardActions.vue -->
<template>
  <div class="grid grid-cols-3 gap-2">
    <!-- Solo Play Button -->
    <button
      @click="$emit('play')"
      :disabled="!isPlayable"
      class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-3 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
    >
      <svg v-if="game.isProtected" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>
      <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
      Solo
    </button>
    
    <!-- Multiplayer Button -->
    <button
      @click="$emit('play-multiplayer')"
      :disabled="!isPlayable"
      class="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
      </svg>
      Multi
    </button>
    
    <!-- Edit Button -->
    <button
      @click="$emit('edit')"
      class="bg-white/20 text-white py-2 px-3 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-1 text-sm"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
      Edit
    </button>
  </div>
</template>

<script>
export default {
  name: 'GameCardActions',
  props: {
    game: {
      type: Object,
      required: true
    },
    isPlayable: {
      type: Boolean,
      required: true
    }
  },
  emits: ['play', 'edit', 'play-multiplayer']
}
</script>