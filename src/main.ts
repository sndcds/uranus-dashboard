import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia'
import i18n from './i18n' // import the i18n instance
import router from './router'
import { useAppStore } from '@/store/appStore'
import { useThemeStore } from '@/store/themeStore'

const app = createApp(App);
const pinia = createPinia()

app.use(pinia)
app.use(i18n)

// Initialize stores
const themeStore = useThemeStore()
themeStore.initTheme() // apply persisted theme before mount

app.use(router);
app.mount('#app');

const appStore = useAppStore()
appStore.loadOrganizerIdFromStorage() // sync with localStorage
