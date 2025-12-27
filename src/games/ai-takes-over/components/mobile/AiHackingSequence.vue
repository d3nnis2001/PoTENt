<template>
  <div class="hacking-sequence">
    <div class="ai-scanlines" />

    <div class="sequence-content">
      <!-- Terminal Window -->
      <TerminalBox :show-header="false">
        <!-- Scrolling Code Lines -->
        <div class="code-scroll" ref="codeScroll">
          <div
            v-for="(line, index) in codeLines"
            :key="index"
            class="code-line"
            :class="{ 'highlight': line.highlight }"
          >
            <span class="line-number">{{ String(index + 1).padStart(3, '0') }}</span>
            <span class="line-content">{{ line.text }}</span>
          </div>
        </div>

        <!-- Progress Messages -->
        <div class="progress-section">
          <div
            v-for="(msg, index) in visibleMessages"
            :key="index"
            class="progress-line"
            :class="{ 'success': msg.success, 'current': index === visibleMessages.length - 1 }"
          >
            <span class="progress-icon">{{ msg.success ? '✓' : '>' }}</span>
            <span>{{ msg.text }}</span>
            <span v-if="!msg.success && index === visibleMessages.length - 1" class="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        </div>
      </TerminalBox>

      <!-- Progress Bar -->
      <ProgressBar :progress="progress" class="mt-5" />

      <!-- Access Granted Flash -->
      <transition name="flash">
        <div v-if="showAccessGranted" class="access-granted">
          <div class="access-text">{{ t('mobile.hacking.accessGranted') }}</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import TerminalBox from '@/games/ai-takes-over/components/molecules/TerminalBox.vue'
import ProgressBar from '@/games/ai-takes-over/components/molecules/ProgressBar.vue'

export default {
  name: 'AiHackingSequence',
  components: { TerminalBox, ProgressBar },
  emits: ['complete'],
  setup(_, { emit }) {
    const { t } = useI18n()

    const codeScroll = ref(null)
    const codeLines = ref([])
    const visibleMessages = ref([])
    const progress = ref(0)
    const showAccessGranted = ref(false)

    const fakeCodeSnippets = [
      'import { firewall } from "@bob/security";',
      'const bypass = await decrypt(token);',
      'if (auth.verify(credentials)) {',
      '  return session.create(user);',
      '}',
      'socket.connect(BOB_MAINFRAME);',
      'await handshake.initiate();',
      'const keys = generateKeys(256);',
      'tunnel.encrypt(payload, keys);',
      'response = await send(packet);',
      'if (response.status === "OK") {',
      '  connection.establish();',
      '}',
      'firewall.bypass(0x7F);',
      'access.grant(player_id);',
    ]

    const hackingMessages = t('mobile.hacking.messages')
    const progressMessages = hackingMessages.map((msg, index) => ({
      text: msg.text,
      delay: msg.delay,
      final: index === hackingMessages.length - 1
    }))

    let codeInterval = null
    let messageTimeout = null

    const addCodeLine = () => {
      const randomCode = fakeCodeSnippets[Math.floor(Math.random() * fakeCodeSnippets.length)]
      codeLines.value.push({
        text: randomCode,
        highlight: Math.random() > 0.7
      })

      if (codeLines.value.length > 15) {
        codeLines.value.shift()
      }

      if (codeScroll.value) {
        codeScroll.value.scrollTop = codeScroll.value.scrollHeight
      }
    }

    const processMessages = async () => {
      for (let i = 0; i < progressMessages.length; i++) {
        const msg = progressMessages[i]

        visibleMessages.value.push({ text: msg.text, success: false })

        await new Promise(resolve => {
          messageTimeout = setTimeout(resolve, msg.delay)
        })

        visibleMessages.value[i].success = true
        progress.value = ((i + 1) / progressMessages.length) * 100

        if (msg.final) {
          if (codeInterval) clearInterval(codeInterval)

          await new Promise(resolve => setTimeout(resolve, 300))
          showAccessGranted.value = true

          await new Promise(resolve => setTimeout(resolve, 1000))
          emit('complete')
        }
      }
    }

    onMounted(() => {
      codeInterval = setInterval(addCodeLine, 100)
      setTimeout(processMessages, 500)
    })

    onUnmounted(() => {
      if (codeInterval) clearInterval(codeInterval)
      if (messageTimeout) clearTimeout(messageTimeout)
    })

    return {
      t,
      codeScroll,
      codeLines,
      visibleMessages,
      progress,
      showAccessGranted
    }
  }
}
</script>

<style scoped>
.hacking-sequence {
  position: fixed;
  inset: 0;
  background: var(--ai-bg-dark);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sequence-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.code-scroll {
  height: 150px;
  overflow: hidden;
  padding: 12px;
  font-family: monospace;
  font-size: 11px;
  border-bottom: 1px solid var(--ai-border);
}

.code-line {
  display: flex;
  gap: 12px;
  color: rgba(var(--ai-cyan-rgb), 0.5);
  line-height: 1.6;
}

.code-line.highlight {
  color: var(--ai-cyan);
  text-shadow: 0 0 5px rgba(var(--ai-cyan-rgb), 0.5);
}

.line-number {
  color: rgba(var(--ai-cyan-rgb), 0.3);
  user-select: none;
}

.progress-section {
  padding: 16px;
}

.progress-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 13px;
  color: var(--ai-text-muted);
  margin-bottom: 8px;
  transition: color 0.3s;
}

.progress-line.success {
  color: #27ca40;
}

.progress-line.current {
  color: var(--ai-cyan);
}

.progress-icon {
  width: 16px;
  text-align: center;
}

.loading-dots span {
  animation: dots 1.4s infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dots {
  0%, 20% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.access-granted {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--ai-cyan-rgb), 0.1);
  z-index: 10;
}

.access-text {
  font-family: monospace;
  font-size: 32px;
  font-weight: bold;
  color: var(--ai-cyan);
  text-shadow:
    0 0 20px var(--ai-cyan),
    0 0 40px var(--ai-cyan),
    0 0 60px var(--ai-cyan);
  animation: pulse-glow 0.5s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
  from { opacity: 0.8; }
  to { opacity: 1; }
}

.flash-enter-active {
  animation: flash-in 0.3s ease-out;
}

@keyframes flash-in {
  0% { opacity: 0; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
