<template>
  <div class="ai-player-view">
    <!-- Phase 1: Code Input -->
    <AiCodeInput
      v-if="phase === 'code-input'"
      ref="codeInputRef"
      @connect="handleCodeSubmit"
    />

    <!-- Phase 2: Hacking Sequence -->
    <AiHackingSequence
      v-else-if="phase === 'hacking'"
      @complete="handleHackingComplete"
    />

    <!-- Phase 3: Character Select -->
    <AiCharacterSelect
      v-else-if="phase === 'character-select'"
      ref="characterSelectRef"
      :characters="characterImages"
      :used-characters="usedCharacters"
      @confirm="handleCharacterConfirm"
    />

    <!-- Phase 4: Waiting for Game -->
    <AiPlayerWaiting
      v-else-if="phase === 'waiting'"
      :player="currentPlayer"
      :lobby-code="lobbyCode"
      :player-count="playerCount"
      :is-connected="connectionStatus === 'connected'"
    />

    <!-- Phase 5: Bildertitel Discipline -->
    <BildertitelPlayer
      v-else-if="phase === 'playing' && currentDiscipline === 'bildertitel'"
      ref="bildertitelPlayerRef"
      :phase="bildertitelState?.phase || 'waiting'"
      :assigned-image="assignedImage"
      :time-remaining="bildertitelState?.timeRemaining || BILDERTITEL_CONFIG.writeTime"
      :max-time="BILDERTITEL_CONFIG.writeTime"
      :vote-options="bildertitelVoteOptions"
      :can-vote="bildertitelCanVote"
      :player-score="bildertitelPlayerScore"
      :current-image-id="currentImageId"
      @submit-title="handleBildertitelSubmitTitle"
      @submit-vote="handleBildertitelSubmitVote"
    />

    <!-- Phase 6: 3-Wort-Chaos Discipline -->
    <DreiWortChaosPlayer
      v-else-if="phase === 'playing' && currentDiscipline === 'dreiWortChaos'"
      ref="dreiWortChaosPlayerRef"
      :phase="dreiWortChaosState?.phase || 'waiting'"
      :current-prompt="dreiWortChaosState?.currentPrompt"
      :time-remaining="dreiWortChaosState?.timeRemaining || DREI_WORT_CHAOS_CONFIG.writeTime"
      :max-time="DREI_WORT_CHAOS_CONFIG.writeTime"
      :vote-options="dreiWortChaosVoteOptions"
      :current-player-id="currentPlayer?.id"
      :player-score="dreiWortChaosPlayerScore"
      @submit-answer="handleDreiWortChaosSubmitAnswer"
      @submit-vote="handleDreiWortChaosSubmitVote"
    />

    <!-- Phase 7: Conspiracy Corner Discipline -->
    <ConspiracyCornerPlayer
      v-else-if="phase === 'playing' && currentDiscipline === 'conspiracyCorner'"
      ref="conspiracyCornerPlayerRef"
      :phase="conspiracyCornerState?.phase || 'waiting'"
      :current-topic="conspiracyCornerState?.currentTopic"
      :time-remaining="conspiracyCornerState?.timeRemaining || CONSPIRACY_CORNER_CONFIG.writeTime"
      :max-time="CONSPIRACY_CORNER_CONFIG.writeTime"
      :vote-options="conspiracyCornerVoteOptions"
      :current-player-id="currentPlayer?.id"
      :player-score="conspiracyCornerPlayerScore"
      @submit-theory="handleConspiracyCornerSubmitTheory"
      @submit-vote="handleConspiracyCornerSubmitVote"
    />

    <!-- Phase 8: Werbung für Müll Discipline -->
    <WerbungFuerMuellPlayer
      v-else-if="phase === 'playing' && currentDiscipline === 'werbungFuerMuell'"
      ref="werbungFuerMuellPlayerRef"
      :phase="werbungFuerMuellState?.phase || 'waiting'"
      :current-product="werbungFuerMuellState?.currentProduct"
      :time-remaining="werbungFuerMuellState?.timeRemaining || WERBUNG_FUER_MUELL_CONFIG.writeTime"
      :max-time="WERBUNG_FUER_MUELL_CONFIG.writeTime"
      :vote-options="werbungFuerMuellVoteOptions"
      :current-player-id="currentPlayer?.id"
      :player-score="werbungFuerMuellPlayerScore"
      @submit-pitch="handleWerbungFuerMuellSubmitPitch"
      @submit-vote="handleWerbungFuerMuellSubmitVote"
    />

    <!-- Phase 9: Autocomplete Chaos Discipline -->
    <AutocompleteChaosPlayer
      v-else-if="phase === 'playing' && currentDiscipline === 'autocompleteChaos'"
      ref="autocompleteChaosPlayerRef"
      :phase="autocompleteChaosState?.phase || 'waiting'"
      :current-prompt="autocompleteChaosState?.currentPrompt"
      :time-remaining="autocompleteChaosState?.timeRemaining || AUTOCOMPLETE_CHAOS_CONFIG.writeTime"
      :max-time="AUTOCOMPLETE_CHAOS_CONFIG.writeTime"
      :vote-options="autocompleteChaosVoteOptions"
      :current-player-id="currentPlayer?.id"
      :player-score="autocompleteChaosPlayerScore"
      @submit-completion="handleAutocompleteChaosSubmitCompletion"
      @submit-vote="handleAutocompleteChaosSubmitVote"
    />

    <!-- Phase 10: Duell Spectator/Player View -->
    <DuellSpectator
      v-else-if="phase === 'playing' && currentDiscipline === 'duell'"
      :duell-state="duellState"
      :current-player-id="currentPlayer?.id"
    />

    <!-- Fallback: Game Placeholder -->
    <div v-else-if="phase === 'playing'" class="ai-player-view">
      <div class="flex items-center justify-center min-h-screen p-4">
        <TerminalBox title="WARTE..." :show-dots="true">
          <div class="p-8 text-center">
            <h2 class="text-xl font-mono text-cyan-400 mb-4">Nächste Disziplin wird geladen...</h2>
            <CyberButton @click="leaveLobby" class="mt-4">
              Lobby verlassen
            </CyberButton>
          </div>
        </TerminalBox>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '@/shared/composables/useLobby'
