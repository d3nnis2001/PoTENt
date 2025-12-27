import { createApp } from 'vue'
import './styles/main.css'
import './shared/styles/themes/cyberpunk.css'
import './games/ai-takes-over/styles/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)     
app.mount('#app') 