import { createRouter, createWebHashHistory } from 'vue-router'

// Shared views
import Login from '../views/Login.vue'
import GameSelection from '../views/GameSelection.vue'
import PlayerSetup from '../views/PlayerSetup.vue'

// Top 10 views
import Gallery from '../games/top10/views/Gallery.vue'
import EditDeck from '../games/top10/views/EditDeck.vue'
import PlayDeck from '../games/top10/views/PlayDeck.vue'

// Hacke Dicht views
import HackeDichtGallery from '../games/hacke-dicht/views/HackeDichtGallery.vue'
import HackeDichtEditor from '../games/hacke-dicht/views/HackeDichtEditor.vue'
import HackeDichtPlay from '../games/hacke-dicht/views/HackeDichtPlay.vue'
import HackeDichtPlayMultiplayer from '../games/hacke-dicht/views/HackeDichtPlayMultiplayer.vue'
import HackeDichtPlayerView from '../games/hacke-dicht/views/HackeDichtPlayerView.vue'

// AI Takes Over views
import AiTakesOverPlayMultiplayer from '../games/ai-takes-over/views/AiTakesOverPlayMultiplayer.vue'
import AiTakesOverPlayerView from '../games/ai-takes-over/views/AiTakesOverPlayerView.vue'


const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/games',
    name: 'GameSelection',
    component: GameSelection
  },
  {
    path: '/player-setup',
    name: 'PlayerSetup',
    component: PlayerSetup
  },
  // Top 10 Routes
  {
    path: '/top10/gallery',
    name: 'Gallery',
    component: Gallery
  },
  {
    path: '/top10/edit/:deckId',
    name: 'EditDeck',
    component: EditDeck,
    props: true
  },
  {
    path: '/top10/play/:deckId',
    name: 'PlayDeck',
    component: PlayDeck,
    props: true
  },
  // Wer wird hacke dicht Routes
  {
    path: '/hacke-dicht/gallery',
    name: 'HackeDichtGallery',
    component: HackeDichtGallery
  },
  {
    path: '/hacke-dicht/editor',
    name: 'HackeDichtEditor',
    component: HackeDichtEditor
  },
  {
    path: '/hacke-dicht/editor/:gameId',
    name: 'HackeDichtEditorEdit',
    component: HackeDichtEditor,
    props: true
  },
  {
    path: '/hacke-dicht/play/:gameId',
    name: 'HackeDichtPlay',
    component: HackeDichtPlay,
    props: true
  },
  // Hacke Dicht Multiplayer Routes
  {
    path: '/hacke-dicht/play-multiplayer/:gameId',
    name: 'HackeDichtPlayMultiplayer',
    component: HackeDichtPlayMultiplayer,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/play-mobile/:lobbyCode',
    name: 'HackeDichtPlayerView',
    component: HackeDichtPlayerView,
    props: true,
    meta: { requiresAuth: false }
  },

  // AI Takes Over Routes
  {
    path: '/ai-takes-over',
    name: 'AiTakesOverLobby',
    component: AiTakesOverPlayMultiplayer,
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-takes-over/play/:lobbyCode',
    name: 'AiTakesOverPlayerView',
    component: AiTakesOverPlayerView,
    props: true,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true'

  // Allow mobile player route without authentication
  if (to.name === 'HackeDichtPlayerView') {
    next()
    return
  }

  if (to.name !== 'Login' && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'GameSelection' })
  } else {
    next()
  }
})

export default router
