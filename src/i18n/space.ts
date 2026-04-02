import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nSpaceTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    unspecified_space_type: {
        de: 'Unbestimmter Raumtyp',
        en: 'Unspecified space type',
        da: 'uspecificeret lokale',
    },
    confirm_delete_description: {
        de: 'Du bist dabei "~~name~~" zu löschen. Gib dein Passwort ein, um fortzufahren.',
        en: 'You are about to delete "{name}". Enter your password to continue.',
        da: 'Du er ved at slette "{name}". Indtast din adgangskode for at fortsætte.',
    }
}

export default uranusI18nSpaceTranslations