# CLAUDE.md

Development guidelines for the PoTENt web game platform.

## Commands

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build

## Tech Stack

- **Vue 3** - Composition API
- **Vue Router** - Hash-based routing
- **Firebase** - Realtime Database for multiplayer
- **TailwindCSS** - Utility-first styling
- **Vite** - Build tooling

## Project Structure

```
src/
├── assets/
│   ├── games/
│   │   ├── ai-takes-over/      # AI Takes Over assets
│   │   │   ├── background/
│   │   │   ├── characters/     # 18 pixel art AI characters
│   │   │   └── audio/
│   │   ├── hacke-dicht/        # Hacke Dicht assets
│   │   │   ├── characters/     # 15 human characters
│   │   │   ├── audio/          # Quiz soundtracks
│   │   │   └── jokers/         # Joker images
│   │   └── top10/              # Top 10 assets
│   └── shared/                 # Shared assets (logos, icons)
├── games/
│   ├── ai-takes-over/          # AI Takes Over game
│   ├── hacke-dicht/            # Hacke Dicht (quiz) game
│   └── top10/                  # Top 10 game
├── shared/
│   ├── components/             # Shared UI components
│   ├── composables/            # Shared Vue composables
│   ├── store/                  # Shared state management
│   └── styles/
│       ├── themes/             # Game-specific themes
│       │   └── cyberpunk.css   # AI Takes Over theme
│       └── variables.css       # Shared CSS variables
└── views/                      # Main app views (Login, GameSelection)
```

## Games Overview

### AI Takes Over (Main Focus)
**Type**: Multiplayer-only AI personality quiz game
**Status**: Active development

**Architecture**:
- **No editor** - Uses fixed disciplines system (5 categories)
- **No store** - Questions generated dynamically, no localStorage persistence
- **Lobby-first** - Goes directly to multiplayer lobby on launch
- **Fixed structure**: 15 questions across 5 disciplines (Logik, Wissen, Schnelligkeit, Kreativität, Teamwork)

**Key Components**:
- `BobIntroSequence.vue` - Opening cinematic with Bob (AI host)
- `AiTakesOverPlayMultiplayer.vue` - Main game view (lobby + gameplay)
- `AiTakesOverPlayerView.vue` - Mobile player join flow
- Mobile flow: Code Input → Hacking Sequence → Character Select → Waiting → Playing

**Theme**: Cyberpunk/Terminal aesthetic with cyan/pink neon colors

### Hacke Dicht
**Type**: Quiz game (single + multiplayer)
**Architecture**: Gallery → Editor → Play
**Store**: `hackeDichtStore.js` - Manages quiz templates in localStorage
**Features**: 15 questions, 3 jokers, rewards system

### Top 10
**Type**: Single-player card game
**Store**: `gameStore.js` - Manages card decks

## Coding Guidelines

### Import Patterns
**Always use absolute imports with `@/` alias:**
```javascript
// ✅ Good
import Component from '@/games/ai-takes-over/components/atoms/Component.vue'
import { useLobby } from '@/shared/composables/useLobby'

// ❌ Bad
import Component from '../atoms/Component.vue'
import { useLobby } from '../../shared/composables/useLobby'
```

### Component Architecture (Atomic Design)

**AI Takes Over follows Atomic Design Pattern:**

```
components/
├── atoms/              # Basic building blocks (15-30 lines)
│   ├── LoadingSpinner.vue
│   ├── BlinkingCursor.vue
│   ├── CyberButton.vue
│   ├── CyberInput.vue
│   ├── StatusBadge.vue
│   └── CharacterAvatar.vue
├── molecules/          # Simple combinations (30-80 lines)
│   ├── TerminalBox.vue
│   ├── MessageBox.vue
│   ├── InfoLine.vue
│   ├── ProgressBar.vue
│   └── CyberFrame.vue
├── organisms/          # Complex features (80-150 lines)
│   ├── MatrixRainBackground.vue
│   ├── TypewriterText.vue
│   └── PhaseContainer.vue
├── lobby/              # Lobby-specific components
├── mobile/             # Mobile player flow components
└── game/               # Game phase components
```

**When creating new components:**
1. **Start with atoms** - Reusable, single-purpose UI elements
2. **Combine into molecules** - Groups of atoms working together
3. **Build organisms** - Complex features with business logic
4. **Use existing components** - Check atoms/molecules before creating new ones

**Example: Creating a new input field**
```vue
<!-- ✅ Good: Use existing CyberInput atom -->
<CyberInput v-model="value" prompt=">" placeholder="Enter..." />

<!-- ❌ Bad: Duplicate input styling -->
<input class="ai-terminal-input" ... />
```

### CSS & Styling

