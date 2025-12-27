<template>
  <div class="duell-wheel-container">
    <!-- Wheel -->
    <div class="wheel-wrapper">
      <!-- Pointer/Arrow -->
      <div class="wheel-pointer">
        <svg viewBox="0 0 40 60" class="pointer-svg">
          <polygon points="20,0 40,60 0,60" fill="url(#pointerGradient)" />
          <defs>
            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#ff00ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#00ffff;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- The Wheel -->
      <div
        class="wheel"
        :style="{ transform: `rotate(${currentRotation}deg)` }"
      >
        <svg viewBox="0 0 400 400" class="wheel-svg">
          <defs>
            <!-- Glow filter -->
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- Background circle -->
          <circle cx="200" cy="200" r="195" fill="#0a0a1a" stroke="#00ffff" stroke-width="3" filter="url(#glow)" />

          <!-- Segments -->
          <g v-for="(segment, index) in segments" :key="segment.id">
            <path
              :d="getSegmentPath(index)"
              :fill="segment.color"
              stroke="#00ffff"
              stroke-width="2"
              class="segment"
              :class="{ 'winning': isSpinning === false && winningIndex === index }"
            />
            <!-- Segment icon/text -->
            <g :transform="getTextTransform(index)">
              <text
                class="segment-icon"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="white"
                font-size="32"
              >
                {{ segment.icon }}
              </text>
              <text
                class="segment-label"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="white"
                font-size="11"
                font-family="monospace"
                :y="28"
              >
                {{ segment.shortName }}
              </text>
            </g>
          </g>

          <!-- Center circle -->
          <circle cx="200" cy="200" r="40" fill="#0d1b2a" stroke="#ff00ff" stroke-width="3" filter="url(#glow)" />
          <text x="200" y="200" text-anchor="middle" dominant-baseline="middle" fill="#00ffff" font-size="14" font-family="monospace" font-weight="bold">
            DUELL
          </text>
        </svg>
      </div>

      <!-- Glowing ring effect when spinning -->
      <div v-if="isSpinning" class="spin-glow"></div>
    </div>

    <!-- Result display -->
    <div v-if="showResult && selectedSegment" class="result-display">
      <div class="result-icon">{{ selectedSegment.icon }}</div>
      <div class="result-name">{{ selectedSegment.name }}</div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'DuellWheel',
  props: {
    segments: {
      type: Array,
      default: () => [
        { id: 'schneller-finger', name: 'SCHNELLER FINGER', shortName: 'SCHNELL', icon: '⚡', color: '#1a1a3a' },
        { id: 'schaetz-duell', name: 'SCHÄTZ-DUELL', shortName: 'SCHÄTZEN', icon: '📊', color: '#2a1a3a' },
        { id: 'higher-lower', name: 'HIGHER LOWER', shortName: 'HI-LO', icon: '⬆️', color: '#1a2a3a' },
        { id: 'bobs-captcha', name: "BOB'S CAPTCHA", shortName: 'CAPTCHA', icon: '🤖', color: '#3a1a2a' },
        { id: 'ki-oder-kind', name: 'KI ODER KIND?', shortName: 'KI/KIND', icon: '👶', color: '#1a3a2a' },
        { id: 'turing-test', name: "BOB'S TURING TEST", shortName: 'TURING', icon: '🧠', color: '#2a2a1a' }
      ]
    },
    spinDuration: {
      type: Number,
      default: 5000
    }
  },
  emits: ['spin-start', 'spin-end'],
  setup(props, { emit, expose }) {
    const currentRotation = ref(0)
    const isSpinning = ref(false)
    const winningIndex = ref(-1)
    const showResult = ref(false)

    const segmentAngle = computed(() => 360 / props.segments.length)

    const selectedSegment = computed(() => {
      if (winningIndex.value >= 0 && winningIndex.value < props.segments.length) {
        return props.segments[winningIndex.value]
      }
      return null
    })

    const getSegmentPath = (index) => {
      const angle = segmentAngle.value
      const startAngle = index * angle - 90
      const endAngle = startAngle + angle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = 200 + 190 * Math.cos(startRad)
      const y1 = 200 + 190 * Math.sin(startRad)
      const x2 = 200 + 190 * Math.cos(endRad)
      const y2 = 200 + 190 * Math.sin(endRad)

      const largeArc = angle > 180 ? 1 : 0

      return `M 200 200 L ${x1} ${y1} A 190 190 0 ${largeArc} 1 ${x2} ${y2} Z`
    }

    const getTextTransform = (index) => {
      const angle = segmentAngle.value
      const midAngle = index * angle + angle / 2 - 90
      const rad = (midAngle * Math.PI) / 180
      const x = 200 + 120 * Math.cos(rad)
      const y = 200 + 120 * Math.sin(rad)
      return `translate(${x}, ${y}) rotate(${midAngle + 90})`
    }

    const spin = (targetIndex = null) => {
      if (isSpinning.value) return

      isSpinning.value = true
      showResult.value = false
      winningIndex.value = -1

      emit('spin-start')

      // Calculate target
      const target = targetIndex !== null ? targetIndex : Math.floor(Math.random() * props.segments.length)

      // Calculate rotation:
      // - Multiple full rotations for effect (5-8 rotations)
      // - Plus the angle to land on the target segment
      // - The pointer is at top (0°), so we need to rotate so target segment aligns with top
      const fullRotations = 5 + Math.floor(Math.random() * 3)
      const targetAngle = target * segmentAngle.value + segmentAngle.value / 2
      // To land on target, we rotate so that segment is at top (where pointer is)
      // Current rotation is 0, we need to rotate by (360 - targetAngle) to bring target to top
      const finalRotation = currentRotation.value + fullRotations * 360 + (360 - targetAngle)

      // Animate using CSS transition
      currentRotation.value = finalRotation

      // After animation completes
      setTimeout(() => {
        isSpinning.value = false
        winningIndex.value = target
        showResult.value = true
        emit('spin-end', props.segments[target])
      }, props.spinDuration)
    }

    const reset = () => {
      currentRotation.value = 0
      isSpinning.value = false
      winningIndex.value = -1
      showResult.value = false
    }

    expose({ spin, reset })

    return {
      currentRotation,
      isSpinning,
      winningIndex,
      showResult,
      selectedSegment,
      segmentAngle,
      getSegmentPath,
      getTextTransform
    }
  }
}
</script>

