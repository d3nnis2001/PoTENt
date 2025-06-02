import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import PlayerSetup from '../views/PlayerSetup.vue'
import GameSelection from '../views/GameSelection.vue'
import Gallery from '../views/Gallery.vue'
import EditDeck from '../views/EditDeck.vue'
import PlayDeck from '../views/PlayDeck.vue'
import HackeDichtGallery from '../views/HackeDichtGallery.vue'
import HackeDichtEditor from '../views/HackeDichtEditor.vue'
import HackeDichtPlay from '../views/HackeDichtPlay.vue'
import JoinLobby from '../views/JoinLobby.vue'
import PlayerLobby from '../views/PlayerLobby.vue'
import HackeDichtLobby from '../views/HackeDichtLobby.vue'
import HackeDichtPlayMultiplayer from '../views/HackeDichtPlayMultiplayer.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/players',
    name: 'PlayerSetup',
    component: PlayerSetup
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
  // FIX: Korrekte Multiplayer Lobby Route
  {
    path: '/hacke-dicht/lobby/:gameId',
    name: 'HackeDichtLobby',
    component: HackeDichtLobby,
    props: true,
    meta: { requiresAuth: true } // Host muss eingeloggt sein
  },
  // Multiplayer Game Routes
  {
    path: '/hacke-dicht/play-multiplayer/:lobbyCode',
    name: 'HackeDichtPlayMultiplayer',
    component: HackeDichtPlayMultiplayer,
    props: true,
    meta: { requiresAuth: false } // Spieler müssen nicht eingeloggt sein
  },
  {
    path: '/join/:lobbyCode?',
    name: 'JoinLobby',
    component: JoinLobby,
    props: route => ({ code: route.params.lobbyCode || '' }),
    meta: { requiresAuth: false }
  },
  {
    path: '/lobby/:lobbyCode',
    name: 'PlayerLobby',
    component: PlayerLobby,
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
  
  // Allow certain routes without authentication
  const publicRoutes = ['JoinLobby', 'PlayerLobby', 'HackeDichtPlayMultiplayer']
  if (publicRoutes.includes(to.name)) {
    next()
    return
  }
  
  if (to.name !== 'Login' && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'PlayerSetup' })
  } else {
    next()
  }
})

export default router