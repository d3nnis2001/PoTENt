<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <Transition
      v-for="toast in toasts"
      :key="toast.id"
      name="toast"
      appear
    >
      <!-- AI Theme Toast -->
      <div
        v-if="toast.visible && isAiRoute"
        :class="[
          'ai-toast max-w-sm rounded border p-3',
          aiToastClasses[toast.type]
        ]"
      >
        <div class="flex items-center gap-3">
          <span class="ai-toast-icon font-mono text-sm">{{ aiIcons[toast.type] }}</span>
          <p class="font-mono text-sm flex-1">{{ toast.message }}</p>
        </div>
      </div>

      <!-- Default Toast -->
      <div
        v-else-if="toast.visible"
        :class="[
          'max-w-sm bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4 shadow-lg',
          toastClasses[toast.type]
        ]"
      >
        <div class="flex items-center gap-3">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <svg v-if="toast.type === 'success'" class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <svg v-else-if="toast.type === 'warning'" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <svg v-else class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <!-- Message -->
          <p class="text-white text-sm flex-1">{{ toast.message }}</p>

          <!-- Close Button -->
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { globalToast } from '@/shared/composables/useToast'

export default {
  name: 'ToastContainer',
  setup() {
    const route = useRoute()
    const { toasts, removeToast } = globalToast

    const isAiRoute = computed(() => {
      // Check for AI Takes Over routes
      const currentPath = route.path || ''
      const currentHash = typeof window !== 'undefined' ? (window.location.hash || '') : ''
      return currentPath.includes('ai-takes-over') || currentHash.includes('ai-takes-over')
    })

    const toastClasses = {
      success: 'border-green-400/50',
      error: 'border-red-400/50',
      warning: 'border-yellow-400/50',
      info: 'border-blue-400/50'
    }

    const aiToastClasses = {
      success: 'ai-toast-success',
      error: 'ai-toast-error',
      warning: 'ai-toast-warning',
      info: 'ai-toast-info'
    }

    const aiIcons = {
      success: '[✓]',
      error: '[✗]',
      warning: '[!]',
      info: '[i]'
    }

    return {
      toasts,
      removeToast,
      toastClasses,
      isAiRoute,
      aiToastClasses,
      aiIcons
    }
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* AI Theme Toasts */
.ai-toast {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.ai-toast-success {
  border-color: var(--ai-cyan);
  color: var(--ai-cyan);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.ai-toast-error {
  border-color: #ff4444;
  color: #ff4444;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}

.ai-toast-warning {
  border-color: #ffaa00;
  color: #ffaa00;
  text-shadow: 0 0 10px rgba(255, 170, 0, 0.5);
}

.ai-toast-info {
  border-color: var(--ai-pink);
  color: var(--ai-pink);
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
}

.ai-toast-icon {
  opacity: 0.8;
}
</style>