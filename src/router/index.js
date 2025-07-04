import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import GameSelection from '../views/GameSelection.vue'
import Gallery from '../views/Gallery.vue'
import EditDeck from '../views/EditDeck.vue'
import PlayDeck from '../views/PlayDeck.vue'
import HackeDichtGallery from '../views/HackeDichtGallery.vue'
import HackeDichtEditor from '../views/HackeDichtEditor.vue'
import HackeDichtPlay from '../views/HackeDichtPlay.vue'
import HackeDichtPlayMultiplayer from '../views/HackeDichtPlayMultiplayer.vue'
import HackeDichtPlayerView from '../views/HackeDichtPlayerView.vue'
import AiTakesOverGallery from '../views/AiTakesOverGallery.vue'
import AiTakesOverEditor from '../views/AiTakesOverEditor.vue'
import AiTakesOverPlay from '../views/AiTakesOverPlay.vue'
import AiTakesOverPlayMultiplayer from '../views/AiTakesOverPlayMultiplayer.vue'
import AiTakesOverPlayerView from '../views/AiTakesOverPlayerView.vue'


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
  // Multiplayer Routes
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
    path: '/ai-takes-over/gallery',
    name: 'AiTakesOverGallery',
    component: AiTakesOverGallery
  },
  {
    path: '/ai-takes-over/editor',
    name: 'AiTakesOverEditor',
    component: AiTakesOverEditor
  },
  {
    path: '/ai-takes-over/editor/:gameId',
    name: 'AiTakesOverEditorEdit',
    component: AiTakesOverEditor,
    props: true
  },
  {
    path: '/ai-takes-over/play/:gameId',
    name: 'AiTakesOverPlay',
    component: AiTakesOverPlay,
    props: true
  },
  // AI Takes Over Multiplayer Routes
  {
    path: '/ai-takes-over/play-multiplayer/:gameId',
    name: 'AiTakesOverPlayMultiplayer',
    component: AiTakesOverPlayMultiplayer,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/play-mobile-ai/:lobbyCode',
    name: 'AiTakesOverPlayerView',
    component: AiTakesOverPlayerView,
    props: true,
    meta: { requiresAuth: false }
  },
  // Legacy redirects
  {
    path: '/gallery',
    redirect: '/top10/gallery'
  },
  {
    path: '/edit/:deckId',
    redirect: to => `/top10/edit/${to.params.deckId}`
  },
  {
    path: '/play/:deckId',
    redirect: to => `/top10/play/${to.params.deckId}`
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