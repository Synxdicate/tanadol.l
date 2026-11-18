import { createApp } from 'vue'
import 'primeicons/primeicons.css'
import router from './router'
import { reveal } from './directives/reveal'
import { fadeImg } from './directives/fadeImg'
import App from './App.vue'
import { installPixelCursor } from './pixelCursor'
import './style.css'

createApp(App).use(router).directive('reveal', reveal).directive('fade-img', fadeImg).mount('#app')
installPixelCursor()
