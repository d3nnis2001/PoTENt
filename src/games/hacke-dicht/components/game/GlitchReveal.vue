<template>
  <div class="glitch-reveal-wrapper" ref="wrapper">
    <!-- Content (hidden until revealed) -->
    <div
      class="glitch-content"
      :class="{ 'screen-shake': isShaking, 'revealed': isRevealed }"
    >
      <slot />
    </div>

    <!-- TV Static/Glitch Overlay -->
    <Transition name="static-break">
      <div v-if="showStatic" class="static-overlay" :class="{ 'breaking': isBreaking }">
        <!-- TV Static Canvas -->
        <canvas ref="staticCanvas" class="static-canvas" />

        <!-- CRT Scanlines -->
        <div class="scanlines"></div>

        <!-- Horizontal Glitch Bars -->
        <div
          v-for="bar in glitchBars"
          :key="bar.id"
          class="glitch-bar"
          :style="getBarStyle(bar)"
        />

        <!-- Chromatic Aberration (RGB Split) -->
        <div class="chromatic-aberration"></div>

        <!-- VHS Tracking Lines -->
        <div class="vhs-tracking"></div>

        <!-- Break Flash Effect -->
        <Transition name="break-flash">
          <div v-if="isBreaking" class="break-effect">
            <div class="flash-core"></div>
            <div class="flash-ring"></div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ========================================
// EMITS & REFS
// ========================================

const emit = defineEmits(['revealed'])

const wrapper = ref(null)
const staticCanvas = ref(null)

// ========================================
// STATE
// ========================================

const isShaking = ref(false)
const showStatic = ref(false)
const isBreaking = ref(false)
const isRevealed = ref(false)
const glitchBars = ref([])

// ========================================
// CONFIGURATION
// ========================================

const TIMING = {
  SHAKE_START: 50,         // Delay before shake starts (ms)
  SHAKE_DURATION: 600,     // Duration of screen shake (ms)
  STATIC_DURATION: 900,    // Duration of TV static (ms)
  BREAK_DURATION: 500,     // Duration of break effect (ms)
  GLITCH_REGEN: 70         // Glitch bar regeneration interval (ms)
}

const GLITCH_CONFIG = {
  MIN_BARS: 15,
  MAX_BARS: 25,
  MIN_HEIGHT: 3,
  MAX_HEIGHT: 18,
  MAX_OFFSET: 180
}

// ========================================
// ANIMATION CONTROL
// ========================================

let animationFrameId = null
let glitchInterval = null

// ========================================
// MAIN SEQUENCE
// ========================================

const startSequence = () => {
  // Phase 1: Screen Shake
  setTimeout(() => {
    isShaking.value = true
  }, TIMING.SHAKE_START)

  // Phase 2: TV Static + Glitch Chaos
  setTimeout(() => {
    showStatic.value = true
    initStaticCanvas()
    generateGlitchBars()
    startGlitchLoop()
  }, TIMING.SHAKE_DURATION)

  // Phase 3: Breaking Effect
  setTimeout(() => {
    isBreaking.value = true
  }, TIMING.SHAKE_DURATION + TIMING.STATIC_DURATION)

  // Phase 4: Reveal Content
  setTimeout(() => {
    isRevealed.value = true
    showStatic.value = false
    isShaking.value = false
    cleanup()
    emit('revealed')
  }, TIMING.SHAKE_DURATION + TIMING.STATIC_DURATION + TIMING.BREAK_DURATION)
}

// ========================================
// TV STATIC CANVAS
// ========================================

const initStaticCanvas = () => {
  if (!staticCanvas.value || !wrapper.value) return

  const rect = wrapper.value.getBoundingClientRect()
  staticCanvas.value.width = rect.width
  staticCanvas.value.height = rect.height

  renderStatic()
}

const renderStatic = () => {
  if (!staticCanvas.value) return

  const canvas = staticCanvas.value
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const data = imageData.data

  // Generate random TV static noise
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.random() * 255
    data[i] = gray      // R
    data[i + 1] = gray  // G
    data[i + 2] = gray  // B
    data[i + 3] = 255   // A
  }

  ctx.putImageData(imageData, 0, 0)

  // Continue animation loop
  if (showStatic.value) {
    animationFrameId = requestAnimationFrame(renderStatic)
  }
}

// ========================================
// GLITCH BARS
// ========================================

const generateGlitchBars = () => {
  const numBars = GLITCH_CONFIG.MIN_BARS +
    Math.floor(Math.random() * (GLITCH_CONFIG.MAX_BARS - GLITCH_CONFIG.MIN_BARS))

  const bars = []
  for (let i = 0; i < numBars; i++) {
    bars.push({
      id: `bar-${i}-${Date.now()}`,
      top: Math.random() * 100,
      height: GLITCH_CONFIG.MIN_HEIGHT + Math.random() *
        (GLITCH_CONFIG.MAX_HEIGHT - GLITCH_CONFIG.MIN_HEIGHT),
      offsetX: (Math.random() - 0.5) * GLITCH_CONFIG.MAX_OFFSET,
      duration: 0.08 + Math.random() * 0.15,
      color: Math.random() > 0.5 ? 'red' : 'cyan'
    })
  }

  glitchBars.value = bars
}

const getBarStyle = (bar) => ({
  top: `${bar.top}%`,
  height: `${bar.height}px`,
  '--offset-x': `${bar.offsetX}px`,
  '--bar-color': bar.color,
  animationDuration: `${bar.duration}s`
})

const startGlitchLoop = () => {
  glitchInterval = setInterval(() => {
    if (showStatic.value && !isBreaking.value) {
      generateGlitchBars()
    }
  }, TIMING.GLITCH_REGEN)
}

// ========================================
// CLEANUP
// ========================================

