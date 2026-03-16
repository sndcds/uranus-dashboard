import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import de from './json/de.json'
import en from './json/en.json'
import da from './json/da.json'

export const uranusI18nMessages = { de, en, da }

export type UranusLocaleKey = 'de' | 'en' | 'da'
export type UranusTranslationBlock<K extends string> = Record<K, Record<UranusLocaleKey, string>>


const storedLocale = typeof window !== 'undefined' ? window.localStorage.getItem('app-locale') : null
const initialLocale =
    storedLocale && Object.prototype.hasOwnProperty.call(uranusI18nMessages, storedLocale)
        ? (storedLocale as UranusLocaleKey)
        : 'de'

export const uranusI18n = createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: 'en',
    messages: uranusI18nMessages,
})

if (typeof window !== 'undefined') {
    watch(
        () => uranusI18n.global.locale.value,
        (newLocale) => {
            if (newLocale) {
                window.localStorage.setItem('app-locale', newLocale)
            }
        },
        { immediate: true }
    )
}

export default uranusI18n