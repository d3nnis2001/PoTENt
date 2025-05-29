<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label class="block text-white font-medium mb-2">Spielname</label>
      <input
        :value="gameData.name"
        @input="updateGameData('name', $event.target.value)"
        type="text"
        class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="z.B. Klassentreffen Quiz"
        required
      />
    </div>
    <div>
      <label class="block text-white font-medium mb-2">Beschreibung</label>
      <input
        :value="gameData.description"
        @input="updateGameData('description', $event.target.value)"
        type="text"
        class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="Kurze Beschreibung des Spiels"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasicSettings',
  props: {
    gameData: {
      type: Object,
      required: true
    }
  },
  emits: ['update:gameData'],
  methods: {
    updateGameData(field, value) {
      const updatedData = { ...this.gameData }
      updatedData[field] = value
      this.$emit('update:gameData', updatedData)
    }
  }
}
</script>