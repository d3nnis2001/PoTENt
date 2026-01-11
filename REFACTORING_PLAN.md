# 📋 Refactoring Plan: View Files

## 🎯 Ziel
**AiTakesOverPlayMultiplayer.vue**: 997 Zeilen → ~300 Zeilen (-70%)
**AiTakesOverPlayerView.vue**: 582 Zeilen → ~200 Zeilen (-65%)

---

## 📊 Aktuelle Struktur-Analyse

### AiTakesOverPlayMultiplayer.vue (997 Zeilen)
```
TEMPLATE: ~200 Zeilen
SCRIPT SETUP:
  - Imports: ~40 Zeilen
  - State/Refs: ~50 Zeilen
  - Computed (6 Disciplines): ~60 Zeilen
  - Timer Logic: ~30 Zeilen
  - Lifecycle Hooks: ~20 Zeilen
  - Game Start Logic: ~50 Zeilen
  - Bildertitel Handlers (5): ~40 Zeilen
  - DreiWortChaos Handlers (5): ~40 Zeilen
  - AutocompleteChaos Handlers (5): ~40 Zeilen
  - ConspiracyCorner Handlers (5): ~40 Zeilen
  - WerbungFuerMuell Handlers (5): ~40 Zeilen
  - Duell Handlers (4): ~60 Zeilen
  - Navigation/Utility: ~30 Zeilen
  - Return Statement: ~100 Zeilen
STYLES: ~250 Zeilen
```

### AiTakesOverPlayerView.vue (582 Zeilen)
```
TEMPLATE: ~130 Zeilen
SCRIPT SETUP:
  - Imports: ~30 Zeilen
  - State/Refs: ~40 Zeilen
  - Computed (6 Disciplines): ~100 Zeilen
  - Connection Handlers: ~50 Zeilen
  - Bildertitel Handlers (2): ~20 Zeilen
  - DreiWortChaos Handlers (2): ~20 Zeilen
  - AutocompleteChaos Handlers (2): ~20 Zeilen
  - ConspiracyCorner Handlers (2): ~20 Zeilen
  - WerbungFuerMuell Handlers (2): ~20 Zeilen
  - Leave Lobby: ~20 Zeilen
  - Return Statement: ~80 Zeilen
STYLES: ~150 Zeilen
```

---

## 🔧 Refactoring Strategy

### Phase 1: Composables Erstellen

#### 1.1 **useGameTimer.js** (~50 Zeilen)
**Zweck:** Wiederverwendbare Timer-Logic
```javascript
export function useGameTimer() {
  const timeRemaining = ref(0)
  const isTimerActive = ref(false)

  const startTimer = (seconds) => { /* ... */ }
  const stopTimer = () => { /* ... */ }
  const onTimerEnd = (callback) => { /* ... */ }

  return { timeRemaining, isTimerActive, startTimer, stopTimer, onTimerEnd }
}
```
**Extrahiert aus:**
- AiTakesOverPlayMultiplayer.vue: startTimer, stopTimer, handleTimerEnd (~30 Zeilen)

---

#### 1.2 **useDisciplineHost.js** (~100 Zeilen pro Discipline = 500 Zeilen total)
**Zweck:** Host-Handler für eine Discipline
```javascript
export function useDisciplineHost(disciplineName, store, lobbyStore, config) {
  const state = computed(() => store.getState(lobbyStore))
  const submissionCount = computed(() => store.getSubmissionCount(lobbyStore))
  const submissions = computed(() => store.getSubmissions(lobbyStore))
  const allSubmitted = computed(() => submissionCount.value >= playerCount)

  const handleStartReveal = async () => { /* ... */ }
  const handleStartVoting = async () => { /* ... */ }
  const handleFinishVoting = async () => { /* ... */ }
  const handleNextRound = async () => { /* ... */ }

  return {
    state,
    submissionCount,
    submissions,
    allSubmitted,
    handleStartReveal,
    handleStartVoting,
    handleFinishVoting,
    handleNextRound
  }
}
```
**Wird verwendet für:**
- Bildertitel
- DreiWortChaos
- AutocompleteChaos
- ConspiracyCorner
- WerbungFuerMuell

