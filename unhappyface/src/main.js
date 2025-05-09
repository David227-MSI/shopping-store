import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/main.css';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import router from './router/router.js'
import App from './App.vue'

import './assets/main.css'

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

createApp(App)
    .use(router)
    .use(pinia)
    .mount('#app')
