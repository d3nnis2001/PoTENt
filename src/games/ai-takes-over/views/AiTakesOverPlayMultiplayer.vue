<template>
  <div class="min-h-screen ai-background relative overflow-hidden">
    <!-- Bob Intro Sequence -->
    <BobIntroSequence
      v-if="showIntro"
      @complete="onIntroComplete"
    />

    <!-- Background Image -->
    <div class="background-image"></div>

    <!-- Scanlines Overlay -->
    <div class="scanlines-overlay"></div>

    <!-- Content -->
    <div v-if="!showIntro" class="relative z-10 p-4">
      <div class="max-w-6xl mx-auto">
        <!-- Custom AI Header for Lobby -->
        <div v-if="!currentLobby || currentLobby.status === 'waiting'" class="text-center mb-8">
          <button
            @click="handleBackToGallery"
            class="cyber-back-button mb-4 px-4 py-2 rounded-lg font-mono text-sm"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              &lt; ZURÜCK
            </span>
          </button>
          <h1 class="text-4xl font-bold font-mono tracking-wider glitch-title">
            <span class="text-cyan-400">AI</span>
            <span class="text-pink-500">_</span>
            <span class="text-cyan-400">TAKES</span>
            <span class="text-pink-500">_</span>
            <span class="text-cyan-400">OVER</span>
          </h1>
          <p class="text-cyan-600 text-sm font-mono mt-2">// Bob wartet auf euch...</p>
        </div>

        <!-- Loading Screen -->
        <LoadingView v-if="isLoading" message="Erstelle Multiplayer-Spiel..." />

        <!-- Lobby Setup (vor Spielstart) -->
        <AiLobbySetupForm
          v-else-if="!currentLobby"
          :is-creating-lobby="isCreatingLobby"
          :game-loaded="true"
          @create-lobby="createLobby"
        />

        <!-- Warten auf Spieler (nach Lobby-Erstellung) -->
        <AiLobbyWaitingArea
          v-else-if="currentLobby && currentLobby.status === 'waiting'"
          :lobby-code="currentLobby.code"
          :join-url="joinUrl"
          :player-list="playerList"
          :player-count="playerCount"
          :is-starting-game="isStartingGame"
          @copy-lobby-code="copyLobbyCode"
          @copy-join-url="copyJoinUrl"
          @start-game="startGame"
        />

        <!-- BILDERTITEL DISCIPLINE -->
        <BildertitelHost
          v-else-if="currentLobby && currentLobby.status === 'playing' && currentDiscipline === 'bildertitel'"
          :phase="bildertitelState?.phase || 'waiting'"
          :current-round="bildertitelState?.currentRound || 0"
          :total-rounds="BILDERTITEL_ROUNDS"
          :time-remaining="timeRemaining"
          :submission-count="bildertitelSubmissionCount"
          :total-players="playerCount"
          :all-submitted="bildertitelAllSubmitted"
          :current-image="currentImage"
          :current-reveal-index="bildertitelState?.currentRevealIndex || 0"
          :total-images="bildertitelState?.roundImages?.length || 0"
          :titles-for-current-image="titlesForCurrentImage"
          :show-votes="bildertitelState?.phase === 'voting'"
          :scores="bildertitelState?.scores || {}"
          :players="playerList"
          @start-reveal="handleBildertitelStartReveal"
          @start-voting="handleBildertitelStartVoting"
          @finish-voting="handleBildertitelFinishVoting"
          @next-round="handleBildertitelNextRound"
        />

        <!-- 3-WORT-CHAOS DISCIPLINE -->
        <DreiWortChaosHost
          v-else-if="currentLobby && currentLobby.status === 'playing' && currentDiscipline === 'dreiWortChaos'"
          :phase="dreiWortChaosState?.phase || 'waiting'"
          :current-round="dreiWortChaosState?.currentRound || 0"
          :total-rounds="dreiWortChaosState?.totalRounds || DREI_WORT_ROUNDS"
          :current-prompt="dreiWortChaosState?.currentPrompt"
          :time-remaining="timeRemaining"
          :submission-count="dreiWortChaosSubmissionCount"
          :total-players="playerCount"
          :all-submitted="dreiWortChaosAllSubmitted"
          :submissions="dreiWortChaosSubmissions"
          :revealed-count="999"
          :show-authors="dreiWortChaosState?.phase === 'results'"
          :scores="dreiWortChaosState?.scores || {}"
          :players="playerList"
          @start-reveal="handleDreiWortChaosStartReveal"
          @start-voting="handleDreiWortChaosStartVoting"
          @finish-voting="handleDreiWortChaosFinishVoting"
          @next-round="handleDreiWortChaosNextRound"
        />

        <!-- CONSPIRACY CORNER DISCIPLINE -->
        <ConspiracyCornerHost
          v-else-if="currentLobby && currentLobby.status === 'playing' && currentDiscipline === 'conspiracyCorner'"
          :phase="conspiracyCornerState?.phase || 'waiting'"
          :current-round="conspiracyCornerState?.currentRound || 0"
          :total-rounds="conspiracyCornerState?.totalRounds || CONSPIRACY_CORNER_ROUNDS"
          :current-topic="conspiracyCornerState?.currentTopic"
          :time-remaining="timeRemaining"
          :submission-count="conspiracyCornerSubmissionCount"
          :total-players="playerCount"
          :all-submitted="conspiracyCornerAllSubmitted"
          :submissions="conspiracyCornerSubmissions"
          :show-authors="conspiracyCornerState?.phase === 'results'"
          :scores="conspiracyCornerState?.scores || {}"
          :players="playerList"
          @start-reveal="handleConspiracyCornerStartReveal"
          @start-voting="handleConspiracyCornerStartVoting"
          @finish-voting="handleConspiracyCornerFinishVoting"
          @next-round="handleConspiracyCornerNextRound"
        />

        <!-- WERBUNG FÜR MÜLL DISCIPLINE -->
        <WerbungFuerMuellHost
          v-else-if="currentLobby && currentLobby.status === 'playing' && currentDiscipline === 'werbungFuerMuell'"
          :phase="werbungFuerMuellState?.phase || 'waiting'"
          :current-round="werbungFuerMuellState?.currentRound || 0"
          :total-rounds="werbungFuerMuellState?.totalRounds || WERBUNG_FUER_MUELL_ROUNDS"
          :current-product="werbungFuerMuellState?.currentProduct"
          :time-remaining="timeRemaining"
          :submission-count="werbungFuerMuellSubmissionCount"
          :total-players="playerCount"
          :all-submitted="werbungFuerMuellAllSubmitted"
          :submissions="werbungFuerMuellSubmissions"
          :show-authors="werbungFuerMuellState?.phase === 'results'"
          :scores="werbungFuerMuellState?.scores || {}"
          :players="playerList"
          @start-reveal="handleWerbungFuerMuellStartReveal"
          @start-voting="handleWerbungFuerMuellStartVoting"
          @finish-voting="handleWerbungFuerMuellFinishVoting"
          @next-round="handleWerbungFuerMuellNextRound"
        />

        <!-- AUTOCOMPLETE CHAOS DISCIPLINE -->
        <AutocompleteChaosHost
          v-else-if="currentLobby && currentLobby.status === 'playing' && currentDiscipline === 'autocompleteChaos'"
          :phase="autocompleteChaosState?.phase || 'waiting'"
          :current-round="autocompleteChaosState?.currentRound || 0"
          :total-rounds="autocompleteChaosState?.totalRounds || AUTOCOMPLETE_CHAOS_ROUNDS"
          :current-prompt="autocompleteChaosState?.currentPrompt"
          :time-remaining="timeRemaining"
          :submission-count="autocompleteChaosSubmissionCount"
          :total-players="playerCount"
          :all-submitted="autocompleteChaosAllSubmitted"
          :submissions="autocompleteChaosSubmissions"
          :show-authors="autocompleteChaosState?.phase === 'results'"
          :scores="autocompleteChaosState?.scores || {}"
          :players="playerList"
          @start-reveal="handleAutocompleteChaosStartReveal"
          @start-voting="handleAutocompleteChaosStartVoting"
          @finish-voting="handleAutocompleteChaosFinishVoting"
          @next-round="handleAutocompleteChaosNextRound"
        />

        <!-- DUELL INTRO -->
        <DuellIntro
          v-else-if="currentLobby && currentLobby.status === 'playing' && currentDiscipline === 'duell' && duellState?.phase === 'intro'"
          ref="duellIntroRef"
          :players="playerList"
          :is-host="true"
          :duell-games="DUELL_GAMES"
          :pre-selected-player-a="duellState?.playerA"
          :pre-selected-player-b="duellState?.playerB"
          :pre-selected-game="duellState?.game"
          @duell-ready="handleDuellReady"
          @start-duell="handleDuellStart"
        />

        <!-- DUELL GAME -->
        <DuellGame
          v-else-if="currentLobby && currentLobby.status === 'playing' && currentDiscipline === 'duell' && duellState?.phase === 'playing'"
          :duell-state="duellState"
          :players="playerList"
          :current-player-id="currentPlayer?.id"
          :is-host="true"
          :game-data="duellState?.gameData"
          @submit-answer="handleDuellSubmitAnswer"
          @game-complete="handleDuellGameComplete"
          @spectator-submit="handleDuellSpectatorSubmit"
        />

        <!-- Game Finished -->
        <div v-else-if="currentLobby && currentLobby.status === 'finished'" class="text-center">
          <TerminalBox title="SPIEL BEENDET" :show-dots="true">
            <div class="p-8">
              <h2 class="text-2xl font-mono text-cyan-400 mb-4">Danke fürs Spielen!</h2>
              <CyberButton @click="handleBackToGallery" class="mt-6">
                Zurück zur Gallery
              </CyberButton>
            </div>
          </TerminalBox>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
