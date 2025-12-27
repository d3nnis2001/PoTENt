<template>
  <div class="intro-sequence">
    <!-- Scanlines -->
    <div class="ai-scanlines"></div>

    <!-- Black screen with glitch -->
    <div v-if="phase === 'glitch'" class="glitch-screen"></div>

    <!-- Bob Introduction -->
    <div v-else-if="phase === 'bob-intro'" class="bob-intro">
      <div class="terminal-text">
        <p v-for="(line, i) in visibleLines" :key="i" class="terminal-line">
          <span class="prompt">&gt;</span> {{ line }}
        </p>
        <span v-if="isTyping" class="cursor">_</span>
      </div>
    </div>

    <!-- Bob Speech -->
    <div v-else-if="phase === 'bob-speech'" class="bob-speech">
      <div class="speech-container">
        <p class="speech-text">{{ currentSpeech }}</p>
        <span v-if="isTyping" class="cursor">_</span>
      </div>
    </div>

    <!-- Disciplines Reveal -->
    <div v-else-if="phase === 'disciplines'" class="disciplines-reveal">
      <p class="disciplines-intro">{{ disciplineIntro }}</p>
      <div class="disciplines-grid">
        <div
          v-for="(disc, i) in disciplines"
          :key="i"
          class="discipline-card"
          :class="{ 'visible': visibleDisciplines > i }"
        >
          {{ disc }}
        </div>
      </div>
      <p v-if="showDisciplineOutro" class="disciplines-outro">{{ disciplineOutro }}</p>
    </div>

    <!-- Countdown -->
    <div v-else-if="phase === 'countdown'" class="countdown">
      <p class="countdown-label">INITIALISIERUNG IN</p>
      <p class="countdown-number">{{ countdownNumber }}</p>
    </div>

    <!-- Skip hint -->
    <div v-if="phase !== 'countdown'" class="skip-hint" @click="skipIntro">
      [ SKIP ]
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'

export default {
  name: 'BobIntroSequence',
  emits: ['complete'],
  setup(_, { emit }) {
    const { t } = useI18n()

    const phase = ref('glitch')
    const visibleLines = ref([])
    const isTyping = ref(false)
    const currentSpeech = ref('')
    const visibleDisciplines = ref(0)
    const showDisciplineOutro = ref(false)
    const countdownNumber = ref(3)
    const disciplineIntro = ref('')
    const disciplineOutro = ref('')

    const introLines = t('bob.intro.terminalLines')
    const bobSpeeches = t('bob.intro.speeches')
    const disciplines = [
      t('disciplines.logic'),
      t('disciplines.knowledge'),
      t('disciplines.speed'),
      t('disciplines.creativity'),
      t('disciplines.teamwork')
    ]

    let timeouts = []

    const delay = (ms) => new Promise(resolve => {
      const t = setTimeout(resolve, ms)
      timeouts.push(t)
    })

    const typeText = async (text, target, speed = 50) => {
      isTyping.value = true
      for (let i = 0; i <= text.length; i++) {
        target.value = text.slice(0, i)
        await delay(speed)
      }
      isTyping.value = false
    }

    const runSequence = async () => {
      // Phase 1: Glitch (0.8s)
      await delay(800)

      // Phase 2: Bob Intro - Terminal lines
      phase.value = 'bob-intro'
      for (const line of introLines) {
        isTyping.value = true
        let currentLine = ''
        for (let i = 0; i <= line.length; i++) {
          currentLine = line.slice(0, i)
          visibleLines.value = [...visibleLines.value.slice(0, -1), currentLine]
          if (i === 0) visibleLines.value.push(currentLine)
          await delay(40)
        }
        visibleLines.value[visibleLines.value.length - 1] = line
        isTyping.value = false
        await delay(400)
      }
      await delay(800)

      // Phase 3: Bob Speech
      phase.value = 'bob-speech'
      for (const speech of bobSpeeches) {
        await typeText(speech, currentSpeech, 45)
        await delay(1200)
      }
      await delay(600)

      // Phase 4: Disciplines
      phase.value = 'disciplines'
      disciplineIntro.value = ''
      const introText = t('bob.intro.disciplinesIntro')
      await typeText(introText, { value: '', set(v) { disciplineIntro.value = v } }, 40)
      disciplineIntro.value = introText

      await delay(600)

      // Reveal disciplines one by one
      for (let i = 0; i < disciplines.length; i++) {
        visibleDisciplines.value = i + 1
        await delay(400)
      }

      await delay(800)
      showDisciplineOutro.value = true
      disciplineOutro.value = ''
      const outroText = t('bob.intro.disciplinesOutro')
      await typeText(outroText, { value: '', set(v) { disciplineOutro.value = v } }, 40)
      disciplineOutro.value = outroText

      await delay(1500)

      // Phase 5: Countdown
      phase.value = 'countdown'
      countdownNumber.value = 3
      await delay(1000)
      countdownNumber.value = 2
      await delay(1000)
      countdownNumber.value = 1
      await delay(1000)

      emit('complete')
    }

    const skipIntro = () => {
      timeouts.forEach(t => clearTimeout(t))
      timeouts = []
      emit('complete')
    }

    onMounted(() => {
      runSequence()
    })

    onUnmounted(() => {
      timeouts.forEach(t => clearTimeout(t))
    })

    return {
      phase,
      visibleLines,
      isTyping,
      currentSpeech,
      disciplines,
      visibleDisciplines,
      showDisciplineOutro,
      countdownNumber,
      disciplineIntro,
      disciplineOutro,
      skipIntro
    }
  }
}
</script>

