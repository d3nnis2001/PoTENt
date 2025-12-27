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
          v-else-if="currentLobby && currentLobby.status === 'playing' && currentDiscipline === 'duell'"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLobby } from '@/shared/composables/useLobby'
import { lobbyStore } from '@/games/hacke-dicht/store/lobbyStore'
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
  MINI_DISCIPLINES,
  getNextDiscipline,
  hasMoreDisciplines
} from '@/games/ai-takes-over/config/gameConfig'
import { getRandomTopics } from '@/games/ai-takes-over/data/conspiracyCornerTopics'
import { getRandomProducts } from '@/games/ai-takes-over/data/werbungFuerMuellProducts'
import { DUELL_GAMES, DUELL_CONFIG, selectDuellPlayers, getRandomDuellGame } from '@/games/ai-takes-over/config/duellConfig'

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
    const timeRemaining = ref(60)
    const allImages = ref(getBildertitelImages())
    const duellIntroRef = ref(null)
    const pendingNextDiscipline = ref(null) // Store next discipline after duell
    let timerInterval = null

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

    // Bildertitel computed
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
      return lobbyStore.getBildertitelSubmissionCount()
    })

    const bildertitelAllSubmitted = computed(() => {
      return bildertitelSubmissionCount.value >= playerCount.value
    })

    const titlesForCurrentImage = computed(() => {
      if (!currentImage.value) return []
      return lobbyStore.getTitlesForImage(currentImage.value.id)
    })

    // 3-Wort-Chaos computed
    const dreiWortChaosState = computed(() => {
      return currentLobby.value?.gameState?.dreiWortChaos || null
    })

    const dreiWortChaosSubmissionCount = computed(() => {
      return lobbyStore.getDreiWortChaosSubmissionCount()
    })

    const dreiWortChaosAllSubmitted = computed(() => {
      return dreiWortChaosSubmissionCount.value >= playerCount.value
    })

    const dreiWortChaosSubmissions = computed(() => {
      return lobbyStore.getDreiWortChaosSubmissions()
    })

    // ===== CONSPIRACY CORNER COMPUTED =====
    const conspiracyCornerState = computed(() => {
      return currentLobby.value?.gameState?.conspiracyCorner || null
    })

    const conspiracyCornerSubmissionCount = computed(() => {
      return lobbyStore.getConspiracyCornerSubmissionCount()
    })

    const conspiracyCornerAllSubmitted = computed(() => {
      return conspiracyCornerSubmissionCount.value >= playerCount.value
    })

    const conspiracyCornerSubmissions = computed(() => {
      return lobbyStore.getConspiracyCornerSubmissions()
    })

    // ===== WERBUNG FÜR MÜLL COMPUTED =====
    const werbungFuerMuellState = computed(() => {
      return currentLobby.value?.gameState?.werbungFuerMuell || null
    })

    const werbungFuerMuellSubmissionCount = computed(() => {
      return lobbyStore.getWerbungFuerMuellSubmissionCount()
    })

    const werbungFuerMuellAllSubmitted = computed(() => {
      return werbungFuerMuellSubmissionCount.value >= playerCount.value
    })

    const werbungFuerMuellSubmissions = computed(() => {
      return lobbyStore.getWerbungFuerMuellSubmissions()
    })

    // ===== AUTOCOMPLETE CHAOS COMPUTED =====
    const autocompleteChaosState = computed(() => {
      return currentLobby.value?.gameState?.autocompleteChaos || null
    })

    const autocompleteChaosSubmissionCount = computed(() => {
      return lobbyStore.getAutocompleteChaosSubmissionCount()
    })

    const autocompleteChaosAllSubmitted = computed(() => {
      return autocompleteChaosSubmissionCount.value >= playerCount.value
    })

    const autocompleteChaosSubmissions = computed(() => {
      return lobbyStore.getAutocompleteChaosSubmissions()
    })

    // ===== DUELL COMPUTED =====
    const duellState = computed(() => {
      return currentLobby.value?.gameState?.duell || null
    })

    // Timer methods
    const startTimer = (seconds) => {
      stopTimer()
      timeRemaining.value = seconds
      timerInterval = setInterval(() => {
        timeRemaining.value--
        if (timeRemaining.value <= 0) {
          stopTimer()
          handleTimerEnd()
        }
      }, 1000)
    }

    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }

    const handleTimerEnd = () => {
      const discipline = currentDiscipline.value

      if (discipline === 'bildertitel') {
        const phase = bildertitelState.value?.phase
        if (phase === 'writing') handleBildertitelStartReveal()
        else if (phase === 'voting') handleBildertitelFinishVoting()
      } else if (discipline === 'dreiWortChaos') {
        const phase = dreiWortChaosState.value?.phase
        if (phase === 'writing') handleDreiWortChaosStartReveal()
        else if (phase === 'voting') handleDreiWortChaosFinishVoting()
      } else if (discipline === 'conspiracyCorner') {
        const phase = conspiracyCornerState.value?.phase
        if (phase === 'writing') handleConspiracyCornerStartReveal()
        else if (phase === 'voting') handleConspiracyCornerFinishVoting()
      } else if (discipline === 'werbungFuerMuell') {
        const phase = werbungFuerMuellState.value?.phase
        if (phase === 'writing') handleWerbungFuerMuellStartReveal()
        else if (phase === 'voting') handleWerbungFuerMuellFinishVoting()
      } else if (discipline === 'autocompleteChaos') {
        const phase = autocompleteChaosState.value?.phase
        if (phase === 'writing') handleAutocompleteChaosStartReveal()
        else if (phase === 'voting') handleAutocompleteChaosFinishVoting()
      }
    }

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

        // Initialize Bildertitel as first discipline
        const playersData = playerList.value.map(p => ({ id: p.id, name: p.name, icon: p.icon }))
        const roundImages = getImagesForRound(playersData.length, 0, allImages.value)
        const assignments = assignPlayersToImages(playersData, roundImages)

        await lobbyStore.initializeBildertitel(roundImages, assignments)
        startTimer(BILDERTITEL_CONFIG.writeTime)

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
      await lobbyStore.updateBildertitelPhase('reveal')
    }

    const handleBildertitelStartVoting = async () => {
      await lobbyStore.updateBildertitelPhase('voting')
      startTimer(BILDERTITEL_CONFIG.voteTime)
    }

    const handleBildertitelFinishVoting = async () => {
      stopTimer()
      const roundImages = bildertitelState.value?.roundImages || []
      const currentIndex = bildertitelState.value?.currentRevealIndex || 0

      if (currentIndex < roundImages.length - 1) {
        await lobbyStore.nextBildertitelImage()
      } else {
        await lobbyStore.calculateBildertitelScores()
        await lobbyStore.updateBildertitelPhase('results')
      }
    }

    const handleBildertitelNextRound = async () => {
      const currentRound = bildertitelState.value?.currentRound || 0

      if (currentRound < BILDERTITEL_ROUNDS - 1) {
        const playersData = playerList.value.map(p => ({ id: p.id, name: p.name, icon: p.icon }))
        const roundImages = getImagesForRound(playersData.length, currentRound + 1, allImages.value)
        const assignments = assignPlayersToImages(playersData, roundImages)

        await lobbyStore.nextBildertitelRound(roundImages, assignments)
        startTimer(BILDERTITEL_CONFIG.writeTime)
      } else {
        // Bildertitel finished - start 3-Wort-Chaos
        await lobbyStore.finishBildertitel()
        await startDreiWortChaos()
      }
    }

    // ===== 3-WORT-CHAOS HANDLERS =====
    const startDreiWortChaos = async () => {
      const prompts = getRandomPrompts(DREI_WORT_CHAOS_CONFIG.rounds)
      await lobbyStore.initializeDreiWortChaos(prompts)
      startTimer(DREI_WORT_CHAOS_CONFIG.writeTime)
    }

    const handleDreiWortChaosStartReveal = async () => {
      stopTimer()
      await lobbyStore.updateDreiWortChaosPhase('reveal')
    }

    const handleDreiWortChaosStartVoting = async () => {
      await lobbyStore.updateDreiWortChaosPhase('voting')
      startTimer(DREI_WORT_CHAOS_CONFIG.voteTime)
    }

    const handleDreiWortChaosFinishVoting = async () => {
      stopTimer()
      await lobbyStore.calculateDreiWortChaosScores()
      await lobbyStore.updateDreiWortChaosPhase('results')
    }

    const handleDreiWortChaosNextRound = async () => {
      const hasMore = await lobbyStore.nextDreiWortChaosRound()
      if (hasMore) {
        startTimer(DREI_WORT_CHAOS_CONFIG.writeTime)
      } else {
        // 3-Wort-Chaos finished - trigger DUELL before Autocomplete Chaos
        await lobbyStore.finishDreiWortChaos()
        await triggerDuell('autocompleteChaos')
      }
    }

    // ===== AUTOCOMPLETE CHAOS HANDLERS =====
    const startAutocompleteChaos = async () => {
      const prompts = getAutocompletePrompts(AUTOCOMPLETE_CHAOS_CONFIG.rounds)
      await lobbyStore.initializeAutocompleteChaos(prompts)
      startTimer(AUTOCOMPLETE_CHAOS_CONFIG.writeTime)
    }

    const handleAutocompleteChaosStartReveal = async () => {
      stopTimer()
      await lobbyStore.updateAutocompleteChaosPhase('reveal')
    }

    const handleAutocompleteChaosStartVoting = async () => {
      await lobbyStore.updateAutocompleteChaosPhase('voting')
      startTimer(AUTOCOMPLETE_CHAOS_CONFIG.voteTime)
    }

    const handleAutocompleteChaosFinishVoting = async () => {
      stopTimer()
      await lobbyStore.calculateAutocompleteChaosScores()
      await lobbyStore.updateAutocompleteChaosPhase('results')
    }

    const handleAutocompleteChaosNextRound = async () => {
      const hasMore = await lobbyStore.nextAutocompleteChaosRound()
      if (hasMore) {
        startTimer(AUTOCOMPLETE_CHAOS_CONFIG.writeTime)
      } else {
        // Autocomplete Chaos finished - start Conspiracy Corner
        await lobbyStore.finishAutocompleteChaos()
        await startConspiracyCorner()
      }
    }

    // ===== CONSPIRACY CORNER HANDLERS =====
    const startConspiracyCorner = async () => {
      const topics = getRandomTopics(CONSPIRACY_CORNER_CONFIG.rounds)
      await lobbyStore.initializeConspiracyCorner(topics)
      startTimer(CONSPIRACY_CORNER_CONFIG.writeTime)
    }

    const handleConspiracyCornerStartReveal = async () => {
      stopTimer()
      await lobbyStore.updateConspiracyCornerPhase('reveal')
    }

    const handleConspiracyCornerStartVoting = async () => {
      await lobbyStore.updateConspiracyCornerPhase('voting')
      startTimer(CONSPIRACY_CORNER_CONFIG.voteTime)
    }

    const handleConspiracyCornerFinishVoting = async () => {
      stopTimer()
      await lobbyStore.calculateConspiracyCornerScores()
      await lobbyStore.updateConspiracyCornerPhase('results')
    }

    const handleConspiracyCornerNextRound = async () => {
      const hasMore = await lobbyStore.nextConspiracyCornerRound()
      if (hasMore) {
        startTimer(CONSPIRACY_CORNER_CONFIG.writeTime)
      } else {
        // Conspiracy Corner finished - trigger DUELL before Werbung für Müll
        await lobbyStore.finishConspiracyCorner()
        await triggerDuell('werbungFuerMuell')
      }
    }

    // ===== WERBUNG FÜR MÜLL HANDLERS =====
    const startWerbungFuerMuell = async () => {
      const products = getRandomProducts(WERBUNG_FUER_MUELL_CONFIG.rounds)
      await lobbyStore.initializeWerbungFuerMuell(products)
      startTimer(WERBUNG_FUER_MUELL_CONFIG.writeTime)
    }

    const handleWerbungFuerMuellStartReveal = async () => {
      stopTimer()
      await lobbyStore.updateWerbungFuerMuellPhase('reveal')
    }

    const handleWerbungFuerMuellStartVoting = async () => {
      await lobbyStore.updateWerbungFuerMuellPhase('voting')
      startTimer(WERBUNG_FUER_MUELL_CONFIG.voteTime)
    }

    const handleWerbungFuerMuellFinishVoting = async () => {
      stopTimer()
      await lobbyStore.calculateWerbungFuerMuellScores()
      await lobbyStore.updateWerbungFuerMuellPhase('results')
    }

    const handleWerbungFuerMuellNextRound = async () => {
      const hasMore = await lobbyStore.nextWerbungFuerMuellRound()
      if (hasMore) {
        startTimer(WERBUNG_FUER_MUELL_CONFIG.writeTime)
      } else {
        // Werbung für Müll finished - end game
        await lobbyStore.finishWerbungFuerMuell()
        await lobbyStore.finishGame()
      }
    }

    const handleBackToGallery = () => {
      stopTimer()
      router.push('/ai-takes-over/gallery')
    }

    // ===== DUELL HANDLERS =====
    const triggerDuell = async (nextDisciplineAfterDuell) => {
      // Store the next discipline to continue after duell
      pendingNextDiscipline.value = nextDisciplineAfterDuell

      // Select random players and game
      const selectedPlayers = selectDuellPlayers(playerList.value)
      const selectedGame = getRandomDuellGame()

      if (!selectedPlayers) {
        console.error('Not enough players for duell')
        // Skip duell and continue to next discipline
        await startNextDiscipline(nextDisciplineAfterDuell)
        return
      }

      // Initialize duell in Firebase
      await lobbyStore.initializeDuell(
        selectedPlayers.playerA,
        selectedPlayers.playerB,
        selectedGame
      )

      // Start the intro animation
      setTimeout(() => {
        duellIntroRef.value?.start()
      }, 500)
    }

    const handleDuellReady = async (duellData) => {
      // Duell intro is complete, waiting for host to start
      console.log('Duell ready:', duellData)
    }

    const handleDuellStart = async (duellData) => {
      // Update phase to playing
      await lobbyStore.updateDuellPhase('playing')
      // The actual duell game component will be shown based on the game type
      console.log('Duell starting:', duellData)
    }

    const handleDuellComplete = async () => {
      // Finish duell and add winner points
      await lobbyStore.finishDuell(DUELL_CONFIG.winnerPoints)

      // Wait a moment to show results
      setTimeout(async () => {
        // Clear duell and move to next discipline
        const nextDiscipline = pendingNextDiscipline.value
        pendingNextDiscipline.value = null
        await lobbyStore.clearDuell(nextDiscipline)
        await startNextDiscipline(nextDiscipline)
      }, 3000)
    }

    const startNextDiscipline = async (discipline) => {
      switch (discipline) {
        case 'autocompleteChaos':
          await startAutocompleteChaos()
          break
        case 'conspiracyCorner':
          await startConspiracyCorner()
          break
        case 'werbungFuerMuell':
          await startWerbungFuerMuell()
          break
        default:
          // End game if no more disciplines
          await lobbyStore.finishGame()
      }
    }

    // Watch for phase changes
    watch(() => bildertitelState.value?.phase, (newPhase) => {
      if (currentDiscipline.value !== 'bildertitel') return
      if (newPhase === 'writing') startTimer(BILDERTITEL_CONFIG.writeTime)
      else if (newPhase === 'voting') startTimer(BILDERTITEL_CONFIG.voteTime)
    })

    watch(() => dreiWortChaosState.value?.phase, (newPhase) => {
      if (currentDiscipline.value !== 'dreiWortChaos') return
      if (newPhase === 'writing') startTimer(DREI_WORT_CHAOS_CONFIG.writeTime)
      else if (newPhase === 'voting') startTimer(DREI_WORT_CHAOS_CONFIG.voteTime)
    })

    watch(() => conspiracyCornerState.value?.phase, (newPhase) => {
      if (currentDiscipline.value !== 'conspiracyCorner') return
      if (newPhase === 'writing') startTimer(CONSPIRACY_CORNER_CONFIG.writeTime)
      else if (newPhase === 'voting') startTimer(CONSPIRACY_CORNER_CONFIG.voteTime)
    })

    watch(() => werbungFuerMuellState.value?.phase, (newPhase) => {
      if (currentDiscipline.value !== 'werbungFuerMuell') return
      if (newPhase === 'writing') startTimer(WERBUNG_FUER_MUELL_CONFIG.writeTime)
      else if (newPhase === 'voting') startTimer(WERBUNG_FUER_MUELL_CONFIG.voteTime)
    })

    watch(() => autocompleteChaosState.value?.phase, (newPhase) => {
      if (currentDiscipline.value !== 'autocompleteChaos') return
      if (newPhase === 'writing') startTimer(AUTOCOMPLETE_CHAOS_CONFIG.writeTime)
      else if (newPhase === 'voting') startTimer(AUTOCOMPLETE_CHAOS_CONFIG.voteTime)
    })

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
      bildertitelState,
      currentImage,
      bildertitelSubmissionCount,
      bildertitelAllSubmitted,
      titlesForCurrentImage,
      dreiWortChaosState,
      dreiWortChaosSubmissionCount,
      dreiWortChaosAllSubmitted,
      dreiWortChaosSubmissions,
      conspiracyCornerState,
      conspiracyCornerSubmissionCount,
      conspiracyCornerAllSubmitted,
      conspiracyCornerSubmissions,
      werbungFuerMuellState,
      werbungFuerMuellSubmissionCount,
      werbungFuerMuellAllSubmitted,
      werbungFuerMuellSubmissions,
      autocompleteChaosState,
      autocompleteChaosSubmissionCount,
      autocompleteChaosAllSubmitted,
      autocompleteChaosSubmissions,
      duellState,
      duellIntroRef,
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
      handleDuellComplete
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
