import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from './useI18n'

/**
 * Composable for cycling through random messages
 * Used for Bob's waiting messages and other rotating text
 */
export function useMessageCycle(messagesPath, interval = 4000) {
  const { randomMessage } = useI18n()
  const currentMessage = ref(randomMessage(messagesPath))
  let messageInterval = null

  const cycleMessage = () => {
    currentMessage.value = randomMessage(messagesPath)
  }

  const start = () => {
    if (messageInterval) return
    messageInterval = setInterval(cycleMessage, interval)
  }

  const stop = () => {
    if (messageInterval) {
      clearInterval(messageInterval)
      messageInterval = null
    }
  }

  onMounted(start)
  onUnmounted(stop)

  return {
    currentMessage,
    cycleMessage,
    start,
    stop
  }
}
