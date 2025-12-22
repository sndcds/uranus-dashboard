import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { uranusI18n } from './i18n/uranus-i18n-index.ts'
import router from './router'

import { SUPPORTED_UI_LANGUAGES } from '@/store/constants'
import { useThemeStore } from '@/store/themeStore'
import { useLanguageLookupStore } from '@/store/languageLookup'
import { useUrlTypeLookupStore } from '@/store/urlTypesLookup'
import { useEventTypeLookupStore } from '@/store/eventTypesLookup'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import '@/styles/global.scss'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(uranusI18n)
app.use(router)

const themeStore = useThemeStore()
themeStore.initTheme()

const languageStore = useLanguageLookupStore()
await languageStore.load([...SUPPORTED_UI_LANGUAGES])

const eventUrlTypeLookupStore = useUrlTypeLookupStore()
await eventUrlTypeLookupStore.load('event', [...SUPPORTED_UI_LANGUAGES])

const eventTypeLookupStore = useEventTypeLookupStore()
await eventTypeLookupStore.load([...SUPPORTED_UI_LANGUAGES])

app.mount('#app')