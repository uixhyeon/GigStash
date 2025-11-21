import './assets/main.css'
import '@flaticon/flaticon-uicons/css/bold/rounded.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

createApp(App).use(router).use(createPinia()).mount('#app')
