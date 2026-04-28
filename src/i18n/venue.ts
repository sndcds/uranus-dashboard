/*
    src/i18n/venue.ts
 */

import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nVenueTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    venue: {
        de: 'Veranstaltungsort',
        en: 'Venue',
        da: 'Sted',
    },
    venues: {
        de: 'Veranstaltungsorte',
        en: 'Venues',
        da: 'Steder',
    },
    venue_type: {
        de: 'Ortstyp',
        en: 'Venue type',
        da: 'Stedstype',
    },
    venues_list_hero_description: {
        de: 'Alle Veranstaltungsorte, an denen du Events erstellen kannst.',
        en: 'All venues where you can create events.',
        da: 'Alle steder, hvor du kan oprette begivenheder.',
    },
    unspecified_venue_type: {
        de: 'Unbekannter Ortstyp',
        en: 'Unspecified venue type',
        da: 'Uspecificeret stedstype',
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
    venue_add: {
        de: 'Veranstaltungsort hinzufügen',
        en: 'Add new venue',
        da: 'Tilføj nyt sted',
    },
    venue_delete: {
        de: 'Veranstaltungsort löschen',
        en: 'Delete venue',
        da: 'Slet sted',
    },
    edit_venue: {
        de: 'Veranstaltungsort bearbeiten',
        en: 'Edit Venue',
        da: 'Rediger spillested',
    },
    venue_name: {
        de: 'Name des Veranstaltungsorts',
        en: 'Venue Name',
        da: 'Navn på stedet',
    },
    notification_cant_see_venues_title: {
        de: 'Warum kann ich keine Veranstaltungsorte sehen?',
        en: 'Why can’t I see any venues?',
        da: 'Hvorfor kan jeg ikke se nogen steder?',
    },
    notification_cant_see_venues_message: {
        de: '<p>Wähle eine <strong>Organisation</strong> für die du Veranstaltungsorte verwalten möchtest.</p>',
        en: '<p>Select an <strong>organization</strong> for which you want to manage venues.</p>',
        da: '<p>Vælg en <strong>organisation</strong>, som du vil administrere steder for.</p>',
    },
    notification_cant_see_venues_action: {
        de: 'Zu den Organisationen',
        en: 'Go to Organizations',
        da: 'Til organisationerne',
    },
    venue_images_title: {
        de: 'Bilder und Logos des Veranstaltungsorts',
        en: 'Venue images and logos',
        da: 'Stedets billeder og logoer',
    },
    venue_images_description: {
        de: 'Lade Bilder und Logos deines Veranstaltungsorts hoch.',
        en: 'Upload images and logos for your venue.',
        da: 'Upload billeder og logoer for dit sted.',
    },
    create_venue: {
        de: 'Veranstaltungsort erstellen',
        en: 'Create venue',
        da: 'Opret sted',
    },
    create_venue_description: {
        de: 'Typische Veranstaltungsorte sind Gebäude oder Plätze. Bitte erstelle hier keine einzelnen Räume.',
        en: 'Typical venues are buildings or outdoor locations. Please do not create individual rooms here.',
        da: 'Typiske steder er bygninger eller udendørs områder. Opret venligst ikke enkelte lokaler her.',
    },
    delete_venue: {
        de: 'Veranstaltungsort löschen',
        en: 'Delete venue',
        da: 'Slet sted',
    },
    confirm_delete_venue: {
        de: 'Du bist dabei den Veranstaltungsort "~~name~~" zu löschen. Gib dein Passwort ein, um fortzufahren.',
        en: 'You are about to delete the venu "{name}". Enter your password to continue.',
        da: 'Du er ved at slette stedet "{name}". Indtast din adgangskode for at fortsætte.',
    },
    select_venue: {
        de: 'Veranstaltungsort wählen',
        en: 'Select venue',
        da: 'Vælg sted',
    },
    selectable_venues_by_user: {
        de: 'Diese Veranstaltungsorte kannst du für Events auswählen',
        en: 'These venues are available for you to select for events',
        da: 'Disse steder kan du vælge til begivenheder',
    }
}

export default uranusI18nVenueTranslations