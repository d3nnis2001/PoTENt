<template>
  <div class="event-screen">
    <!-- CRT TV Monitor Frame -->
    <div class="crt-monitor">
      <!-- TV Bezel -->
      <div class="tv-bezel">
        <!-- Screen with curvature -->
        <div class="tv-screen">
          <!-- Glitch Reveal Effect -->
          <GlitchReveal @revealed="handleRevealed">
            <!-- Event Content -->
            <div class="event-content-wrapper">
              <EventContentDisplay
                :text="eventQuestion.text"
                @continue="$emit('continue')"
              />
            </div>
          </GlitchReveal>

          <!-- CRT Screen Effects -->
          <div class="crt-overlay"></div>
          <div class="screen-reflection"></div>
        </div>

        <!-- TV Speaker Grills -->
        <div class="tv-speaker left"></div>
        <div class="tv-speaker right"></div>
      </div>

      <!-- TV Base/Stand -->
      <div class="tv-stand"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GlitchReveal from './GlitchReveal.vue'
import EventContentDisplay from './EventContentDisplay.vue'

const props = defineProps({
  eventQuestion: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['continue'])

const handleRevealed = () => {
  console.log('Event fully revealed!')
}
</script>

<style scoped>
.event-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
  z-index: 9999;
}

/* CRT Monitor */
.crt-monitor {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 20px 60px rgba(0, 0, 0, 0.8));
}

/* TV Bezel/Frame - DAMAGED */
.tv-bezel {
  position: relative;
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
  padding: 40px;
  border-radius: 20px;
  box-shadow:
    inset 0 4px 8px rgba(255, 255, 255, 0.1),
    inset 0 -4px 8px rgba(0, 0, 0, 0.5),
    0 0 0 2px rgba(0, 0, 0, 0.8),
    0 0 0 4px #1a1a1a,
    /* Damage marks */
    inset 3px 3px 15px rgba(0, 0, 0, 0.8),
    inset -2px -2px 10px rgba(100, 80, 60, 0.1);
  display: flex;
  gap: 20px;
}

.tv-bezel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    /* Bezel scratches */
    linear-gradient(45deg, transparent 48%, rgba(0, 0, 0, 0.3) 48.2%, transparent 48.4%),
    linear-gradient(135deg, transparent 62%, rgba(255, 255, 255, 0.05) 62.1%, transparent 62.2%);
  border-radius: 20px;
  pointer-events: none;
}

/* TV Screen */
.tv-screen {
  position: relative;
  width: 70vw;
  max-width: 900px;
  height: 60vh;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.9),
    inset 0 0 40px rgba(0, 0, 0, 0.6),
    inset 3px 3px 10px rgba(0, 0, 0, 0.8),
    inset -3px -3px 10px rgba(255, 255, 255, 0.02);
}

/* Screen Damage/Scratches - HEAVY DAMAGE */
.tv-screen::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    /* Heavy cracks */
    linear-gradient(125deg, transparent 15%, rgba(255, 255, 255, 0.08) 15.3%, transparent 15.6%),
    linear-gradient(68deg, transparent 22%, rgba(255, 255, 255, 0.06) 22.2%, transparent 22.4%),
    linear-gradient(200deg, transparent 38%, rgba(0, 0, 0, 0.2) 38.3%, transparent 38.6%),
    linear-gradient(310deg, transparent 55%, rgba(255, 255, 255, 0.05) 55.2%, transparent 55.4%),
    linear-gradient(45deg, transparent 67%, rgba(0, 0, 0, 0.15) 67.3%, transparent 67.6%),
    linear-gradient(155deg, transparent 78%, rgba(255, 255, 255, 0.04) 78.2%, transparent 78.4%),
    /* Deep scratches */
    linear-gradient(90deg, transparent 42%, rgba(0, 0, 0, 0.25) 42.1%, transparent 42.2%),
    linear-gradient(5deg, transparent 58%, rgba(255, 255, 255, 0.03) 58.05%, transparent 58.1%),
    /* Dead pixels / burn marks */
    radial-gradient(ellipse at 18% 25%, rgba(0, 0, 0, 0.4) 0%, transparent 35%),
    radial-gradient(ellipse at 75% 65%, rgba(0, 0, 0, 0.35) 0%, transparent 30%),
    radial-gradient(ellipse at 45% 80%, rgba(0, 0, 0, 0.3) 0%, transparent 25%),
    radial-gradient(circle at 88% 20%, rgba(0, 0, 0, 0.5) 0%, transparent 15%),
    /* Dust/dirt */
    radial-gradient(circle at 30% 50%, rgba(100, 100, 80, 0.08) 0%, transparent 8%),
    radial-gradient(circle at 65% 35%, rgba(100, 100, 80, 0.06) 0%, transparent 6%),
    radial-gradient(circle at 50% 70%, rgba(100, 100, 80, 0.07) 0%, transparent 5%);
  pointer-events: none;
  z-index: 99;
  opacity: 0.9;
}

/* Event Content Wrapper */
.event-content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

/* CRT Screen Effects */
.crt-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0px,
      rgba(0, 0, 0, 0.08) 1px,
      rgba(0, 0, 0, 0) 2px
    ),
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      rgba(0, 0, 0, 0.03) 1px,
      transparent 2px,
      transparent 4px
    );
  z-index: 100;
  animation: crt-flicker 0.15s infinite;
}

@keyframes crt-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.97; }
}

.screen-reflection {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse at 25% 25%,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 45%
    ),
    radial-gradient(
      ellipse at 75% 75%,
      rgba(0, 0, 0, 0.2) 0%,
      transparent 40%
    );
  z-index: 101;
  opacity: 0.5;
}

/* TV Speakers */
.tv-speaker {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 200px;
  background:
    repeating-linear-gradient(
      0deg,
      #1a1a1a 0px,
      #0a0a0a 2px,
      #1a1a1a 4px
    );
  border-radius: 4px;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.8),
    inset 0 -2px 4px rgba(255, 255, 255, 0.05);
}

.tv-speaker.left {
  left: -80px;
}

.tv-speaker.right {
  right: -80px;
}

/* TV Stand */
.tv-stand {
  width: 200px;
  height: 30px;
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
  border-radius: 8px 8px 15px 15px;
  margin-top: 20px;
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.6),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.tv-stand::before {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 15px;
  background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
  border-radius: 0 0 20px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}
</style>