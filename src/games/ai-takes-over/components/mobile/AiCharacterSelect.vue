<template>
  <div class="character-select">
    <div class="ai-scanlines" />

    <div class="content">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-xl font-mono font-bold ai-text-glow mb-1">
          &gt; {{ t('mobile.characterSelect.title') }}<BlinkingCursor />
        </h1>
        <p class="text-xs ai-text-muted">{{ t('mobile.characterSelect.subtitle') }}</p>
      </div>

      <!-- Character Grid -->
      <div class="character-grid flex-1 mb-6">
        <CharacterAvatar
          v-for="(char, index) in characters"
          :key="index"
          :icon="char"
          :alt="`Character ${index + 1}`"
          :selected="selectedIndex === index"
          :taken="usedCharacters.includes(index)"
          @click="selectCharacter(index)"
        />
      </div>

      <!-- Name Input -->
      <div class="name-section mb-6">
        <TerminalBox :show-header="false" class="w-full">
          <CyberInput
            v-model="playerName"
            :prompt="t('mobile.characterSelect.nameLabel')"
            :placeholder="t('mobile.characterSelect.namePlaceholder')"
            maxlength="15"
            @keyup.enter="confirmIdentity"
          />
        </TerminalBox>
      </div>

      <!-- Confirm Button -->
      <CyberButton
        :loading="isConfirming"
        :disabled="!canConfirm"
        @click="confirmIdentity"
        class="w-full py-4 rounded text-lg tracking-widest"
      >
        {{ t('mobile.characterSelect.confirmButton') }}
      </CyberButton>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import CharacterAvatar from '@/games/ai-takes-over/components/atoms/CharacterAvatar.vue'
import TerminalBox from '@/games/ai-takes-over/components/molecules/TerminalBox.vue'
import CyberInput from '@/games/ai-takes-over/components/atoms/CyberInput.vue'
import CyberButton from '@/games/ai-takes-over/components/atoms/CyberButton.vue'
import BlinkingCursor from '@/games/ai-takes-over/components/atoms/BlinkingCursor.vue'

export default {
  name: 'AiCharacterSelect',
  components: {
    CharacterAvatar,
    TerminalBox,
    CyberInput,
    CyberButton,
    BlinkingCursor
  },
  props: {
    characters: {
      type: Array,
      required: true
    },
    usedCharacters: {
      type: Array,
      default: () => []
    }
  },
  emits: ['confirm'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const selectedIndex = ref(null)
    const playerName = ref('')
    const isConfirming = ref(false)

    const canConfirm = computed(() => {
      return selectedIndex.value !== null &&
             !props.usedCharacters.includes(selectedIndex.value) &&
             playerName.value.trim().length >= 2 &&
             !isConfirming.value
    })

    const selectCharacter = (index) => {
      if (props.usedCharacters.includes(index)) return
      selectedIndex.value = index
    }

    const confirmIdentity = () => {
      if (!canConfirm.value) return

      isConfirming.value = true
      emit('confirm', {
        iconIndex: selectedIndex.value,
        name: playerName.value.trim()
      })
    }

    const setConfirming = (val) => {
      isConfirming.value = val
    }

    return {
      t,
      selectedIndex,
      playerName,
      isConfirming,
      canConfirm,
      selectCharacter,
      confirmIdentity,
      setConfirming
    }
  }
}
</script>

<style scoped>
.character-select {
  background: var(--ai-bg-dark);
  position: relative;
  min-height: 100vh;
}

.content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
  padding: 4px;
}
</style>
