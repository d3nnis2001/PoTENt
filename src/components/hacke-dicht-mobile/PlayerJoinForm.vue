<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
    <h2 class="text-xl font-bold text-white mb-4">Lobby beitreten</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-white font-medium mb-2">Dein Name</label>
        <input
          v-model="playerName"
          type="text"
          maxlength="20"
          class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Dein Spielername"
          required
        />
      </div>

      <CharacterSelector 
        v-model:selected-icon-index="selectedIconIndex"
        :used-characters="usedCharacters"
      />

      <button
        type="submit"
        :disabled="!playerName.trim() || isJoining || isCharacterUsed"
        class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {{ isJoining ? 'Trete bei...' : 'Beitreten' }}
      </button>
    </form>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import CharacterSelector from './CharacterSelector.vue'

export default {
  name: 'PlayerJoinForm',
  components: {
    CharacterSelector
  },
  props: {
    isJoining: {
      type: Boolean,
      default: false
    },
    usedCharacters: {
      type: Array,
      default: () => []
    }
  },
  emits: ['join'],
  setup(props, { emit }) {
    const playerName = ref('')
    const selectedIconIndex = ref(Math.floor(Math.random() * 11)) // Random start
    
    const isCharacterUsed = computed(() => {
      return props.usedCharacters.includes(selectedIconIndex.value)
    })

    const handleSubmit = () => {
      if (!playerName.value.trim() || props.isJoining || isCharacterUsed.value) return
      
      emit('join', {
        name: playerName.value.trim(),
        iconIndex: selectedIconIndex.value
      })
    }
    
    return {
      playerName,
      selectedIconIndex,
      isCharacterUsed,
      handleSubmit
    }
  }
}
</script>