import { getBildertitelImages, getImagesForRound, assignPlayersToImages } from '@/games/ai-takes-over/data/bildertitelImages'
import { getRandomPrompts } from '@/games/ai-takes-over/data/dreiWortChaosPrompts'
import { getRandomPrompts as getAutocompletePrompts } from '@/games/ai-takes-over/data/autocompleteChaosPrompts'
import {
  BILDERTITEL_CONFIG,
  DREI_WORT_CHAOS_CONFIG,
  AUTOCOMPLETE_CHAOS_CONFIG,
  CONSPIRACY_CORNER_CONFIG,
  WERBUNG_FUER_MUELL_CONFIG,
  DISCIPLINE_ORDER,
  MINI_DISCIPLINES
} from '@/games/ai-takes-over/config/gameConfig'
import { getRandomTopics } from '@/games/ai-takes-over/data/conspiracyCornerTopics'
import { getRandomProducts } from '@/games/ai-takes-over/data/werbungFuerMuellProducts'
import { DUELL_GAMES, DUELL_CONFIG, selectDuellPlayers, getRandomDuellGame } from '@/games/ai-takes-over/config/duellConfig'

// Composables
import { useGameTimer } from '@/games/ai-takes-over/composables/useGameTimer'
import { useDisciplineHost } from '@/games/ai-takes-over/composables/useDisciplineHost'
import { useDuellSystem } from '@/games/ai-takes-over/composables/useDuellSystem'