<style scoped>
.intro-sequence {
  position: fixed;
  inset: 0;
  background: var(--ai-bg-dark, #0a0a1a);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px);
  pointer-events: none;
  z-index: 1;
}

/* Glitch Screen */
.glitch-screen {
  position: absolute;
  inset: 0;
  background: #000;
  animation: glitch-flash 0.8s ease-out;
}

@keyframes glitch-flash {
  0%, 100% { background: #000; }
  10% { background: var(--ai-cyan); opacity: 0.3; }
  20% { background: #000; }
  30% { background: var(--ai-pink); opacity: 0.2; transform: translateX(-5px); }
  40% { background: #000; transform: translateX(0); }
  60% { background: var(--ai-cyan); opacity: 0.1; }
  70% { background: #000; }
}

/* Bob Intro Terminal */
.bob-intro {
  position: relative;
  z-index: 2;
  padding: 40px;
}

.terminal-text {
  font-family: monospace;
  font-size: 24px;
  color: var(--ai-cyan, #00ffff);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.terminal-line {
  margin-bottom: 12px;
  opacity: 0;
  animation: fade-in 0.3s ease-out forwards;
}

.terminal-line:nth-child(1) { animation-delay: 0s; }
.terminal-line:nth-child(2) { animation-delay: 0.1s; }
.terminal-line:nth-child(3) { animation-delay: 0.2s; }

@keyframes fade-in {
  to { opacity: 1; }
}

.prompt {
  color: var(--ai-pink, #ff00ff);
  margin-right: 8px;
}

.cursor {
  color: var(--ai-cyan, #00ffff);
  animation: blink 0.7s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

/* Bob Speech */
.bob-speech {
  position: relative;
  z-index: 2;
  padding: 40px;
  max-width: 800px;
  text-align: center;
}

.speech-container {
  font-family: monospace;
  font-size: 28px;
  color: var(--ai-cyan, #00ffff);
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
  line-height: 1.6;
}

.speech-text {
  display: inline;
}

/* Disciplines */
.disciplines-reveal {
  position: relative;
  z-index: 2;
  padding: 40px;
  text-align: center;
}

.disciplines-intro {
  font-family: monospace;
  font-size: 22px;
  color: var(--ai-cyan, #00ffff);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
  margin-bottom: 40px;
}

.disciplines-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-bottom: 40px;
}

.discipline-card {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--ai-cyan, #00ffff);
  padding: 16px 32px;
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.4s ease-out;
}

.discipline-card.visible {
  opacity: 1;
  transform: scale(1);
}

.disciplines-outro {
  font-family: monospace;
  font-size: 20px;
  color: var(--ai-pink, #ff00ff);
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.6);
}

/* Countdown */
.countdown {
  position: relative;
  z-index: 2;
  text-align: center;
}

.countdown-label {
  font-family: monospace;
  font-size: 24px;
  color: var(--ai-text-muted, #888);
  margin-bottom: 20px;
  letter-spacing: 0.2em;
}

.countdown-number {
  font-family: monospace;
  font-size: 150px;
  font-weight: bold;
  color: var(--ai-cyan, #00ffff);
  text-shadow:
    0 0 20px var(--ai-cyan, #00ffff),
    0 0 40px var(--ai-cyan, #00ffff),
    0 0 80px var(--ai-cyan, #00ffff);
  animation: pulse-glow 1s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

/* Skip Hint */
.skip-hint {
  position: absolute;
  bottom: 30px;
  right: 30px;
  font-family: monospace;
  font-size: 14px;
  color: var(--ai-text-muted, #666);
  cursor: pointer;
  transition: color 0.3s;
  z-index: 10;
}

.skip-hint:hover {
  color: var(--ai-cyan, #00ffff);
}
</style>
