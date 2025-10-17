// src/i18n/index.js
import { createI18n } from 'vue-i18n'

// Define messages for different locales
const messages = {
    de: {
        welcome: 'Willkommen',
        goodbye: 'Auf Wiedersehen'
    },
    en: {
        welcome: 'Welcome',
        goodbye: 'Goodbye'
    },
    da: {
        welcome: 'velkommen',
        goodbye: 'farvel'
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