// Basic UI Components
import LoadingView from '@/games/hacke-dicht/components/game/LoadingView.vue'

// AI Takes Over Components
import AiLobbySetupForm from '@/games/ai-takes-over/components/lobby/AiLobbySetupForm.vue'
import AiLobbyWaitingArea from '@/games/ai-takes-over/components/lobby/AiLobbyWaitingArea.vue'
import BobIntroSequence from '@/games/ai-takes-over/components/game/BobIntroSequence.vue'
import BildertitelHost from '@/games/ai-takes-over/components/disciplines/bildertitel/BildertitelHost.vue'
import DreiWortChaosHost from '@/games/ai-takes-over/components/disciplines/dreiWortChaos/DreiWortChaosHost.vue'
import ConspiracyCornerHost from '@/games/ai-takes-over/components/disciplines/conspiracyCorner/ConspiracyCornerHost.vue'
import WerbungFuerMuellHost from '@/games/ai-takes-over/components/disciplines/werbungFuerMuell/WerbungFuerMuellHost.vue'
import AutocompleteChaosHost from '@/games/ai-takes-over/components/disciplines/autocompleteChaos/AutocompleteChaosHost.vue'
import DuellIntro from '@/games/ai-takes-over/components/duell/DuellIntro.vue'
import DuellGame from '@/games/ai-takes-over/components/duell/DuellGame.vue'
import TerminalBox from '@/games/ai-takes-over/components/molecules/TerminalBox.vue'
import CyberButton from '@/games/ai-takes-over/components/atoms/CyberButton.vue'

