<template>
  <div class="event-display">
    <!-- VHS Label/Header -->
    <div class="vhs-header">
      <div class="event-label">
        <span class="event-text">EREIGNIS</span>
        <div class="label-underline"></div>
      </div>
    </div>

    <!-- Event Content -->
    <div class="event-message">
      <div class="message-border">
        <p class="message-text">{{ parsedText }}</p>
      </div>
    </div>

    <!-- Continue Button -->
    <div class="continue-section">
      <button @click="handleContinue" class="continue-button">
        <span class="button-icon">▶</span>
        <span class="button-text">WEITER ZUM SPIEL</span>
        <div class="button-glow"></div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted } from 'vue'
import { useEditorTags } from '@/shared/composables/useEditorTags'

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['continue'])

const { parseTags } = useEditorTags()
const playerList = inject('playerList', [])

const parsedText = computed(() => {
  return parseTags(props.text, playerList.value || playerList)
})

const handleContinue = () => {
  emit('continue')
}

// Arrow key support
const handleKeyPress = (event) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'Enter') {
    handleContinue()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.event-display {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

/* VHS Header */
.vhs-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.event-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.event-text {
  font-family: 'Courier New', monospace;
  font-size: 2.2rem;
  font-weight: bold;
  color: #ff3333;
  text-shadow:
    0 0 10px rgba(255, 51, 51, 0.8),
    0 0 20px rgba(255, 51, 51, 0.6),
    0 0 30px rgba(255, 51, 51, 0.4),
    2px 2px 0 rgba(255, 51, 51, 0.3);
  letter-spacing: 0.3em;
  animation: text-flicker 2s infinite;
}

@keyframes text-flicker {
  0%, 100% {
    opacity: 1;
    text-shadow:
      0 0 10px rgba(255, 51, 51, 0.8),
      0 0 20px rgba(255, 51, 51, 0.6),
      0 0 30px rgba(255, 51, 51, 0.4);
  }
  50% {
    opacity: 0.95;
    text-shadow:
      0 0 8px rgba(255, 51, 51, 0.7),
      0 0 16px rgba(255, 51, 51, 0.5),
      0 0 24px rgba(255, 51, 51, 0.3);
  }
}

.label-underline {
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg,
    transparent 0%,
    #ff3333 20%,
    #ff3333 80%,
    transparent 100%
  );
  box-shadow: 0 0 10px rgba(255, 51, 51, 0.6);
}

/* Event Message */
.event-message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 20px;
  max-height: 50%;
}

.message-border {
  position: relative;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #ff3333;
  border-radius: 8px;
  padding: 25px 35px;
  box-shadow:
    0 0 20px rgba(255, 51, 51, 0.3),
    inset 0 0 20px rgba(0, 0, 0, 0.5);
  max-width: 100%;
}

.message-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg,
    transparent 0%,
    rgba(255, 51, 51, 0.2) 50%,
    transparent 100%
  );
  border-radius: 8px;
  z-index: -1;
  animation: border-glow 2s infinite;
}

@keyframes border-glow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}

.message-text {
  font-family: 'Courier New', monospace;
  font-size: 1.3rem;
  font-weight: 500;
  color: #f0f0f0;
  text-align: center;
  line-height: 1.5;
  text-shadow:
    0 0 10px rgba(240, 240, 240, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.05em;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Continue Section */
.continue-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

.continue-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 35px;
  background: linear-gradient(145deg, #ff3333, #cc0000);
  border: none;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 51, 51, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  overflow: hidden;
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(255, 51, 51, 0.6),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.continue-button:active {
  transform: translateY(0);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 0 15px rgba(255, 51, 51, 0.4);
}

.button-icon {
  font-size: 1.1rem;
  animation: icon-pulse 1.5s infinite;
}

@keyframes icon-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.button-text {
  position: relative;
  z-index: 1;
}

.button-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: button-shine 3s infinite;
}

@keyframes button-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}
</style>
