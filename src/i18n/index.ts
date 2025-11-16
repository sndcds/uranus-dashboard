import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import messages from './messages'

const storedLocale = typeof window !== 'undefined' ? window.localStorage.getItem('app-locale') : null
const initialLocale =
    storedLocale && Object.prototype.hasOwnProperty.call(messages, storedLocale) ? storedLocale : 'de'

export const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: 'en',
    messageSyntax: 'plain',
    messages,
})

if (typeof window !== 'undefined') {
    watch(
        () => i18n.global.locale.value,
        (newLocale) => {
            if (newLocale) {
                window.localStorage.setItem('app-locale', newLocale)
            }
        },
        { immediate: true }
    )
}

export default i18n
