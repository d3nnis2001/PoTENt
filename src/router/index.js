import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
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
    path: '/gallery',
    name: 'Gallery',
    component: Gallery
  },
  {
    path: '/edit/:deckId',
    name: 'EditDeck',
    component: EditDeck,
    props: true
  },
  {
    path: '/play/:deckId',
    name: 'PlayDeck',
    component: PlayDeck,
    props: true
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
    next({ name: 'Gallery' })
  } else {
    next()
  }
})

export default router