**Extrahiert aus AiTakesOverPlayMultiplayer.vue:**
- ~60 Zeilen Computed
- ~200 Zeilen Handler (5 disciplines × ~40 Zeilen)
- **Total: ~260 Zeilen** → Reduziert auf ~50 Zeilen durch Composable-Calls

---

#### 1.3 **useDisciplinePlayer.js** (~50 Zeilen pro Discipline = 250 Zeilen total)
**Zweck:** Player-Handler für eine Discipline
```javascript
export function useDisciplinePlayer(disciplineName, store, lobbyStore, toast) {
  const state = computed(() => store.getState(lobbyStore))
  const voteOptions = computed(() => store.getSubmissions(lobbyStore))
  const playerScore = computed(() => {
    const playerId = lobbyStore.currentPlayer?.id
    return state.value?.scores?.[playerId] || 0
  })

  const handleSubmit = async (data) => {
    try {
      await store.submitAnswer(lobbyStore, data)
      toast.success('Eingereicht!')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleVote = async (votedFor) => {
    try {
      await store.submitVote(lobbyStore, votedFor)
      toast.success('Vote abgegeben!')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return {
    state,
    voteOptions,
    playerScore,
    handleSubmit,
    handleVote
  }
}
```

**Extrahiert aus AiTakesOverPlayerView.vue:**
- ~100 Zeilen Computed
- ~100 Zeilen Handler (5 disciplines × ~20 Zeilen)
- **Total: ~200 Zeilen** → Reduziert auf ~30 Zeilen durch Composable-Calls

---

#### 1.4 **useDuellSystem.js** (~80 Zeilen)
**Zweck:** Duell-spezifische Logic
```javascript
export function useDuellSystem(lobbyStore, duellStore, toast) {
  const duellState = computed(() => duellStore.getState(lobbyStore))
  const isInDuell = computed(() => duellStore.isCurrentPlayerInDuell(lobbyStore))
  const isDuellA = computed(() => duellStore.isCurrentPlayerDuellA(lobbyStore))

  const triggerDuell = async (nextDiscipline) => { /* ... */ }
  const handleDuellReady = async (data) => { /* ... */ }
  const handleDuellStart = async () => { /* ... */ }
  const handleDuellComplete = async () => { /* ... */ }

  return {
    duellState,
    isInDuell,
    isDuellA,
    triggerDuell,
    handleDuellReady,
    handleDuellStart,
    handleDuellComplete
  }
}
```

**Extrahiert aus AiTakesOverPlayMultiplayer.vue:**
- ~20 Zeilen Computed
- ~60 Zeilen Handler
- **Total: ~80 Zeilen** → Reduziert auf ~15 Zeilen

---

### Phase 2: View Refactoring

#### 2.1 **AiTakesOverPlayMultiplayer.vue** (997 → ~300 Zeilen)

**VORHER:**
```vue
<script setup>
// 40 Zeilen Imports
// 50 Zeilen State
// 60 Zeilen Computed (6 Disciplines)
// 30 Zeilen Timer Logic
// 260 Zeilen Handler (6 Disciplines)
// 100 Zeilen Return
</script>
```

**NACHHER:**
```vue
<script setup>
// 25 Zeilen Imports (inkl. Composables)
// 30 Zeilen State (reduziert)
// Timer Composable
const { timeRemaining, startTimer, stopTimer, onTimerEnd } = useGameTimer()

// Discipline Composables (5 Zeilen pro Discipline = 25 Zeilen)
const bildertitel = useDisciplineHost('bildertitel', bildertitelStore, lobbyStore, BILDERTITEL_CONFIG)
const dreiWortChaos = useDisciplineHost('dreiWortChaos', dreiWortChaosStore, lobbyStore, DREI_WORT_CHAOS_CONFIG)
// ... etc

// Duell Composable
const duell = useDuellSystem(lobbyStore, duellStore, toast)

// Game Flow Logic (~80 Zeilen)
// Return Statement (~50 Zeilen - reduziert durch Composables)
</script>
```

