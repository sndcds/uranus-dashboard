import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { uranusI18n } from './i18n/uranus-i18n-index.ts'
import router from './router/index.ts'

import { SUPPORTED_UI_LANGUAGES } from '@/store/uranusConstants.ts'
import { useThemeStore } from '@/store/uranusThemeStore.ts'
import { useLanguageLookupStore } from '@/store/UranusLanguageLookup.ts'
import { useLinkTypeLookupStore } from '@/store/UranusLinkTypeLookup.ts'
import { useEventTypeLookupStore } from '@/store/uranusEventTypeGenreLookup.ts'
import { useCurrencyLookupStore } from '@/store/uranusCurrencyLookup.ts'
import { useVenueTypeLookupStore } from '@/store/UranusVenueTypesLookup.ts'
import { useSpaceTypeLookupStore } from '@/store/UranusSpaceTypesLookup.ts'
import { useLegalFormLookupStore } from '@/store/UranusLegalFormLookup.ts'
import { useLicenseLookup } from '@/store/UranusLicenseLookup.ts'
import { useEventReleaseStatusStore } from '@/store/uranusEventReleaseStatusStore.ts'


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
await languageStore.load([...SUPPORTED_UI_LANGUAGES])

const linkTypeLookupStore = useLinkTypeLookupStore()
await linkTypeLookupStore.load([...SUPPORTED_UI_LANGUAGES])

const eventTypeLookupStore = useEventTypeLookupStore()
await eventTypeLookupStore.load([...SUPPORTED_UI_LANGUAGES])

const currencyStore = useCurrencyLookupStore()
await currencyStore.load([...SUPPORTED_UI_LANGUAGES])

const venueTypeLookupStore = useVenueTypeLookupStore()
await venueTypeLookupStore.initialize([...SUPPORTED_UI_LANGUAGES])

const spaceTypeLookupStore = useSpaceTypeLookupStore()
await spaceTypeLookupStore.initialize([...SUPPORTED_UI_LANGUAGES])

const legalFormLookupStore = useLegalFormLookupStore()
await legalFormLookupStore.initialize([...SUPPORTED_UI_LANGUAGES])

const licenseLookup = useLicenseLookup()
await licenseLookup.initialize([...SUPPORTED_UI_LANGUAGES])

const eventReleaseStatusStore = useEventReleaseStatusStore();
await eventReleaseStatusStore.load([...SUPPORTED_UI_LANGUAGES]);

app.mount('#app')