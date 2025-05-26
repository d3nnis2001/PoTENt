<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Top 10</h1>
        <p class="text-purple-200">Kartenspiel</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-white mb-2">
            Passwort
          </label>
          <input 
            v-model="password"
            type="password"
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            placeholder="Passwort eingeben..."
            required
          />
        </div>
        
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
        >
          Einloggen
        </button>
        
        <div v-if="error" class="text-red-300 text-sm text-center mt-4">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const password = ref('')
    const error = ref('')
    const CORRECT_PASSWORD = import.meta.env.VITE_LOGIN_PASSWORD

    const handleLogin = () => {
      if (password.value === CORRECT_PASSWORD) {
        localStorage.setItem('authenticated', 'true')
        router.push('/games')
      } else {
        error.value = 'Falsches Passwort!'
        setTimeout(() => error.value = '', 3000)
      }
    }

    return {
      password,
      error,
      handleLogin
    }
  }
}
</script>