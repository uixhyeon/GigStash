import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Pinia를 먼저 초기화 (라우터 가드에서 사용됨)
app.use(createPinia())
app.use(router)
app.mount('#app')