export default {
  name: 'AiTakesOverPlayMultiplayer',
  components: {
    LoadingView,
    AiLobbySetupForm,
    AiLobbyWaitingArea,
    BobIntroSequence,
    BildertitelHost,
    DreiWortChaosHost,
    ConspiracyCornerHost,
    WerbungFuerMuellHost,
    AutocompleteChaosHost,
    DuellIntro,
    DuellGame,
    TerminalBox,
    CyberButton
  },
  setup() {
    const router = useRouter()
    const { success, error: showError } = globalToast
    const { t } = useI18n()

    // Use config values
    const BILDERTITEL_ROUNDS = BILDERTITEL_CONFIG.rounds
    const DREI_WORT_ROUNDS = DREI_WORT_CHAOS_CONFIG.rounds
    const AUTOCOMPLETE_CHAOS_ROUNDS = AUTOCOMPLETE_CHAOS_CONFIG.rounds
    const CONSPIRACY_CORNER_ROUNDS = CONSPIRACY_CORNER_CONFIG.rounds
    const WERBUNG_FUER_MUELL_ROUNDS = WERBUNG_FUER_MUELL_CONFIG.rounds

    // Lobby Management
    const {
      currentLobby,
      currentPlayer,
      players,
      connectionStatus,
      createLobby: createLobbyAction,
      startGame: startGameAction
    } = useLobby()

    // State
    const isLoading = ref(false)
    const isCreatingLobby = ref(false)
    const isStartingGame = ref(false)
    const showIntro = ref(false)
    const allImages = ref(getBildertitelImages())

    // Timer Composable
    const { timeRemaining, startTimer, stopTimer, onTimerEnd } = useGameTimer()

    // Computed
    const playerList = computed(() => {
      return Object.values(players.value || {})
        .filter(p => p.isOnline && !p.isHost && !p.isModerator)
    })

    const playerCount = computed(() => playerList.value.length)

    const joinUrl = computed(() => {
      if (!currentLobby.value) return ''
      return `${window.location.origin}/#/ai-takes-over/play/${currentLobby.value.code}`
    })

    // Current discipline
    const currentDiscipline = computed(() => {
      return currentLobby.value?.gameState?.discipline || null
    })

    // Helper for starting next discipline
    const startNextDiscipline = async (nextDiscipline) => {
      if (nextDiscipline === 'dreiWortChaos') await startDreiWortChaos()
      else if (nextDiscipline === 'autocompleteChaos') await startAutocompleteChaos()
      else if (nextDiscipline === 'conspiracyCorner') await startConspiracyCorner()
      else if (nextDiscipline === 'werbungFuerMuell') await startWerbungFuerMuell()
    }

    // Discipline Composables
    const dreiWortChaos = useDisciplineHost(
      'dreiWortChaos',
      dreiWortChaosStore,
      lobbyStore,
      DREI_WORT_CHAOS_CONFIG,
      { startTimer, stopTimer }
    )

    const autocompleteChaos = useDisciplineHost(
      'autocompleteChaos',
      autocompleteChaosStore,
      lobbyStore,
      AUTOCOMPLETE_CHAOS_CONFIG,
      { startTimer, stopTimer }
    )

    const conspiracyCorner = useDisciplineHost(
      'conspiracyCorner',
      conspiracyCornerStore,
      lobbyStore,
      CONSPIRACY_CORNER_CONFIG,
      { startTimer, stopTimer }
    )

    const werbungFuerMuell = useDisciplineHost(
      'werbungFuerMuell',
      werbungFuerMuellStore,
      lobbyStore,
      WERBUNG_FUER_MUELL_CONFIG,
      { startTimer, stopTimer }
    )

    // Duell Composable
    const duell = useDuellSystem(
      lobbyStore,
      duellStore,
      DUELL_CONFIG,
      selectDuellPlayers,
      getRandomDuellGame,
      startNextDiscipline
    )

    // Bildertitel specific state (has unique image logic)
    const bildertitelState = computed(() => {
      return currentLobby.value?.gameState?.bildertitel || null
    })

    const currentImage = computed(() => {
      if (!bildertitelState.value) return null
      const images = bildertitelState.value.roundImages || []
      const index = bildertitelState.value.currentRevealIndex || 0
      return images[index] || null
    })

    const bildertitelSubmissionCount = computed(() => {
      return bildertitelStore.getSubmissionCount(lobbyStore)
    })

    const bildertitelAllSubmitted = computed(() => {
      return bildertitelSubmissionCount.value >= playerCount.value
    })

    const titlesForCurrentImage = computed(() => {
      if (!currentImage.value) return []
      return bildertitelStore.getTitlesForImage(lobbyStore, currentImage.value.id)
    })

    // Timer end handler
    const handleTimerEnd = () => {
      const discipline = currentDiscipline.value

      if (discipline === 'bildertitel') {
        const phase = bildertitelState.value?.phase
        if (phase === 'writing') handleBildertitelStartReveal()
        else if (phase === 'voting') handleBildertitelFinishVoting()
      } else if (discipline === 'dreiWortChaos') {
        const phase = dreiWortChaos.state.value?.phase
        if (phase === 'writing') dreiWortChaos.handleStartReveal()
        else if (phase === 'voting') dreiWortChaos.handleFinishVoting()
      } else if (discipline === 'conspiracyCorner') {
        const phase = conspiracyCorner.state.value?.phase
        if (phase === 'writing') conspiracyCorner.handleStartReveal()
        else if (phase === 'voting') conspiracyCorner.handleFinishVoting()
      } else if (discipline === 'werbungFuerMuell') {
        const phase = werbungFuerMuell.state.value?.phase
        if (phase === 'writing') werbungFuerMuell.handleStartReveal()
        else if (phase === 'voting') werbungFuerMuell.handleFinishVoting()
      } else if (discipline === 'autocompleteChaos') {
        const phase = autocompleteChaos.state.value?.phase
        if (phase === 'writing') autocompleteChaos.handleStartReveal()
        else if (phase === 'voting') autocompleteChaos.handleFinishVoting()
      }
    }

    // Register timer end callback
    onTimerEnd(handleTimerEnd)

    // Methods
    const copyLobbyCode = async () => {
      if (!currentLobby.value) return
      try {
        await navigator.clipboard.writeText(currentLobby.value.code)
        success(t('toasts.lobbyCodeCopied'))
      } catch (error) {
        showError(t('toasts.errors.copyFailed'))
      }
    }

    const copyJoinUrl = async () => {
      try {
        await navigator.clipboard.writeText(joinUrl.value)
        success(t('toasts.joinLinkCopied'))
      } catch (error) {
        showError(t('toasts.errors.copyFailed'))
      }
    }

    const createLobby = async (hostName) => {
      if (!hostName.trim()) {
        showError(t('toasts.errors.nameRequired'))
        return
      }

      isCreatingLobby.value = true
      try {
        const gameData = {
          id: 'ai-takes-over-default',
          name: 'AI Takes Over',
          description: 'Bob übernimmt die Kontrolle!',
          disciplines: DISCIPLINE_ORDER,
          miniDisciplines: MINI_DISCIPLINES
        }

        await createLobbyAction('ai-takes-over', hostName.trim(), gameData)
        success(t('toasts.lobbyCreated', { code: currentLobby.value.code }))
      } catch (error) {
        showError(t('toasts.errors.lobbyCreation', { message: error.message }))
      } finally {
        isCreatingLobby.value = false
      }
    }

    const startGame = async () => {
      isStartingGame.value = true
      try {
        showIntro.value = true
      } catch (error) {
        showError(t('toasts.errors.gameStart', { message: error.message }))
        isStartingGame.value = false
      }
    }

    const onIntroComplete = async () => {
      showIntro.value = false
      try {
        await startGameAction()

        // Check first discipline from config
        const firstDiscipline = DISCIPLINE_ORDER[0]

        if (firstDiscipline === 'duell') {
          // Start with Duell - trigger it with the second discipline as next
          const nextAfterDuell = DISCIPLINE_ORDER[1] || 'bildertitel'
          await duell.triggerDuell(nextAfterDuell)
        } else {
          // Initialize Bildertitel as first discipline (default)
          const playersData = playerList.value.map(p => ({ id: p.id, name: p.name, icon: p.icon }))
          const roundImages = getImagesForRound(playersData.length, 0, allImages.value)
          const assignments = assignPlayersToImages(playersData, roundImages)

          await bildertitelStore.initialize(lobbyStore, roundImages, assignments)
          startTimer(BILDERTITEL_CONFIG.writeTime)
        }

        success(t('toasts.gameInitialized'))
      } catch (error) {
        showError(t('toasts.errors.gameStart', { message: error.message }))
      } finally {
        isStartingGame.value = false
      }
    }

    // ===== BILDERTITEL HANDLERS =====
    const handleBildertitelStartReveal = async () => {
      stopTimer()
      await bildertitelStore.updatePhase(lobbyStore, 'reveal')
    }

    const handleBildertitelStartVoting = async () => {
      await bildertitelStore.updatePhase(lobbyStore, 'voting')
      startTimer(BILDERTITEL_CONFIG.voteTime)
    }

    const handleBildertitelFinishVoting = async () => {
      stopTimer()
      const roundImages = bildertitelState.value?.roundImages || []
      const currentIndex = bildertitelState.value?.currentRevealIndex || 0

      if (currentIndex < roundImages.length - 1) {
        await bildertitelStore.nextImage(lobbyStore)
      } else {
        await bildertitelStore.calculateScores(lobbyStore)
        await bildertitelStore.updatePhase(lobbyStore, 'results')
      }
    }

    const handleBildertitelNextRound = async () => {
      const currentRound = bildertitelState.value?.currentRound || 0

      if (currentRound < BILDERTITEL_ROUNDS - 1) {
        const playersData = playerList.value.map(p => ({ id: p.id, name: p.name, icon: p.icon }))
        const roundImages = getImagesForRound(playersData.length, currentRound + 1, allImages.value)
        const assignments = assignPlayersToImages(playersData, roundImages)

        await bildertitelStore.nextRound(lobbyStore, roundImages, assignments)
        startTimer(BILDERTITEL_CONFIG.writeTime)
      } else {
        // Bildertitel finished - start 3-Wort-Chaos
        await bildertitelStore.finish(lobbyStore)
        await startDreiWortChaos()
      }
    }

    // ===== 3-WORT-CHAOS HANDLERS =====
    const startDreiWortChaos = async () => {
      const prompts = getRandomPrompts(DREI_WORT_CHAOS_CONFIG.rounds)
      await dreiWortChaos.initialize(prompts)
    }

    const handleDreiWortChaosStartReveal = () => dreiWortChaos.handleStartReveal()
    const handleDreiWortChaosStartVoting = () => dreiWortChaos.handleStartVoting()
    const handleDreiWortChaosFinishVoting = () => dreiWortChaos.handleFinishVoting()
    const handleDreiWortChaosNextRound = async () => {
      const hasMore = await dreiWortChaos.handleNextRound()
      if (!hasMore) await duell.triggerDuell('autocompleteChaos')
    }

    // ===== AUTOCOMPLETE CHAOS HANDLERS =====
    const startAutocompleteChaos = async () => {
      const prompts = getAutocompletePrompts(AUTOCOMPLETE_CHAOS_CONFIG.rounds)
      await autocompleteChaos.initialize(prompts)
    }

    const handleAutocompleteChaosStartReveal = () => autocompleteChaos.handleStartReveal()
    const handleAutocompleteChaosStartVoting = () => autocompleteChaos.handleStartVoting()
    const handleAutocompleteChaosFinishVoting = () => autocompleteChaos.handleFinishVoting()
    const handleAutocompleteChaosNextRound = async () => {
      const hasMore = await autocompleteChaos.handleNextRound()
      if (!hasMore) await startConspiracyCorner()
    }

    // ===== CONSPIRACY CORNER HANDLERS =====
    const startConspiracyCorner = async () => {
      const topics = getRandomTopics(CONSPIRACY_CORNER_CONFIG.rounds)
      await conspiracyCorner.initialize(topics)
    }

    const handleConspiracyCornerStartReveal = () => conspiracyCorner.handleStartReveal()
    const handleConspiracyCornerStartVoting = () => conspiracyCorner.handleStartVoting()
    const handleConspiracyCornerFinishVoting = () => conspiracyCorner.handleFinishVoting()
    const handleConspiracyCornerNextRound = async () => {
      const hasMore = await conspiracyCorner.handleNextRound()
      if (!hasMore) await duell.triggerDuell('werbungFuerMuell')
    }

    // ===== WERBUNG FÜR MÜLL HANDLERS =====
    const startWerbungFuerMuell = async () => {
      const products = getRandomProducts(WERBUNG_FUER_MUELL_CONFIG.rounds)
      await werbungFuerMuell.initialize(products)
    }

    const handleWerbungFuerMuellStartReveal = () => werbungFuerMuell.handleStartReveal()
    const handleWerbungFuerMuellStartVoting = () => werbungFuerMuell.handleStartVoting()
    const handleWerbungFuerMuellFinishVoting = () => werbungFuerMuell.handleFinishVoting()
    const handleWerbungFuerMuellNextRound = async () => {
      const hasMore = await werbungFuerMuell.handleNextRound()
      if (!hasMore) await lobbyStore.finishGame()
    }

    const handleBackToGallery = () => {
      stopTimer()
      router.push('/ai-takes-over/gallery')
    }

    // ===== DUELL HANDLERS =====
    const handleDuellReady = (duellData) => duell.handleDuellReady(duellData)
    const handleDuellStart = (duellData) => duell.handleDuellStart(duellData)
    const handleDuellComplete = () => duell.handleDuellComplete()

    // Duell Game handlers (for when the actual mini-game is playing)
    const handleDuellSubmitAnswer = async (data) => {
      console.log('Duell answer submitted:', data)
      // TODO: Process answer and update game state
    }

    const handleDuellGameComplete = async (data) => {
      console.log('Duell game complete:', data)
      if (data.action === 'finish') {
        await duell.handleDuellComplete()
      }
    }

    const handleDuellSpectatorSubmit = async (data) => {
      console.log('Spectator submitted:', data)
      // TODO: Process spectator answer
    }

    onMounted(() => {})
    onUnmounted(() => { stopTimer() })

    return {
      // Constants
      BILDERTITEL_ROUNDS,
      DREI_WORT_ROUNDS,
      CONSPIRACY_CORNER_ROUNDS,
      WERBUNG_FUER_MUELL_ROUNDS,

      // State
      isLoading,
      isCreatingLobby,
      isStartingGame,
      showIntro,
      timeRemaining,
      currentLobby,
      currentPlayer,
      connectionStatus,

      // Computed
      playerList,
      playerCount,
      joinUrl,
      currentDiscipline,
      // Bildertitel (custom)
      bildertitelState,
      currentImage,
      bildertitelSubmissionCount,
      bildertitelAllSubmitted,
      titlesForCurrentImage,
      // DreiWortChaos (composable)
      dreiWortChaosState: dreiWortChaos.state,
      dreiWortChaosSubmissionCount: dreiWortChaos.submissionCount,
      dreiWortChaosAllSubmitted: dreiWortChaos.allSubmitted,
      dreiWortChaosSubmissions: dreiWortChaos.submissions,
      // ConspiracyCorner (composable)
      conspiracyCornerState: conspiracyCorner.state,
      conspiracyCornerSubmissionCount: conspiracyCorner.submissionCount,
      conspiracyCornerAllSubmitted: conspiracyCorner.allSubmitted,
      conspiracyCornerSubmissions: conspiracyCorner.submissions,
      // WerbungFuerMuell (composable)
      werbungFuerMuellState: werbungFuerMuell.state,
      werbungFuerMuellSubmissionCount: werbungFuerMuell.submissionCount,
      werbungFuerMuellAllSubmitted: werbungFuerMuell.allSubmitted,
      werbungFuerMuellSubmissions: werbungFuerMuell.submissions,
      // AutocompleteChaos (composable)
      autocompleteChaosState: autocompleteChaos.state,
      autocompleteChaosSubmissionCount: autocompleteChaos.submissionCount,
      autocompleteChaosAllSubmitted: autocompleteChaos.allSubmitted,
      autocompleteChaosSubmissions: autocompleteChaos.submissions,
      // Duell (composable)
      duellState: duell.state,
      duellIntroRef: duell.duellIntroRef,
      DUELL_GAMES,

      // Methods
      createLobby,
      startGame,
      onIntroComplete,
      copyLobbyCode,
      copyJoinUrl,
      handleBackToGallery,
      handleBildertitelStartReveal,
      handleBildertitelStartVoting,
      handleBildertitelFinishVoting,
      handleBildertitelNextRound,
      handleDreiWortChaosStartReveal,
      handleDreiWortChaosStartVoting,
      handleDreiWortChaosFinishVoting,
      handleDreiWortChaosNextRound,
      handleConspiracyCornerStartReveal,
      handleConspiracyCornerStartVoting,
      handleConspiracyCornerFinishVoting,
      handleConspiracyCornerNextRound,
      handleWerbungFuerMuellStartReveal,
      handleWerbungFuerMuellStartVoting,
      handleWerbungFuerMuellFinishVoting,
      handleWerbungFuerMuellNextRound,
      handleAutocompleteChaosStartReveal,
      handleAutocompleteChaosStartVoting,
      handleAutocompleteChaosFinishVoting,
      handleAutocompleteChaosNextRound,
      AUTOCOMPLETE_CHAOS_ROUNDS,
      handleDuellReady,
      handleDuellStart,
      handleDuellComplete,
      handleDuellSubmitAnswer,
      handleDuellGameComplete,
      handleDuellSpectatorSubmit
    }
  }
}
</script>

