// src/i18n/index.js
import { createI18n } from 'vue-i18n'

// Define messages for different locales
const messages = {
    de: {
        settings: 'Einstellungen',
        welcome: 'Willkommen',
        goodbye: 'Auf Wiedersehen',
        venues: 'Spielstätten',
    },
    en: {
        settings: 'Settings',
        welcome: 'Welcome',
        goodbye: 'Goodbye',
        venues: 'Venues',
    },
    da: {
        settings: 'Indstillinger',
        welcome: 'velkommen',
        goodbye: 'farvel',
        venues: 'Spillesteder',
    },
}

// Create the i18n instance
const i18n = createI18n({
    legacy: false, // use Composition API
    locale: 'de',  // default locale
    fallbackLocale: 'de',
    messages
})

export default i18n