const cleanup = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (glitchInterval) {
    clearInterval(glitchInterval)
    glitchInterval = null
  }
}

// ========================================
// LIFECYCLE
// ========================================

onMounted(() => {
  startSequence()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
/* ========================================
   BASE WRAPPER
   ======================================== */

.glitch-reveal-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* ========================================
   CONTENT (Hidden → Revealed)
   ======================================== */

.glitch-content {
  position: relative;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

.glitch-content.revealed {
  opacity: 1;
}

/* ========================================
   SCREEN SHAKE EFFECT
   ======================================== */

.screen-shake {
  animation: earthquake 0.1s ease-in-out infinite;
}

@keyframes earthquake {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  10% {
    transform: translate(-10px, 4px) rotate(-1deg);
  }
  20% {
    transform: translate(9px, -5px) rotate(0.9deg);
  }
  30% {
    transform: translate(-8px, 6px) rotate(-0.8deg);
  }
  40% {
    transform: translate(11px, -4px) rotate(1.1deg);
  }
  50% {
    transform: translate(-9px, 3px) rotate(-1.2deg);
  }
  60% {
    transform: translate(10px, -6px) rotate(1deg);
  }
  70% {
    transform: translate(-7px, 5px) rotate(-0.9deg);
  }
  80% {
    transform: translate(8px, -3px) rotate(0.8deg);
  }
  90% {
    transform: translate(-6px, 4px) rotate(-0.7deg);
  }
}

/* ========================================
   STATIC OVERLAY
   ======================================== */

.static-overlay {
  position: absolute;
  inset: 0;
  z-index: 1000;
  overflow: hidden;
  background: #000;
}

.static-overlay.breaking {
  animation: break-apart 0.65s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}

@keyframes break-apart {
  0% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0px) brightness(1);
  }
  25% {
    transform: scale(1.12) rotate(2deg);
    filter: blur(3px) brightness(1.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(-3deg);
    filter: blur(6px) brightness(1.5);
  }
  75% {
    opacity: 0.6;
    transform: scale(0.85) rotate(5deg);
    filter: blur(12px) brightness(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) rotate(-12deg);
    filter: blur(20px) brightness(0.3);
  }
}

/* ========================================
   TV STATIC CANVAS
   ======================================== */

.static-canvas {
  width: 100%;
  height: 100%;
  opacity: 0.95;
  mix-blend-mode: screen;
}

/* ========================================
   CRT SCANLINES
   ======================================== */

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.2) 0px,
    rgba(0, 0, 0, 0.2) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  animation: scanline-drift 0.12s infinite;
  z-index: 1001;
}

@keyframes scanline-drift {
  0%, 100% {
    opacity: 0.9;
    transform: translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: translateY(1px);
  }
}

/* ========================================
   GLITCH BARS
   ======================================== */

.glitch-bar {
  position: absolute;
  left: 0;
  width: 100%;
  background: var(--bar-color, red);
  animation: glitch-slide infinite ease-in-out;
  z-index: 1002;
  mix-blend-mode: screen;
  opacity: 0.5;
}

@keyframes glitch-slide {
  0%, 100% {
    transform: translateX(0) scaleX(1);
    opacity: 0.4;
  }
  50% {
    transform: translateX(var(--offset-x)) scaleX(1.05);
    opacity: 0.7;
  }
}

/* ========================================
   CHROMATIC ABERRATION (RGB Split)
   ======================================== */

.chromatic-aberration {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 50%,
      transparent 30%,
      rgba(255, 0, 0, 0.15) 45%,
      transparent 60%
    ),
    radial-gradient(ellipse at 48% 50%,
      transparent 25%,
      rgba(0, 255, 255, 0.15) 42%,
      transparent 55%
    );
  animation: chromatic-shift 0.25s infinite;
  mix-blend-mode: screen;
  z-index: 1003;
}

@keyframes chromatic-shift {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0.6;
  }
  25% {
    transform: translate(-2px, 1px);
    opacity: 0.8;
  }
  50% {
    transform: translate(2px, -1px);
    opacity: 0.7;
  }
  75% {
    transform: translate(-1px, 2px);
    opacity: 0.85;
  }
}

/* ========================================
   VHS TRACKING LINES
   ======================================== */

.vhs-tracking {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    rgba(255, 255, 255, 0.02) 1px,
    transparent 2px
  );
  animation: tracking-distortion 0.3s infinite;
  z-index: 1004;
}

@keyframes tracking-distortion {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-1px);
  }
}

/* ========================================
   BREAK EFFECT
   ======================================== */

.break-effect {
  position: absolute;
  inset: 0;
  z-index: 1005;
  pointer-events: none;
}

.flash-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.95) 15%,
    rgba(255, 200, 200, 0.7) 35%,
    transparent 65%
  );
  animation: flash-expand 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes flash-expand {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(0.4) rotate(45deg);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3.5) rotate(360deg);
    opacity: 0;
  }
}

.flash-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border: 6px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow:
    0 0 20px rgba(255, 255, 255, 0.8),
    0 0 40px rgba(255, 255, 255, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.4);
  animation: ring-expand 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes ring-expand {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
    border-width: 6px;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
    opacity: 0.8;
    border-width: 3px;
  }
  100% {
    transform: translate(-50%, -50%) scale(4) rotate(360deg);
    opacity: 0;
    border-width: 0px;
  }
}

/* ========================================
   TRANSITIONS
   ======================================== */

.static-break-enter-active,
.static-break-leave-active {
  transition: all 0.3s ease;
}

.static-break-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.static-break-leave-to {
  opacity: 0;
}

.break-flash-enter-active {
  transition: all 0.5s ease-out;
}

.break-flash-enter-from {
  opacity: 0;
  transform: scale(0);
}
</style>
