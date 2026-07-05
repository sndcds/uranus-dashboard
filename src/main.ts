import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { uranusI18n } from './i18n/uranus-i18n-index.ts'
import router from './router/index.ts'

import { SUPPORTED_UI_LANGUAGES } from '@/store/uranusConstants.ts'
import { useThemeStore } from '@/store/themeStore.ts'
import { useLanguageLookupStore } from '@/store/languageLookupStore.ts'
import { useLinkTypeLookupStore } from '@/store/linkTypeLookupStore.ts'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import { useCurrencyLookupStore } from '@/store/currencyLookupStore.ts'
import { useVenueTypeLookupStore } from '@/store/venueTypesLookupStore.ts'
import { useSpaceTypeLookupStore } from '@/store/spaceTypesLookupStore.ts'
import { useLegalFormLookupStore } from '@/store/legalFormLookupStore.ts'
import { useLicenseLookup } from '@/store/licenseLookupStore.ts'
import { useEventReleaseStatusStore } from '@/store/eventReleaseStatusStore.ts'


import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import '@/style/global.scss'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(uranusI18n)
app.use(router)

const themeStore = useThemeStore()
themeStore.initTheme()

const languageStore = useLanguageLookupStore()
const linkTypeLookupStore = useLinkTypeLookupStore()
const eventTypeLookupStore = useEventTypeLookupStore()
const currencyStore = useCurrencyLookupStore()
const venueTypeStore = useVenueTypeLookupStore()
const spaceTypeStore = useSpaceTypeLookupStore()
const legalFormStore = useLegalFormLookupStore()
const licenseStore = useLicenseLookup()
const eventReleaseStatusStore = useEventReleaseStatusStore()

await Promise.all([
    languageStore.load([...SUPPORTED_UI_LANGUAGES]),
    linkTypeLookupStore.load([...SUPPORTED_UI_LANGUAGES]),
    eventTypeLookupStore.initialize([...SUPPORTED_UI_LANGUAGES]),
    currencyStore.load([...SUPPORTED_UI_LANGUAGES]),
    venueTypeStore.initialize([...SUPPORTED_UI_LANGUAGES]),
    spaceTypeStore.initialize([...SUPPORTED_UI_LANGUAGES]),
    legalFormStore.initialize([...SUPPORTED_UI_LANGUAGES]),
    licenseStore.initialize([...SUPPORTED_UI_LANGUAGES]),
    eventReleaseStatusStore.load([...SUPPORTED_UI_LANGUAGES])
])

app.mount('#app')