**Prefer utility classes from cyberpunk.css:**
```vue
<!-- ✅ Good: Use theme utilities -->
<div class="ai-terminal">
  <div class="ai-terminal-header">...</div>
  <div class="ai-terminal-body">...</div>
</div>

<!-- ❌ Bad: Duplicate CSS -->
<div style="background: rgba(0,0,0,0.8); border: 1px solid cyan;">
  ...
</div>
```

**Available utility classes:**
- `.ai-btn` - Cyberpunk button with glow effect
- `.ai-terminal` / `.ai-terminal-header` / `.ai-terminal-body` - Terminal UI
- `.ai-card` - Card with scanlines and glow
- `.ai-corner` - Corner decorations (with .ai-corner-tl, -tr, -bl, -br)
- `.ai-scanlines` - Scanline overlay effect
- `.ai-loading-spinner` - Animated loading spinner
- `.ai-cursor` - Blinking cursor animation
- `.ai-glitch` - Glitch text effect
- `.ai-float` / `.ai-pulse` / `.ai-pulse-dot` - Animations
- `.ai-message-box` / `.ai-info-line` / `.ai-status-badge` - UI patterns
- `.ai-progress-container` / `.ai-progress-bar` - Progress indicators
- `.ai-error-box` - Error message display

**CSS Variables:**
```css
/* Colors */
--ai-cyan, --ai-cyan-rgb, --ai-pink, --ai-pink-rgb
--ai-bg-dark, --ai-bg-medium, --ai-bg-light

/* Effects */
--ai-border, --ai-shadow-glow, --ai-text-glow

/* Transitions (use shared vars) */
--ai-transition-fast, --ai-transition-normal, --ai-transition-slow
```

**When to extract CSS:**
- ✅ Used 3+ times → Extract to cyberpunk.css
- ✅ Common UI pattern → Create utility class
- ❌ Component-specific logic → Keep scoped
- ❌ One-off styling → Keep scoped

### i18n (Internationalization)

**All text must use i18n:**
```javascript
import { useI18n } from '@/games/ai-takes-over/composables/useI18n'

const { t, randomMessage } = useI18n()

// Static text
const title = t('mobile.codeInput.title')

// Random selection
const message = randomMessage('bob.lobbyMessages')

// With parameters
const error = t('toasts.errors.connection', { message: err.message })
```

**Language files:** `/src/games/ai-takes-over/i18n/de.js`

### Assets
**Use organized asset paths:**
```javascript
// Game-specific
import char from '@/assets/games/ai-takes-over/characters/Character1.png'
import audio from '@/assets/games/hacke-dicht/audio/sound.mp3'

// Shared
import logo from '@/assets/shared/PoTENtLogo.png'

// Dynamic imports
const modules = import.meta.glob('@/assets/games/ai-takes-over/characters/*.png', { eager: true })
```

### Component Reuse
- **Atoms/Molecules** - Reuse within AI Takes Over
- **Hacke Dicht** - Can import from `@/games/hacke-dicht/components/` when needed
- **Shared** - Universal components go in `/src/shared/components/`

## Firebase Multiplayer

**Lobby Structure**:
```javascript
lobbies/{lobbyCode}/
  ├── code: string           // 6-char uppercase
  ├── gameId: string         // 'ai-takes-over' or game ID
  ├── hostId: string
  ├── status: 'waiting' | 'playing' | 'finished'
  ├── players/{playerId}/
  │   ├── name: string
  │   ├── icon: string
  │   ├── iconIndex: number
  │   └── isOnline: boolean
  ├── gameState/
  │   ├── phase: string
  │   ├── currentQuestionIndex: number
  │   └── jokers/...
  └── votes/{questionIndex}/{playerId}/
      └── answer: number
```

**Key Composables**:
- `useLobby()` - Lobby management (create, join, leave)
- `useAudio()` - Background music and sound effects

## Authentication

Simple localStorage-based:
```javascript
localStorage.setItem('authenticated', 'true')
```

Mobile player routes (`/ai-takes-over/play/:lobbyCode`) bypass auth.

## Common Issues

### Build Warnings
Large chunk warnings are expected due to audio files. Not critical.

### Asset Loading
Use `import.meta.glob()` for dynamic image imports:
```javascript
const modules = import.meta.glob('@/assets/games/ai-takes-over/characters/*.png', { eager: true })
```

### Console Logs
Remove debug console.logs before committing (especially emoji-based ones like `console.log('🤖 ...')`).

## Development Tips

- AI Takes Over has NO gallery/editor - goes straight to multiplayer lobby
- Character selection happens during mobile player join flow
- Use Bob intro sequence at game start for cinematic effect
- Keep toast notifications themed (use AI-style messages for AI Takes Over)
