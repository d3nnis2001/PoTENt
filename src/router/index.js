import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import GameSelection from '../views/GameSelection.vue'
import Gallery from '../views/Gallery.vue'
import EditDeck from '../views/EditDeck.vue'
import PlayDeck from '../views/PlayDeck.vue'
import HackeDichtGallery from '../views/HackeDichtGallery.vue'
import HackeDichtEditor from '../views/HackeDichtEditor.vue'
import HackeDichtPlay from '../views/HackeDichtPlay.vue'

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

// Auth Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true'
  
  if (to.name !== 'Login' && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'GameSelection' })
  } else {
    next()
  }
})

export default router