/*
    src/i18n/space.ts
 */

import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nSpaceTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    space_type: {
        de: 'Raumtyp',
        en: 'Space type',
        da: 'Lokaletype',
    },
    space_name: {
        de: 'Name des Raums',
        en: 'Space name',
        da: 'Lokalenavn',
    },
    unspecified_space_type: {
        de: 'Unbestimmter Raumtyp',
        en: 'Unspecified space type',
        da: 'uspecificeret lokale',
    },
    create_space: {
        de: 'Raum erstellen',
        en: 'Create Space',
        da: 'Opret lokale',
    },
    create_space_description: {
        de: 'Ein Raum oder Bereich innerhalb eines Veranstaltungsorts, z. B. ein Saal, ein Raum oder ein abgegrenzter Bereich.',
        en: 'A room or area within a venue, such as a hall, room, or designated section.',
        da: 'Et lokale eller område inden for et sted, f.eks. en sal, et rum eller et afgrænset område.',
    },
    edit_space: {
        de: 'Raum bearbeiten',
        en: 'Edit space',
        da: 'Rediger lokale',
    },
    delete_space: {
        de: 'Raum löschen',
        en: 'Delete space',
        da: 'Slet lokale',
    },
    confirm_delete_space: {
        de: 'Du bist dabei den Raum "~~name~~" zu löschen. Gib dein Passwort ein, um fortzufahren.',
        en: 'You are about to delete the space "~~name~~". Enter your password to continue.',
        da: 'Du er ved at slette lokale "~~name~~". Indtast din adgangskode for at fortsætte.',
    },
    spaces_empty: {
        de: 'Noch keine Räume angelegt.',
        en: 'No spaces added yet.',
        da: 'Ingen lokaler oprettet endnu.',
    },
    failed_to_delete_space: {
        de: 'Der Raum konnte nicht gelöscht werden. Bitte versuche es erneut.',
        en: 'The space could not be deletet. Please try again.',
        da: 'Lokalet kunne ikke slettes. Prøv igen.',
    },
}

export default uranusI18nSpaceTranslations