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
    venue_scope: {
        de: 'Zugehörigkeit des Ortes',
        en: 'Venue ownership',
        da: 'Stedets tilhørsforhold',
    },
    venue_scope_shared: {
        de: 'Eigener Ort',
        en: 'Own venue',
        da: 'Eget sted',
    },
    venue_scope_organization: {
        de: 'Provisorischer Ort',
        en: 'Provisional venue',
        da: 'Midlertidigt sted',
    },
    venue_scope_shared_info: {
        de: '<h3>Eigener Ort</h3>' +
            'Wähle <strong>Eigener Ort</strong>, wenn der Veranstaltungsort zu deiner Organisation gehört und du für ' +
            'seine Verwaltung zuständig bist. Du entscheidest dann, welche Organisationen den Ort für Veranstaltungen nutzen können.<br><br>' +
            'Eigene Orte können Räume enthalten, für die du Informationen zur Barrierefreiheit hinterlegen kannst. ' +
            'Außerdem kannst du sie später für andere Organisationen als Veranstaltungsort freigeben.',
        da: '<h3>Eget sted</h3>' +
            'Vælg <strong>Eget sted</strong>, hvis arrangementsstedet tilhører din organisation, og du er ansvarlig for ' +
            'at administrere det. Du bestemmer dermed, hvilke organisationer der kan bruge stedet til arrangementer.<br><br>' +
            'Egne steder kan indeholde lokaler, hvor du kan tilføje oplysninger om tilgængelighed. ' +
            'Du kan også senere gøre dem tilgængelige som arrangementssteder for andre organisationer.',

        en: '<h3>Own venue</h3>' +
            'Choose <strong>Own venue</strong> if the venue belongs to your organisation and you are responsible for ' +
            'managing it. You then decide which organisations can use the venue for events.<br><br>' +
            'Own venues can include spaces for which you can add accessibility information. ' +
            'You can also make them available as event venues for other organisations later.',
    },
    venue_scope_organization_info: {
        de: '<h3>Provisorischer Ort</h3>' +
            'Wähle <strong>Provisorischer Ort</strong>, wenn du für eine Veranstaltung einen Ort benötigst, der weder von deiner Organisation verwaltet wird ' +
            'noch von einer anderen Organisation für dich freigegeben wurde.<br><br>' +
            'Provisorische Orte können nicht mit anderen Organisationen geteilt werden und enthalten keine verwaltbaren Räume.<br>' +
            '<strong>Tipp:</strong> Prüfe zuerst, ob der Ort bereits auf der Karte vorhanden ist. ' +
            'Falls ja, kannst du die verwaltende Organisation um eine Partnerschaft bitten, damit du den Ort für deine Veranstaltungen nutzen kannst.',
        da: '<h3>Midlertidigt sted</h3>' +
            'Vælg <strong>Midlertidigt sted</strong>, hvis du har brug for et sted til et arrangement, som hverken administreres af din organisation ' +
            'eller er gjort tilgængeligt for dig af en anden organisation.<br><br>' +
            'Midlertidige steder kan ikke deles med andre organisationer og kan ikke indeholde administrerbare lokaler.<br>' +
            '<strong>Tip:</strong> Undersøg først, om stedet allerede findes på kortet. ' +
            'Hvis det gør, kan du bede den administrerende organisation om et partnerskab, så du kan bruge stedet til dine arrangementer.',
        en: '<h3>Temporary venue</h3>' +
            'Choose <strong>Temporary venue</strong> if you need a venue for an event that is neither managed by your organisation ' +
            'nor made available to you by another organisation.<br><br>' +
            'Temporary venues cannot be shared with other organisations and cannot contain manageable spaces.<br>' +
            '<strong>Tip:</strong> First check whether the venue is already on the map. ' +
            'If it is, you can ask the managing organisation for a partnership so that you can use the venue for your events.',
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
    venue_search_on_map: {
        de: 'Ort auf Karte Suchen',
        en: 'Search venue on map',
        da: 'Søg sted på kort',
    },
    venue_back_to_list: {
        de: 'Zur Liste',
        en: 'Back to list',
        da: 'Tilbage til listen',
    },
    venue_request_question: {
        de: 'Diesen Ort als Veranstaltungsort anfragen?',
        en: 'Request this place as a venue?',
        da: 'Anmod om dette sted som spillested?',
    },
    venue_request_send: {
        de: 'Anfrage senden',
        en: 'Send request',
        da: 'Send anmodning',
    },
    venue_request_missing_org: {
        de: 'Für diesen Ort konnte keine Organisation gefunden werden.',
        en: 'No organization could be found for this venue.',
        da: 'Der kunne ikke findes en organisation for dette sted.',
    },
    venue_request_partner_message: {
        de: 'Ich möchte "~~venueName~~" als Veranstaltungsort nutzen.',
        en: 'I would like to use "~~venueName~~" as a venue.',
        da: 'Jeg vil gerne bruge "~~venueName~~" som spillested.',
    },
    venue_request_success_followup: {
        de: 'Die Anfrage für den Veranstaltungsort ~~venueName~~ wurde erfolgreich gesendet. Bitte schaue demnächst in den Bereich Partner, ob die Anfrage angenommen wurde.',
        en: 'The request for the venue ~~venueName~~ was sent successfully. Please check the Partners area soon to see whether the request has been accepted.',
        da: 'Anmodningen for spillestedet ~~venueName~~ blev sendt. Tjek snart Partner-området for at se, om anmodningen er blevet accepteret.',
    },
    venue_added_to_selection: {
        de: 'Veranstaltungsort hinzugefügt',
        en: 'Venue added',
        da: 'Sted tilføjet',
    },
    venue_selection_empty: {
        de: 'Keine Veranstaltungsorte ausgewählt.',
        en: 'No venues selected.',
        da: 'Ingen steder valgt.',
    },
    selectable_venues_by_user: {
        de: 'Diese Veranstaltungsorte kannst du für Events auswählen',
        en: 'These venues are available for you to select for events',
        da: 'Disse steder kan du vælge til begivenheder',
    },
    venue_tab_base: {
        de: 'Grunddaten',
        en: 'Basic',
        da: 'Grundoplysninger',
    },
    venue_tab_map: {
        de: 'Karte',
        en: 'Map',
        da: 'Kort',
    },
    venue_tab_logo: {
        de: 'Logo',
        en: 'Logo',
        da: 'Logo',
    },
    venue_tab_images: {
        de: 'Bilder',
        en: 'Images',
        da: 'Billeder',
    },
}

export default uranusI18nVenueTranslations
