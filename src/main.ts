import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { i18n } from './i18n' // import the i18n instance
import router from './router'

import { useThemeStore } from '@/store/themeStore'
import '@/styles/global.scss' // Import global styles
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(i18n)

// Initialize stores
const themeStore = useThemeStore()
themeStore.initTheme() // apply persisted theme before mount

app.use(router)
app.mount('#app')
