// src/composables/useToast.js
import { ref, reactive } from 'vue'

const toasts = reactive([])
let toastId = 0

export function useToast() {
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = ++toastId
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'info', 'warning'
      duration,
      visible: true
    }
    
    toasts.push(toast)
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  const removeToast = (id) => {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts[index].visible = false
      // Remove after animation
      setTimeout(() => {
        toasts.splice(index, 1)
      }, 300)
    }
  }
  
  const success = (message, duration) => addToast(message, 'success', duration)
  const error = (message, duration) => addToast(message, 'error', duration)
  const info = (message, duration) => addToast(message, 'info', duration)
  const warning = (message, duration) => addToast(message, 'warning', duration)
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}

// Global toast instance
export const globalToast = useToast()