<style scoped>
.duell-wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.wheel-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
}

.wheel {
  width: 100%;
  height: 100%;
  transition: transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}

.wheel-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.3));
}

.segment {
  transition: opacity 0.3s;
}

.segment.winning {
  animation: segmentPulse 0.5s ease infinite alternate;
}

@keyframes segmentPulse {
  from { opacity: 1; }
  to { opacity: 0.7; }
}

.segment-icon {
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.8));
}

.segment-label {
  text-transform: uppercase;
  letter-spacing: 1px;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
}

.wheel-pointer {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  filter: drop-shadow(0 0 10px rgba(255, 0, 255, 0.5));
}

.pointer-svg {
  width: 30px;
  height: 45px;
}

.spin-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, transparent 50%, rgba(0, 255, 255, 0.2) 70%, transparent 100%);
  animation: spinGlow 0.5s linear infinite;
  pointer-events: none;
}

@keyframes spinGlow {
  0% { transform: rotate(0deg); opacity: 0.5; }
  50% { opacity: 1; }
  100% { transform: rotate(360deg); opacity: 0.5; }
}

.result-display {
  text-align: center;
  animation: resultAppear 0.5s ease;
}

@keyframes resultAppear {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.result-icon {
  font-size: 64px;
  margin-bottom: 8px;
  animation: iconBounce 0.5s ease;
}

@keyframes iconBounce {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.result-name {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}
</style>
