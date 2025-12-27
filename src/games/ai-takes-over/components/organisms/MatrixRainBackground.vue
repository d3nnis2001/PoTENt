<template>
  <div class="matrix-rain" :style="{ opacity }">
    <div
      v-for="i in columnCount"
      :key="i"
      class="matrix-column"
      :style="{
        left: `${(i - 1) * columnWidth}%`,
        animationDelay: `${Math.random() * 2}s`
      }"
    >
      <span
        v-for="j in charCount"
        :key="j"
        class="matrix-char"
      >
        {{ getRandomChar() }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MatrixRainBackground',
  props: {
    columnCount: {
      type: Number,
      default: 20
    },
    charCount: {
      type: Number,
      default: 15
    },
    opacity: {
      type: Number,
      default: 0.15
    }
  },
  setup() {
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>[]{}|/\\'

    const getRandomChar = () => {
      return matrixChars[Math.floor(Math.random() * matrixChars.length)]
    }

    return {
      getRandomChar,
      columnWidth: 100 / 20
    }
  }
}
</script>

<style scoped>
.matrix-rain {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.matrix-column {
  position: absolute;
  top: -100%;
  display: flex;
  flex-direction: column;
  animation: matrix-fall 8s linear infinite;
}

.matrix-char {
  color: var(--ai-cyan);
  font-family: monospace;
  font-size: 14px;
  line-height: 1.2;
  text-shadow: 0 0 5px var(--ai-cyan);
}

@keyframes matrix-fall {
  0% { transform: translateY(0); }
  100% { transform: translateY(200%); }
}
</style>
