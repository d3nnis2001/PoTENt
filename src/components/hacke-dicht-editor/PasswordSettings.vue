<template>
  <div class="mt-6">
    <div class="flex items-center gap-3 mb-4">
      <input
        :checked="usePassword"
        @change="$emit('update:usePassword', $event.target.checked)"
        type="checkbox"
        id="usePassword"
        class="w-5 h-5 bg-white/20 border-2 border-white/30 rounded text-orange-600 focus:ring-orange-500 focus:ring-2"
      />
      <label for="usePassword" class="text-white font-medium cursor-pointer">
        Quiz mit Passwort schützen
      </label>
      <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>
    </div>
    
    <div v-if="usePassword" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-white font-medium mb-2">Passwort</label>
        <div class="relative">
          <input
            :value="gameData.password"
            @input="updatePassword($event.target.value)"
            :type="showPassword ? 'text' : 'password'"
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400 pr-12"
            placeholder="Passwort für das Quiz"
            :required="usePassword"
          />
          <button
            type="button"
            @click="$emit('update:showPassword', !showPassword)"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-200 hover:text-white"
          >
            <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="flex items-end">
        <div class="bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-3 text-sm">
          <div class="flex items-start gap-2">
            <svg class="w-4 h-4 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-yellow-200 font-medium">Passwortschutz</p>
              <p class="text-yellow-300 text-xs mt-1">
                Andere Spieler benötigen das Passwort, um das Quiz zu spielen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordSettings',
  props: {
    gameData: {
      type: Object,
      required: true
    },
    usePassword: {
      type: Boolean,
      required: true
    },
    showPassword: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:gameData', 'update:usePassword', 'update:showPassword'],
  methods: {
    updatePassword(value) {
      const updatedData = { ...this.gameData }
      updatedData.password = value
      this.$emit('update:gameData', updatedData)
    }
  }
}
</script>   