import { lobbyStore } from '@/games/hacke-dicht/store/lobbyStore'
import { globalToast } from '@/shared/composables/useToast'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import { useCharacterListener } from '@/games/ai-takes-over/composables/useCharacterListener'
import {
  BILDERTITEL_CONFIG,
  DREI_WORT_CHAOS_CONFIG,
  AUTOCOMPLETE_CHAOS_CONFIG,
  CONSPIRACY_CORNER_CONFIG,
  WERBUNG_FUER_MUELL_CONFIG
} from '@/games/ai-takes-over/config/gameConfig'

import AiCodeInput from '@/games/ai-takes-over/components/mobile/AiCodeInput.vue'
import AiHackingSequence from '@/games/ai-takes-over/components/mobile/AiHackingSequence.vue'
import AiCharacterSelect from '@/games/ai-takes-over/components/mobile/AiCharacterSelect.vue'
import AiPlayerWaiting from '@/games/ai-takes-over/components/mobile/AiPlayerWaiting.vue'
import BildertitelPlayer from '@/games/ai-takes-over/components/disciplines/bildertitel/BildertitelPlayer.vue'
import DreiWortChaosPlayer from '@/games/ai-takes-over/components/disciplines/dreiWortChaos/DreiWortChaosPlayer.vue'
import ConspiracyCornerPlayer from '@/games/ai-takes-over/components/disciplines/conspiracyCorner/ConspiracyCornerPlayer.vue'
import WerbungFuerMuellPlayer from '@/games/ai-takes-over/components/disciplines/werbungFuerMuell/WerbungFuerMuellPlayer.vue'
import AutocompleteChaosPlayer from '@/games/ai-takes-over/components/disciplines/autocompleteChaos/AutocompleteChaosPlayer.vue'
import DuellSpectator from '@/games/ai-takes-over/components/duell/DuellSpectator.vue'
import TerminalBox from '@/games/ai-takes-over/components/molecules/TerminalBox.vue'
import CyberButton from '@/games/ai-takes-over/components/atoms/CyberButton.vue'

