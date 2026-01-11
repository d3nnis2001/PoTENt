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

    <!-- Phase 10: Duell Intro (Spectator View) -->
    <DuellSpectator
      v-else-if="phase === 'playing' && currentDiscipline === 'duell' && duellState?.phase === 'intro'"
      :duell-state="duellState"
      :current-player-id="currentPlayer?.id"
    />

    <!-- Phase 11: Duell Game (Active Game) -->
    <DuellGame
      v-else-if="phase === 'playing' && currentDiscipline === 'duell' && duellState?.phase === 'playing'"
      :duell-state="duellState"
      :players="playersList"
      :current-player-id="currentPlayer?.id"
      :is-host="false"
      :game-data="duellState?.gameData"
      @submit-answer="handleDuellSubmitAnswer"
      @game-complete="handleDuellGameComplete"
      @spectator-submit="handleDuellSpectatorSubmit"
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
import { bildertitelStore } from '@/games/ai-takes-over/stores/bildertitelStore'
import { dreiWortChaosStore } from '@/games/ai-takes-over/stores/dreiWortChaosStore'
import { autocompleteChaosStore } from '@/games/ai-takes-over/stores/autocompleteChaosStore'
import { conspiracyCornerStore } from '@/games/ai-takes-over/stores/conspiracyCornerStore'
import { werbungFuerMuellStore } from '@/games/ai-takes-over/stores/werbungFuerMuellStore'
import { duellStore } from '@/games/ai-takes-over/stores/duellStore'
import { globalToast } from '@/shared/composables/useToast'
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'
import { useCharacterListener } from '@/games/ai-takes-over/composables/useCharacterListener'
import { useDisciplinePlayer } from '@/games/ai-takes-over/composables/useDisciplinePlayer'
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
import DuellGame from '@/games/ai-takes-over/components/duell/DuellGame.vue'
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
    DuellGame,
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

    // Discipline Composables
    const bildertitel = useDisciplinePlayer('bildertitel', bildertitelStore, lobbyStore, globalToast, t)
    const dreiWortChaos = useDisciplinePlayer('dreiWortChaos', dreiWortChaosStore, lobbyStore, globalToast, t)
    const conspiracyCorner = useDisciplinePlayer('conspiracyCorner', conspiracyCornerStore, lobbyStore, globalToast, t)
    const werbungFuerMuell = useDisciplinePlayer('werbungFuerMuell', werbungFuerMuellStore, lobbyStore, globalToast, t)
    const autocompleteChaos = useDisciplinePlayer('autocompleteChaos', autocompleteChaosStore, lobbyStore, globalToast, t)

    // Bildertitel-specific computed (custom logic not in composable)
    const assignedImage = computed(() => {
      if (!currentPlayer.value || !bildertitel.state.value) return null
      return bildertitelStore.getPlayerAssignedImage(lobbyStore, currentPlayer.value.id)
    })

    const currentImageId = computed(() => {
      if (!bildertitel.state.value) return ''
      const images = bildertitel.state.value.roundImages || []
      const index = bildertitel.state.value.currentRevealIndex || 0
      return images[index]?.id || ''
    })

    const bildertitelVoteOptions = computed(() => {
      if (!currentImageId.value) return []
      return bildertitelStore.getTitlesForImage(lobbyStore, currentImageId.value)
    })

    const bildertitelCanVote = computed(() => {
      if (!currentPlayer.value || !currentImageId.value) return false
      return bildertitelStore.canPlayerVoteOnImage(lobbyStore, currentPlayer.value.id, currentImageId.value)
    })

    // Duell state
    const duellState = computed(() => {
      return currentLobby.value?.gameState?.duell || null
    })

    // Players list for DuellGame
    const playersList = computed(() => {
      return Object.values(players.value || {}).filter(p => p.isOnline)
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

    // ===== DISCIPLINE HANDLERS (using composables) =====
    const handleBildertitelSubmitTitle = (title) => bildertitel.handleSubmit(title)
    const handleBildertitelSubmitVote = (titleOwnerId, imageId) => bildertitel.handleVote(titleOwnerId, imageId)

    const handleDreiWortChaosSubmitAnswer = (answer) => dreiWortChaos.handleSubmit(answer)
    const handleDreiWortChaosSubmitVote = (answerId) => dreiWortChaos.handleVote(answerId)

    const handleConspiracyCornerSubmitTheory = (theory) => conspiracyCorner.handleSubmit(theory)
    const handleConspiracyCornerSubmitVote = (theoryOwnerId) => conspiracyCorner.handleVote(theoryOwnerId)

    const handleWerbungFuerMuellSubmitPitch = (pitch) => werbungFuerMuell.handleSubmit(pitch)
    const handleWerbungFuerMuellSubmitVote = (pitchOwnerId) => werbungFuerMuell.handleVote(pitchOwnerId)

    const handleAutocompleteChaosSubmitCompletion = (completion) => autocompleteChaos.handleSubmit(completion)
    const handleAutocompleteChaosSubmitVote = (completionOwnerId) => autocompleteChaos.handleVote(completionOwnerId)

    // ===== DUELL HANDLERS =====
    const handleDuellSubmitAnswer = async (data) => {
      console.log('Player duell answer:', data)
      await duellStore.submitAction(lobbyStore, 'answer', data)
    }

    const handleDuellGameComplete = async (data) => {
      console.log('Duell game complete from player:', data)
    }

    const handleDuellSpectatorSubmit = async (data) => {
      console.log('Spectator submit:', data)
      await duellStore.submitAction(lobbyStore, 'spectator-answer', data)
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
    watch(() => bildertitel.state.value?.phase, (newPhase, oldPhase) => {
      if (currentDiscipline.value !== 'bildertitel') return
      if (newPhase === 'writing' && oldPhase !== 'writing') {
        bildertitelPlayerRef.value?.resetForNewRound?.()
      } else if (newPhase === 'reveal' || newPhase === 'voting') {
        bildertitelPlayerRef.value?.resetForNewImage?.()
      }
    })

    watch(() => dreiWortChaos.state.value?.phase, (newPhase, oldPhase) => {
      if (currentDiscipline.value !== 'dreiWortChaos') return
      if (newPhase === 'writing' && oldPhase !== 'writing') {
        dreiWortChaosPlayerRef.value?.resetForNewRound?.()
      }
    })

    watch(() => conspiracyCorner.state.value?.phase, (newPhase, oldPhase) => {
      if (currentDiscipline.value !== 'conspiracyCorner') return
      if (newPhase === 'writing' && oldPhase !== 'writing') {
        conspiracyCornerPlayerRef.value?.resetForNewRound?.()
      }
    })

    watch(() => werbungFuerMuell.state.value?.phase, (newPhase, oldPhase) => {
      if (currentDiscipline.value !== 'werbungFuerMuell') return
      if (newPhase === 'writing' && oldPhase !== 'writing') {
        werbungFuerMuellPlayerRef.value?.resetForNewRound?.()
      }
    })

    watch(() => autocompleteChaos.state.value?.phase, (newPhase, oldPhase) => {
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
      // Bildertitel (custom)
      bildertitelState: bildertitel.state,
      assignedImage,
      currentImageId,
      bildertitelVoteOptions,
      bildertitelCanVote,
      bildertitelPlayerScore: bildertitel.playerScore,
      // 3-Wort-Chaos (composable)
      dreiWortChaosState: dreiWortChaos.state,
      dreiWortChaosVoteOptions: dreiWortChaos.voteOptions,
      dreiWortChaosPlayerScore: dreiWortChaos.playerScore,
      // Conspiracy Corner (composable)
      conspiracyCornerState: conspiracyCorner.state,
      conspiracyCornerVoteOptions: conspiracyCorner.voteOptions,
      conspiracyCornerPlayerScore: conspiracyCorner.playerScore,
      // Werbung für Müll (composable)
      werbungFuerMuellState: werbungFuerMuell.state,
      werbungFuerMuellVoteOptions: werbungFuerMuell.voteOptions,
      werbungFuerMuellPlayerScore: werbungFuerMuell.playerScore,
      // Autocomplete Chaos (composable)
      autocompleteChaosState: autocompleteChaos.state,
      autocompleteChaosVoteOptions: autocompleteChaos.voteOptions,
      autocompleteChaosPlayerScore: autocompleteChaos.playerScore,
      // Duell
      duellState,
      playersList,
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
      handleDuellSubmitAnswer,
      handleDuellGameComplete,
      handleDuellSpectatorSubmit,
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
