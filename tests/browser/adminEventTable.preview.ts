// Browser smoke-test entry point. Loaded only by the intercepted test HTML.
import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { uranusI18nMessages } from '@/i18n/uranus-i18n-index'
import { useAppStore } from '@/store/appStore'
import { useLanguageLookupStore } from '@/store/languageLookupStore'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore'
import UranusAdminEventCardsView from '@/component/event/view/UranusAdminEventCardsView.vue'
import UranusAdminEventEditView from '@/component/event/view/UranusAdminEventEditView.vue'
import '@/style/global.scss'
const app = createApp({ render: () => h(RouterView) })
const pinia = createPinia()
app.use(pinia)
useAppStore().setOrgValues('org-1', 'Kulturhaus Nord', null, null, null)
useLanguageLookupStore().loaded = true
useLanguageLookupStore().data = { de: { de: 'Deutsch', da: 'Dänisch', en: 'Englisch' } }
useEventTypeLookupStore().data = { de: { types: { '1': { name: 'Konzert', genres: { '1': 'Gospel', '2': 'Jazz' } }, '2': { name: 'Show' } } } }
app.use(createI18n({ legacy: false, locale: 'de', messages: uranusI18nMessages }))
const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/__event-table-preview', name: 'admin-org-events', component: UranusAdminEventCardsView },
  { path: '/admin/event/:uuid', component: UranusAdminEventEditView },
] })
app.use(router)
app.mount('#app')