export default {
  name: 'AiTakesOverPlayerView',
  components: {
    AiCodeInput,
    AiHackingSequence,
    AiCharacterSelect,
    AiPlayerWaiting,
    BildertitelPlayer,
    DreiWortChaosPlayer,
    ConspiracyCornerPlayer,
    WerbungFuerMuellPlayer,
    AutocompleteChaosPlayer,
    DuellSpectator,
    TerminalBox,
    CyberButton
  },
  props: {
    lobbyCode: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const { success, error: showError } = globalToast
    const { t } = useI18n()

    // Import character images
    const importCharacterImages = () => {
      const images = []
      const modules = import.meta.glob('@/assets/games/ai-takes-over/characters/*.png', { eager: true })
      const sortedKeys = Object.keys(modules).sort()
      sortedKeys.forEach(key => {
        const img = modules[key].default || modules[key]
        images.push(img)
      })
      return images
    }

    const characterImages = importCharacterImages()

    const {
      currentLobby, currentPlayer, players, gameState, connectionStatus,
      joinLobby: joinLobbyAction, leaveLobby: leaveLobbyAction
    } = useLobby()

    const { usedCharacters, setupListener } = useCharacterListener()

    // Component refs
    const codeInputRef = ref(null)
    const characterSelectRef = ref(null)
    const bildertitelPlayerRef = ref(null)
    const dreiWortChaosPlayerRef = ref(null)
    const conspiracyCornerPlayerRef = ref(null)
    const werbungFuerMuellPlayerRef = ref(null)
    const autocompleteChaosPlayerRef = ref(null)

    // Phase management
    const phase = ref('code-input')
    const validatedLobbyCode = ref('')

    // Computed properties
    const playerCount = computed(() =>
      Object.values(players.value || {}).filter(p => p.isOnline).length
    )

    // Current discipline
    const currentDiscipline = computed(() => {
      return currentLobby.value?.gameState?.discipline || null
    })

    // ===== BILDERTITEL COMPUTED =====
    const bildertitelState = computed(() => {
      return currentLobby.value?.gameState?.bildertitel || null
    })

    const assignedImage = computed(() => {
      if (!currentPlayer.value || !bildertitelState.value) return null
      return lobbyStore.getPlayerAssignedImage(currentPlayer.value.id)
    })

    const currentImageId = computed(() => {
      if (!bildertitelState.value) return ''
      const images = bildertitelState.value.roundImages || []
      const index = bildertitelState.value.currentRevealIndex || 0
      return images[index]?.id || ''
    })

    const bildertitelVoteOptions = computed(() => {
      if (!currentImageId.value) return []
      return lobbyStore.getTitlesForImage(currentImageId.value)
    })

    const bildertitelCanVote = computed(() => {
      if (!currentPlayer.value || !currentImageId.value) return false
      return lobbyStore.canPlayerVoteOnImage(currentPlayer.value.id, currentImageId.value)
    })

    const bildertitelPlayerScore = computed(() => {
      if (!currentPlayer.value || !bildertitelState.value) return 0
      return bildertitelState.value.scores?.[currentPlayer.value.id] || 0
    })

    // ===== 3-WORT-CHAOS COMPUTED =====
    const dreiWortChaosState = computed(() => {
      return currentLobby.value?.gameState?.dreiWortChaos || null
    })

    const dreiWortChaosVoteOptions = computed(() => {
      return lobbyStore.getDreiWortChaosSubmissions()
    })

    const dreiWortChaosPlayerScore = computed(() => {
      if (!currentPlayer.value || !dreiWortChaosState.value) return 0
      return dreiWortChaosState.value.scores?.[currentPlayer.value.id] || 0
    })

    // ===== CONSPIRACY CORNER COMPUTED =====
    const conspiracyCornerState = computed(() => {
      return currentLobby.value?.gameState?.conspiracyCorner || null
    })

    const conspiracyCornerVoteOptions = computed(() => {
      return lobbyStore.getConspiracyCornerSubmissions()
    })

    const conspiracyCornerPlayerScore = computed(() => {
      if (!currentPlayer.value || !conspiracyCornerState.value) return 0
      return conspiracyCornerState.value.scores?.[currentPlayer.value.id] || 0
    })

    // ===== WERBUNG FÜR MÜLL COMPUTED =====
    const werbungFuerMuellState = computed(() => {
      return currentLobby.value?.gameState?.werbungFuerMuell || null
    })

    const werbungFuerMuellVoteOptions = computed(() => {
      return lobbyStore.getWerbungFuerMuellSubmissions()
    })

    const werbungFuerMuellPlayerScore = computed(() => {
      if (!currentPlayer.value || !werbungFuerMuellState.value) return 0
      return werbungFuerMuellState.value.scores?.[currentPlayer.value.id] || 0
    })

    // ===== AUTOCOMPLETE CHAOS COMPUTED =====
    const autocompleteChaosState = computed(() => {
      return currentLobby.value?.gameState?.autocompleteChaos || null
    })

    const autocompleteChaosVoteOptions = computed(() => {
      return lobbyStore.getAutocompleteChaosSubmissions()
    })

    const autocompleteChaosPlayerScore = computed(() => {
      if (!currentPlayer.value || !autocompleteChaosState.value) return 0
      return autocompleteChaosState.value.scores?.[currentPlayer.value.id] || 0
    })

    // ===== DUELL COMPUTED =====
    const duellState = computed(() => {
      return currentLobby.value?.gameState?.duell || null
    })

    // Methods
    const handleCodeSubmit = async (code) => {
      validatedLobbyCode.value = code
      try {
        await setupListener(code)
        phase.value = 'hacking'
      } catch (err) {
        codeInputRef.value?.setError(t('mobile.codeInput.errors.notFound'))
      }
    }

    const handleHackingComplete = () => {
      phase.value = 'character-select'
    }

    const handleCharacterConfirm = async (data) => {
      try {
        const iconUrl = characterImages[data.iconIndex] || characterImages[0]
        await joinLobbyAction(validatedLobbyCode.value, data.name, iconUrl, data.iconIndex)
        phase.value = 'waiting'
        success(t('toasts.connectionEstablished'))
      } catch (err) {
        characterSelectRef.value?.setConfirming(false)
        if (err.message !== 'Character bereits vergeben') {
          showError(t('toasts.errors.connection', { message: err.message }))
        }
      }
    }

    // ===== BILDERTITEL HANDLERS =====
    const handleBildertitelSubmitTitle = async (title) => {
      try {
        await lobbyStore.submitBildertitelTitle(title)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    const handleBildertitelSubmitVote = async (titleOwnerId, imageId) => {
      try {
        await lobbyStore.submitBildertitelVote(titleOwnerId, imageId)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    // ===== 3-WORT-CHAOS HANDLERS =====
    const handleDreiWortChaosSubmitAnswer = async (answer) => {
      try {
        await lobbyStore.submitDreiWortChaosAnswer(answer)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    const handleDreiWortChaosSubmitVote = async (answerId) => {
      try {
        await lobbyStore.submitDreiWortChaosVote(answerId)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    // ===== CONSPIRACY CORNER HANDLERS =====
    const handleConspiracyCornerSubmitTheory = async (theory) => {
      try {
        await lobbyStore.submitConspiracyCornerTheory(theory)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    const handleConspiracyCornerSubmitVote = async (theoryOwnerId) => {
      try {
        await lobbyStore.submitConspiracyCornerVote(theoryOwnerId)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    // ===== WERBUNG FÜR MÜLL HANDLERS =====
    const handleWerbungFuerMuellSubmitPitch = async (pitch) => {
      try {
        await lobbyStore.submitWerbungFuerMuellPitch(pitch)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    const handleWerbungFuerMuellSubmitVote = async (pitchOwnerId) => {
      try {
        await lobbyStore.submitWerbungFuerMuellVote(pitchOwnerId)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    // ===== AUTOCOMPLETE CHAOS HANDLERS =====
    const handleAutocompleteChaosSubmitCompletion = async (completion) => {
      try {
        await lobbyStore.submitAutocompleteChaosCompletion(completion)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    const handleAutocompleteChaosSubmitVote = async (completionOwnerId) => {
      try {
        await lobbyStore.submitAutocompleteChaosVote(completionOwnerId)
        success(t('toasts.voteTransmitted'))
      } catch (err) {
        showError(t('toasts.errors.transmission', { message: err.message }))
      }
    }

    const leaveLobby = async () => {
      try {
        await leaveLobbyAction()
      } catch (err) {
        // Ignore errors
      }
      router.push('/')
    }

    // Watch for game state changes
    watch(() => currentLobby.value?.status, (newStatus) => {
      if (newStatus === 'playing' && phase.value === 'waiting') {
        phase.value = 'playing'
      }
    })

    // Reset player component state when phase changes
    watch(() => bildertitelState.value?.phase, (newPhase, oldPhase) => {
      if (currentDiscipline.value !== 'bildertitel') return
      if (newPhase === 'writing' && oldPhase !== 'writing') {
        bildertitelPlayerRef.value?.resetForNewRound?.()
      } else if (newPhase === 'reveal' || newPhase === 'voting') {
        bildertitelPlayerRef.value?.resetForNewImage?.()
      }
    })

    watch(() => dreiWortChaosState.value?.phase, (newPhase, oldPhase) => {
      if (currentDiscipline.value !== 'dreiWortChaos') return
      if (newPhase === 'writing' && oldPhase !== 'writing') {
        dreiWortChaosPlayerRef.value?.resetForNewRound?.()
      }
    })

    watch(() => conspiracyCornerState.value?.phase, (newPhase, oldPhase) => {
      if (currentDiscipline.value !== 'conspiracyCorner') return
      if (newPhase === 'writing' && oldPhase !== 'writing') {
        conspiracyCornerPlayerRef.value?.resetForNewRound?.()
      }
    })

    watch(() => werbungFuerMuellState.value?.phase, (newPhase, oldPhase) => {
      if (currentDiscipline.value !== 'werbungFuerMuell') return
      if (newPhase === 'writing' && oldPhase !== 'writing') {
        werbungFuerMuellPlayerRef.value?.resetForNewRound?.()
      }
    })

    watch(() => autocompleteChaosState.value?.phase, (newPhase, oldPhase) => {
      if (currentDiscipline.value !== 'autocompleteChaos') return
      if (newPhase === 'writing' && oldPhase !== 'writing') {
        autocompleteChaosPlayerRef.value?.resetForNewRound?.()
      }
    })

    return {
      // Config
      BILDERTITEL_CONFIG,
      DREI_WORT_CHAOS_CONFIG,
      AUTOCOMPLETE_CHAOS_CONFIG,
      CONSPIRACY_CORNER_CONFIG,
      WERBUNG_FUER_MUELL_CONFIG,
      // Refs
      codeInputRef,
      characterSelectRef,
      bildertitelPlayerRef,
      dreiWortChaosPlayerRef,
      conspiracyCornerPlayerRef,
      werbungFuerMuellPlayerRef,
      autocompleteChaosPlayerRef,
      phase,
      usedCharacters,
      characterImages,
      currentPlayer,
      lobbyCode: props.lobbyCode,
      playerCount,
      connectionStatus,
      currentDiscipline,
      // Bildertitel
      bildertitelState,
      assignedImage,
      currentImageId,
      bildertitelVoteOptions,
      bildertitelCanVote,
      bildertitelPlayerScore,
      // 3-Wort-Chaos
      dreiWortChaosState,
      dreiWortChaosVoteOptions,
      dreiWortChaosPlayerScore,
      // Conspiracy Corner
      conspiracyCornerState,
      conspiracyCornerVoteOptions,
      conspiracyCornerPlayerScore,
      // Werbung für Müll
      werbungFuerMuellState,
      werbungFuerMuellVoteOptions,
      werbungFuerMuellPlayerScore,
      // Autocomplete Chaos
      autocompleteChaosState,
      autocompleteChaosVoteOptions,
      autocompleteChaosPlayerScore,
      // Duell
      duellState,
      // Methods
      handleCodeSubmit,
      handleHackingComplete,
      handleCharacterConfirm,
      handleBildertitelSubmitTitle,
      handleBildertitelSubmitVote,
      handleDreiWortChaosSubmitAnswer,
      handleDreiWortChaosSubmitVote,
      handleConspiracyCornerSubmitTheory,
      handleConspiracyCornerSubmitVote,
      handleWerbungFuerMuellSubmitPitch,
      handleWerbungFuerMuellSubmitVote,
      handleAutocompleteChaosSubmitCompletion,
      handleAutocompleteChaosSubmitVote,
      leaveLobby
    }
  }
}
</script>

<style scoped>
.ai-player-view {
  min-height: 100vh;
}
</style>
