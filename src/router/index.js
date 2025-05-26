import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import GameSelection from '../views/GameSelection.vue'
import Gallery from '../views/Gallery.vue'
import EditDeck from '../views/EditDeck.vue'
import PlayDeck from '../views/PlayDeck.vue'

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