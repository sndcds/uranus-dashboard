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
    venue_name: {
        de: 'Name der Spielstätte',
        en: 'Venue Name',
        da: 'Navn på spillested',
    },
    custom_location: {
        de: 'Benutzerdefinierter Ort',
        en: 'Custom location',
        da: 'Brugerdefineret sted',
    },
    notification_cant_see_venues_title: {
        de: 'Warum kann ich keine Spielstätten sehen?',
        en: 'Why can’t I see any venues?',
        da: 'Hvorfor kan jeg ikke se nogen spillesteder?',
    },
    notification_cant_see_venues_message: {
        de: '<p>Wähle eine <strong>Organisation</strong> für die du Spielstätten verwalten möchtest.</p>',
        en: '<p>Select an <strong>organization</strong> for which you want to manage venues.</p>',
        da: '<p>Vælg en <strong>organisation</strong>, som du vil administrere spillesteder for.</p>',
    },
    notification_cant_see_venues_action: {
        de: 'Zu den Organisationen',
        en: 'Go to Organizations',
        da: 'Til organisationerne',
    },
}