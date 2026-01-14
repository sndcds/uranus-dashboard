import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { uranusI18n } from './i18n/uranus-i18n-index.ts'
import router from './router/index.ts'

import { SUPPORTED_UI_LANGUAGES } from '@/store/constants.ts'
import { useThemeStore } from '@/store/themeStore.ts'
import { useLanguageLookupStore } from '@/store/languageLookup.ts'
import { useUrlTypeLookupStore } from '@/store/urlTypesLookup.ts'
import { useEventTypeLookupStore } from '@/store/eventTypesLookup.ts'
import { useSpaceTypeLookupStore } from '@/store/spaceTypesLookup.ts'


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

const spaceTypeLookupStore = useSpaceTypeLookupStore()
await spaceTypeLookupStore.load([...SUPPORTED_UI_LANGUAGES])

app.mount('#app')