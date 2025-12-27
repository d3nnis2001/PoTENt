<template>
  <div class="typewriter">
    <span>{{ displayedText }}</span>
    <BlinkingCursor v-if="isTyping" />
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import BlinkingCursor from '@/games/ai-takes-over/components/atoms/BlinkingCursor.vue'

export default {
  name: 'TypewriterText',
  components: { BlinkingCursor },
  props: {
    text: {
      type: String,
      required: true
    },
    speed: {
      type: Number,
      default: 50
    },
    autoStart: {
      type: Boolean,
      default: true
    }
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const displayedText = ref('')
    const isTyping = ref(false)
    let timeouts = []

    const clearTimeouts = () => {
      timeouts.forEach(t => clearTimeout(t))
      timeouts = []
    }

    const typeText = async () => {
      clearTimeouts()
      isTyping.value = true
      displayedText.value = ''

      for (let i = 0; i <= props.text.length; i++) {
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            displayedText.value = props.text.slice(0, i)
            resolve()
          }, props.speed)
          timeouts.push(timeout)
        })
      }

      isTyping.value = false
      emit('complete')
    }

    if (props.autoStart) {
      onMounted(typeText)
    }

    watch(() => props.text, (newText) => {
      if (newText && props.autoStart) {
        typeText()
      }
    })

    return {
      displayedText,
      isTyping,
      typeText
    }
  }
}
</script>

<style scoped>
.typewriter {
  font-family: monospace;
}
</style>