**Einsparung: ~700 Zeilen**

---

#### 2.2 **AiTakesOverPlayerView.vue** (582 → ~200 Zeilen)

**VORHER:**
```vue
<script setup>
// 30 Zeilen Imports
// 40 Zeilen State
// 100 Zeilen Computed (6 Disciplines)
// 100 Zeilen Handler (6 Disciplines)
// 80 Zeilen Return
</script>
```

**NACHHER:**
```vue
<script setup>
// 20 Zeilen Imports (inkl. Composables)
// 30 Zeilen State (reduziert)

// Discipline Composables (3 Zeilen pro Discipline = 15 Zeilen)
const bildertitel = useDisciplinePlayer('bildertitel', bildertitelStore, lobbyStore, toast)
const dreiWortChaos = useDisciplinePlayer('dreiWortChaos', dreiWortChaosStore, lobbyStore, toast)
// ... etc

// Connection Logic (~50 Zeilen)
// Return Statement (~40 Zeilen - reduziert)
</script>
```

**Einsparung: ~380 Zeilen**

---

## 📁 Neue Dateistruktur

```
src/games/ai-takes-over/
├── composables/
│   ├── useGameTimer.js          (NEU - 50 Zeilen)
│   ├── useDisciplineHost.js     (NEU - 100 Zeilen)
│   ├── useDisciplinePlayer.js   (NEU - 50 Zeilen)
│   └── useDuellSystem.js        (NEU - 80 Zeilen)
└── views/
    ├── AiTakesOverPlayMultiplayer.vue  (997 → 300 Zeilen)
    └── AiTakesOverPlayerView.vue       (582 → 200 Zeilen)
```

**Total neue Zeilen:** ~280 Zeilen (Composables)
**Total entfernte Zeilen:** ~1080 Zeilen (Views)
**Netto-Einsparung:** ~800 Zeilen (-50%!)

---

## 🎯 Vorteile

### ✅ Code Quality
- **DRY:** Keine duplizierten Handler mehr
- **Separation of Concerns:** Logic getrennt von View
- **Testability:** Composables sind einfach zu testen

### ✅ Maintainability
- **Übersichtlichkeit:** Views sind fokussiert auf UI-Logic
- **Wiederverwendbarkeit:** Composables können in anderen Views genutzt werden
- **Konsistenz:** Alle Disciplines folgen demselben Pattern

### ✅ Performance
- Keine Performance-Änderung (gleiche Logic, nur anders organisiert)

---

## 📝 Implementation Steps

1. ✅ **Phase 1.1**: Create `useGameTimer.js`
2. ✅ **Phase 1.2**: Create `useDisciplineHost.js`
3. ✅ **Phase 1.3**: Create `useDisciplinePlayer.js`
4. ✅ **Phase 1.4**: Create `useDuellSystem.js`
5. ✅ **Phase 2.1**: Refactor `AiTakesOverPlayMultiplayer.vue`
6. ✅ **Phase 2.2**: Refactor `AiTakesOverPlayerView.vue`
7. ✅ **Test & Build**

---

## ⚠️ Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking existing functionality | Test nach jedem Composable |
| Over-abstraction | Composables bleiben focused und simple |
| State synchronization issues | Composables nutzen dieselben Stores |

---

## 🧪 Testing Strategy

1. **Nach jedem Composable:** Build testen
2. **Nach View Refactoring:** Full E2E Test durchspielen
3. **Alle Disciplines testen:** Sicherstellen dass nichts kaputt ist

---

**Geschätzte Zeit:** ~2-3 Stunden
**ROI:** Sehr hoch - Code wird 50% kleiner und viel wartbarer
