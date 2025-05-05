import { createApp } from 'vue'
import App from './App.vue'

// 路由
import router from './router'

// 狀態管理
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 全域樣式
import './assets/styles.css'

const app = createApp(App)

// 建立並註冊 Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(router)
app.use(pinia)
app.mount('#app')
