<template>
  <div class="ai-code-input">
    <MatrixRainBackground />

    <div class="content">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-mono font-bold ai-glitch mb-2">
          <span class="ai-text-glow">&gt; {{ t('mobile.codeInput.title') }}</span>
          <BlinkingCursor />
        </h1>
        <p class="text-sm ai-text-muted">{{ t('mobile.codeInput.subtitle') }}</p>
      </div>

      <!-- Terminal Input -->
      <TerminalBox
        title="TERMINAL"
        :show-dots="true"
        class="w-full max-w-sm mb-6"
      >
        <CyberInput
          ref="codeInput"
          v-model="lobbyCode"
          :prompt="t('mobile.codeInput.terminalPrompt')"
          :placeholder="t('mobile.codeInput.placeholder')"
          maxlength="6"
          :disabled="isConnecting"
          @keyup.enter="handleConnect"
          autocomplete="off"
          autocapitalize="characters"
          class="uppercase tracking-widest text-lg"
        />
      </TerminalBox>

      <!-- Connect Button -->
      <CyberButton
        :loading="isConnecting"
        :disabled="!isValidCode"
        @click="handleConnect"
        class="px-12 py-4 rounded text-lg tracking-widest"
      >
        {{ t('mobile.codeInput.button') }}
      </CyberButton>

      <!-- Error Message -->
      <div v-if="error" class="ai-error-box mt-6">
        <span class="ai-error-icon">!</span>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import MatrixRainBackground from '@/games/ai-takes-over/components/organisms/MatrixRainBackground.vue'
import TerminalBox from '@/games/ai-takes-over/components/molecules/TerminalBox.vue'
import CyberButton from '@/games/ai-takes-over/components/atoms/CyberButton.vue'
import CyberInput from '@/games/ai-takes-over/components/atoms/CyberInput.vue'
import BlinkingCursor from '@/games/ai-takes-over/components/atoms/BlinkingCursor.vue'

export default {
  name: 'AiCodeInput',
  components: {
    MatrixRainBackground,
    TerminalBox,
    CyberButton,
    CyberInput,
    BlinkingCursor
  },
  emits: ['connect'],
  setup(_, { emit }) {
    const { t } = useI18n()

    const codeInput = ref(null)
    const lobbyCode = ref('')
    const isConnecting = ref(false)
    const error = ref('')

    const isValidCode = computed(() => lobbyCode.value.length === 6)

    const handleConnect = () => {
      if (!isValidCode.value || isConnecting.value) return

      error.value = ''
      isConnecting.value = true

      emit('connect', lobbyCode.value.toUpperCase())
    }

    const setError = (msg) => {
      error.value = msg
      isConnecting.value = false
    }

    const setConnecting = (val) => {
      isConnecting.value = val
    }

    onMounted(() => {
      if (codeInput.value?.$el) {
        const input = codeInput.value.$el.querySelector('input')
        if (input) input.focus()
      }
    })

    return {
      t,
      codeInput,
      lobbyCode,
      isConnecting,
      error,
      isValidCode,
      handleConnect,
      setError,
      setConnecting
    }
  }
}
</script>

<style scoped>
.ai-code-input {
  background: var(--ai-bg-dark);
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

.content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.uppercase {
  text-transform: uppercase;
}
</style>
