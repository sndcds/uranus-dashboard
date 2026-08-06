/*
    src/i18n/form.ts
 */

import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nFormTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    marker_set_location_hint: {
        de: 'Klicke in die Karte, um einen Marker zu setzen.',
        en: 'Click on the map to place a marker.',
        da: 'Klik på kortet for at sætte en markør.',
    },
    remove_marker: {
        de: 'Marker entfernen',
        en: 'Remove marker',
        da: 'Fjern markør',
    },

}

export default uranusI18nFormTranslations