<style scoped>
.ai-background {
  background: linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #1a1a3a 100%);
}

.background-image {
  position: fixed;
  inset: 0;
  background-image: url('@/assets/games/ai-takes-over/background/Background_Lobby.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.4;
  z-index: 0;
}

.scanlines-overlay {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 1;
}

.cyber-back-button {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  transition: all 0.3s;
}

.cyber-back-button:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.glitch-title {
  animation: glitch-title 4s infinite;
  text-shadow:
    0 0 10px rgba(0, 255, 255, 0.8),
    0 0 20px rgba(0, 255, 255, 0.4),
    0 0 40px rgba(0, 255, 255, 0.2);
}

@keyframes glitch-title {
  0%, 85%, 100% {
    transform: translate(0);
    text-shadow:
      0 0 10px rgba(0, 255, 255, 0.8),
      0 0 20px rgba(0, 255, 255, 0.4),
      0 0 40px rgba(0, 255, 255, 0.2),
      2px 0 #ff00ff,
      -2px 0 #00ffff;
  }
  87% {
    transform: translate(-3px, 1px);
    text-shadow:
      0 0 10px rgba(0, 255, 255, 0.8),
      0 0 20px rgba(0, 255, 255, 0.4),
      0 0 40px rgba(0, 255, 255, 0.2),
      5px 0 #ff00ff,
      -5px 0 #00ffff;
  }
  89% {
    transform: translate(3px, -1px);
    text-shadow:
      0 0 10px rgba(0, 255, 255, 0.8),
      0 0 20px rgba(0, 255, 255, 0.4),
      0 0 40px rgba(0, 255, 255, 0.2),
      -3px 0 #ff00ff,
      3px 0 #00ffff;
  }
  91% {
    transform: translate(-2px, 2px);
    text-shadow:
      0 0 10px rgba(0, 255, 255, 0.8),
      0 0 20px rgba(0, 255, 255, 0.4),
      0 0 40px rgba(0, 255, 255, 0.2),
      4px 0 #ff00ff,
      -4px 0 #00ffff;
  }
}
</style>
