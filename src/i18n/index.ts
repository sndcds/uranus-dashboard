// src/i18n/index.js
import { createI18n } from 'vue-i18n'

// Define messages for different locales
const messages = {
    de: {
        logout: 'Abmelden',
        settings: 'Einstellungen',
        welcome: 'Willkommen',
        goodbye: 'Auf Wiedersehen',
        dashboard: 'Übersicht',
        organizers: 'Organisationen',
        venues: 'Spielstätten',
    },
    en: {
        logout: 'Logout',
        settings: 'Settings',
        welcome: 'Welcome',
        goodbye: 'Goodbye',
        dashboard: 'Dashboard',
        organizers: 'Organizers',
        venues: 'Venues',
    },
    da: {
        logout: 'Afmeld',
        settings: 'Indstillinger',
        welcome: 'velkommen',
        goodbye: 'farvel',
        organizers: 'Organisationer',
        venues: 'Spillesteder',
    },
}

// Create the i18n instance
const i18n = createI18n({
    legacy: false, // use Composition API
    locale: 'de',  // default locale
    fallbackLocale: 'en',
    messages
})

export default i18n