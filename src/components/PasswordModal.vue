<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click="$emit('close')">
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 w-full max-w-md border border-white/20" @click.stop>
      <div class="text-center mb-6">
        <svg class="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <h2 class="text-xl font-bold text-white mb-2">{{ title }}</h2>
        <p class="text-purple-200 text-sm">{{ subtitle }}</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-white font-medium mb-2">Passwort</label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            :placeholder="placeholder"
            required
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 text-purple-200 hover:text-white"
            style="margin-top: 1.5rem; position: relative; float: right; margin-right: 0.75rem; margin-top: -2.25rem;"
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
        
        <div v-if="error" class="text-red-300 text-sm text-center">
          {{ error }}
        </div>
        
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="!password.trim() || isLoading"
            class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Überprüfe...' : submitText }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            :disabled="isLoading"
            class="bg-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/30 disabled:opacity-50"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'PasswordModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Passwort erforderlich'
    },
    subtitle: {
      type: String,
      default: 'Dieses Spiel ist passwortgeschützt'
    },
    placeholder: {
      type: String,
      default: 'Passwort eingeben...'
    },
    submitText: {
      type: String,
      default: 'Entsperren'
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const password = ref('')
    const showPassword = ref(false)

    const handleSubmit = () => {
      if (!password.value.trim()) return
      emit('submit', password.value)
    }

    watch(() => props.show, (newVal) => {
      if (!newVal) {
        password.value = ''
        showPassword.value = false
      }
    })

    return {
      password,
      showPassword,
      handleSubmit
    }
  }
}
</script>