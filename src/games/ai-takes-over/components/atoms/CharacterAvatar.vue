<template>
  <div
    class="character-frame"
    :class="{ selected, taken }"
    @click="$emit('click')"
  >
    <img :src="icon" :alt="alt" class="character-img" />
    <div v-if="taken" class="taken-overlay">
      <slot name="taken-label">
        <span>{{ takenLabel }}</span>
      </slot>
    </div>
  </div>
</template>

<script>
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'

export default {
  name: 'CharacterAvatar',
  props: {
    icon: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Character'
    },
    selected: {
      type: Boolean,
      default: false
    },
    taken: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup() {
    const { t } = useI18n()
    return {
      takenLabel: t('mobile.characterSelect.takenLabel')
    }
  }
}
</script>

<style scoped>
.character-frame {
  position: relative;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-border);
  border-radius: 8px;
  padding: 8px;
  transition: all var(--ai-transition-normal);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.character-frame:not(.taken):hover {
  border-color: var(--ai-cyan);
  box-shadow: var(--ai-shadow-glow);
}

.character-frame.selected {
  border-color: var(--ai-cyan);
  box-shadow: var(--ai-shadow-glow-intense);
  animation: pulse-border 1.5s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% { box-shadow: var(--ai-shadow-glow); }
  50% { box-shadow: var(--ai-shadow-glow-intense); }
}

.character-frame.taken {
  cursor: not-allowed;
  opacity: 0.5;
}

.character-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.taken-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.taken-overlay span {
  color: #ff6b6b;
  font-family: monospace;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 0.1em;
}
</style>
