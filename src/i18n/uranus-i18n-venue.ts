import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nVenueTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    venue: {
        de: 'Spielstätte',
        en: 'Venue',
        da: 'Spillested',
    },
    venues: {
        de: 'Spielstätten',
        en: 'Venues',
        da: 'Spillesteder',
    },
    venue_space: {
        de: 'Raum',
        en: 'Space',
        da: 'Lokale',
    },
    venue_spaces: {
        de: 'Räume',
        en: 'Spaces',
        da: 'Lokaler',
    },
    venue_place: {
        de: 'Spielstätte/Ort',
        en: 'Venue/location',
        da: 'Spillested/lokalitet',
    },
    venue_add: {
        de: 'Spielstätte hinzufügen',
        en: 'Add new venue',
        da: 'Tilføj nyt spillested',
    },
    venue_delete: {
        de: 'Spielstätte löschen',
        en: 'Delete venue',
        da: 'Slet spillested',
    },
}