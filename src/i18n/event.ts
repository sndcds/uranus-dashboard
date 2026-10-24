/*
    src/i18n/event.ts
 */

import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nEventTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    event_table_date_range: { de: 'Datumsbereich', en: 'Date range', da: 'Datointerval' },
    event_table_period: { de: 'Zeitraum', en: 'Period', da: 'Periode' },
    event_table_all_dates: { de: 'Alle Termine', en: 'All dates', da: 'Alle datoer' },
    event_table_month: { de: 'Monat', en: 'Month', da: 'Måned' },
    event_table_quarter: { de: 'Quartal', en: 'Quarter', da: 'Kvartal' },
    event_table_quarter_number: { de: '{number}. Quartal', en: 'Quarter {number}', da: '{number}. kvartal' },
    event_table_year: { de: 'Jahr', en: 'Year', da: 'År' },
    event_table_custom_range: { de: 'Von / bis', en: 'From / to', da: 'Fra / til' },
    event_table_invalid_range: { de: 'Bitte wähle einen gültigen Zeitraum. „Von“ muss vor oder auf „Bis“ liegen.', en: 'Please choose a valid date range. “From” must be on or before “To”.', da: 'Vælg et gyldigt datointerval. “Fra” skal være før eller samme dag som “Til”.' },
    event_table_past: { de: 'Vergangen', en: 'Past', da: 'Afholdt' },
    event_table_confirm_past_edit: { de: 'Möchtest du eine vergangene Veranstaltung wirklich bearbeiten?', en: 'Do you really want to edit a past event?', da: 'Vil du virkelig redigere en tidligere begivenhed?' },
    "event_table_date": { de: "Datum / Zeit", en: "Date / time", da: "Dato / tid" },
    "event_table_language": { de: "Veranstaltungssprache", en: "Event language", da: "Begivenhedens sprog" },
    "event_table_dates": { de: "Termine", en: "Dates", da: "Datoer" },
    "event_table_subtitle": { de: "Untertitel", en: "Subtitle", da: "Undertitel" },
    "event_table_text": { de: "Beschreibung", en: "Description", da: "Beskrivelse" },
    "event_table_summary": { de: "Zusammenfassung", en: "Summary", da: "Resumé" },
    "event_table_images": { de: "Bilder", en: "Images", da: "Billeder" },
    "event_table_categories": { de: "Kategorien", en: "Categories", da: "Kategorier" },
    "event_table_types": { de: "Veranstaltungstypen", en: "Event types", da: "Begivenhedstyper" },
    "event_table_genres": { de: "Genres", en: "Genres", da: "Genrer" },
    "event_table_languageRelevant": { de: "Sprachrelevant", en: "Language relevance", da: "Sprogrelevans" },
    "event_table_tags": { de: "Tags", en: "Tags", da: "Tags" },
    "event_table_links": { de: "Zusätzliche Links", en: "Additional links", da: "Yderligere links" },
    "event_table_register": { de: "Registrierung", en: "Registration", da: "Tilmelding" },
    "event_table_ticket": { de: "Tickets", en: "Tickets", da: "Billetter" },
    "event_table_price": { de: "Preis", en: "Price", da: "Pris" },
    "event_table_info": { de: "Informationen und Aktionen", en: "Information and actions", da: "Information og handlinger" },
    "event_table_title": { de: "Titel", en: "Title", da: "Titel" },
    "event_table_legend": { de: "Legende anzeigen", en: "Show legend", da: "Vis forklaring" },
    "event_table_legend_columns": { de: "Feste Spalten in Leserichtung", en: "Fixed columns in reading order", da: "Faste kolonner i læseretning" },
    "event_table_release": { de: "Release-Status: {status}", en: "Release status: {status}", da: "Udgivelsesstatus: {status}" },
    "event_table_release_unknown": { de: "Unbekannt", en: "Unknown", da: "Ukendt" },
    "event_table_release_legend": { de: "Der Balken zeigt ausschließlich den Release-Status. Die Farben entsprechen den bestehenden Veröffentlichungszuständen.", en: "The bar shows the release status only. Colors follow the existing publication states.", da: "Bjælken viser kun udgivelsesstatus. Farverne følger de eksisterende udgivelsestilstande." },
    "event_table_category_legend": { de: "Die Punkte verwenden die vorhandenen Kategoriefarben. Ein roter Kategoriepunkt ist keine Warnung.", en: "Dots use the existing category colors. A red category dot is not a warning.", da: "Prikkerne bruger de eksisterende kategorifarver. En rød kategoriprik er ikke en advarsel." },
    "event_table_field_legend": { de: "Farben in einzelnen Zellen gelten nur für das jeweilige Feld. Es gibt keine Gesamtbewertung. Optionale fehlende Angaben bleiben grau; unbekannte Angaben werden nicht als Fehler markiert.", en: "Colors in individual cells apply only to that field. There is no overall rating. Absent optional information stays gray; unknown information is not flagged as an error.", da: "Farver i enkelte celler gælder kun det pågældende felt. Der er ingen samlet vurdering. Manglende valgfrie oplysninger forbliver grå; ukendte oplysninger markeres ikke som fejl." },
    "event_table_present": { de: "Vorhanden", en: "Present", da: "Til stede" },
    "event_table_missing": { de: "Erforderliche Angabe fehlt", en: "Required information missing", da: "Påkrævet oplysning mangler" },
    "event_table_incomplete": { de: "Angabe unvollständig", en: "Incomplete information", da: "Ufuldstændig oplysning" },
    "event_table_not_applicable": { de: "Optional / nicht erforderlich, nicht hinterlegt", en: "Optional / not required, not provided", da: "Valgfri / ikke påkrævet, ikke angivet" },
    "event_table_unknown": { de: "Keine belastbare Angabe in der Listenansicht verfügbar", en: "No reliable information available in the list", da: "Ingen pålidelig oplysning tilgængelig i listen" },
    "event_table_requirement_unknown": { de: "Keine Information hinterlegt; ob erforderlich, ist nicht bekannt", en: "No information provided; requirement is unknown", da: "Ingen oplysninger angivet; det vides ikke, om det er påkrævet" },
    "event_table_no_date": { de: "Kein Datum", en: "No date", da: "Ingen dato" },
    "event_table_no_time": { de: "Uhrzeit fehlt", en: "Time missing", da: "Tidspunkt mangler" },
    "event_table_no_title": { de: "Kein Titel", en: "No title", da: "Ingen titel" },
    "event_table_no_image": { de: "Kein Vorschaubild", en: "No preview image", da: "Intet eksempelbillede" },
    "event_table_civil_date": { de: "Lokales Veranstaltungsdatum und lokale Uhrzeit, ohne UTC-Umrechnung", en: "Local event date and time, without UTC conversion", da: "Lokal begivenhedsdato og tid uden UTC-konvertering" },
    "event_table_date_index": { de: "Termin {index} von {total} der Veranstaltung; kein Bearbeitungsstand", en: "Date {index} of {total} for this event; not an editing status", da: "Dato {index} af {total} for begivenheden; ikke en redigeringsstatus" },
    "event_table_date_count": { de: "{count} Termine insgesamt", en: "{count} dates in total", da: "{count} datoer i alt" },
    "event_table_characters": { de: "{count} Zeichen", en: "{count} characters", da: "{count} tegn" },
    "event_table_count": { de: "Anzahl: {count}", en: "Count: {count}", da: "Antal: {count}" },
    "event_table_edit_hint": { de: "Zum Bearbeiten öffnen", en: "Open to edit", da: "Åbn for at redigere" },
    "event_table_free": { de: "Frei", en: "Free", da: "Gratis" },
    "event_table_more": { de: "Weitere Informationen", en: "More information", da: "Flere oplysninger" },
    "event_table_search": { de: "Events durchsuchen", en: "Search events", da: "Søg i begivenheder" },
    "event_table_status_filter": { de: "Release-Status filtern", en: "Filter release status", da: "Filtrer udgivelsesstatus" },
    "event_table_all_statuses": { de: "Alle Release-Status", en: "All release statuses", da: "Alle udgivelsesstatusser" },
    "event_table_missing_filter": { de: "Fehlende Angaben", en: "Missing information", da: "Manglende oplysninger" },
    "event_table_filter_help": { de: "Mindestens eines der ausgewählten Felder fehlt (ODER). Unbekannte Angaben werden nicht mitgezählt.", en: "At least one selected field is absent (OR). Unknown information is not included.", da: "Mindst ét af de valgte felter mangler (ELLER). Ukendte oplysninger tælles ikke med." },
    "event_table_sort": { de: "Sortierung", en: "Sort order", da: "Sortering" },
    "event_table_ascending": { de: "Chronologisch", en: "Chronological", da: "Kronologisk" },
    "event_table_descending": { de: "Neueste zuerst", en: "Latest first", da: "Nyeste først" },
    "event_table_empty": { de: "Keine passenden Veranstaltungen", en: "No matching events", da: "Ingen matchende begivenheder" },
    "event_table_loading": { de: "Veranstaltungen werden geladen …", en: "Loading events …", da: "Indlæser begivenheder …" },
    "event_table_page": { de: "Seite {page} von {total} · {count} Einträge", en: "Page {page} of {total} · {count} entries", da: "Side {page} af {total} · {count} poster" },
    "event_table_previous": { de: "Vorherige Seite", en: "Previous page", da: "Forrige side" },
    "event_table_next": { de: "Nächste Seite", en: "Next page", da: "Næste side" },
    "event_table_pagination": { de: "Seitennavigation der Eventliste", en: "Event list pagination", da: "Sidenavigation for begivenhedslisten" },
    "event_table_close": { de: "Informationen schließen", en: "Close information", da: "Luk oplysninger" },
    "event_table_category_unknown": { de: "Kategorie {id}", en: "Category {id}", da: "Kategori {id}" },
    "event_table_location_unknown": { de: "Kein Veranstaltungsort hinterlegt", en: "No venue provided", da: "Intet sted angivet" },
    "event_table_no_details": { de: "Weitere Angaben sind in der bestehenden Eventbearbeitung verfügbar.", en: "Further information is available in the existing event editor.", da: "Yderligere oplysninger findes i den eksisterende begivenhedsredigering." },
    "event_table_list": { de: "Eventübersicht", en: "Event overview", da: "Begivenhedsoversigt" },
    event: {
        de: 'Event',
        en: 'Event',
        da: 'Begivenhed',
    },
    events: {
        de: 'Events',
        en: 'Events',
        da: 'Begivenheder',
    },
    events_: {
        de: 'Events',
        en: 'Events',
        da: 'Begivenheder',
    },
    events_hero_subtitle : {
        de: 'Vergangene, laufende und kommende Veranstaltungen auf einen Blick.',
        en: 'Past, ongoing and upcoming events at a glance.',
        da: 'Få et overblik over tidligere, igangværende og kommende begivenheder.'
    },
    event_title: {
        de: 'Titel',
        en: 'Title',
        da: 'Overskrift',
    },
    event_tab_base: {
        de: 'Was',
        en: 'What',
        da: 'Hvad',
    },
    event_tab_venue: {
        de: 'Wo',
        en: 'Where',
        da: 'Hvor',
    },
    event_tab_dates: {
        de: 'Wann',
        en: 'When',
        da: 'Hvornår',
    },
    event_tab_tags: {
        de: 'Tags',
        en: 'Tags',
        da: 'Tags',
    },
    event_tab_links: {
        de: 'Links',
        en: 'Links',
        da: 'Links',
    },
    event_tab_participate: {
        de: 'Teilnahme',
        en: 'Participation',
        da: 'Deltagelse',
    },
    event_tab_register: {
        de: 'Anmeldung',
        en: 'Registration',
        da: 'Tilmelding',
    },
    event_tab_ticket: {
        de: 'Ticket',
        en: 'Ticket',
        da: 'Billet',
    },
    event_tab_visitor: {
        de: 'Infos',
        en: 'Info',
        da: 'Info',
    },
    event_tab_images: {
        de: 'Bilder',
        en: 'Images',
        da: 'Billeder',
    },
    event_count_singular: {
        de: '1 Veranstaltung',
        en: '1 event',
        da: '1 begivenhed',
    },
    event_count_plural: {
        de: '~~count~~ Veranstaltungen',
        en: '~~count~~ events',
        da: '~~count~~ begivenheder'
    },
    online_event: {
        de: 'Online Veranstaltung',
        en: 'Online event',
        da: 'Onlinebegivenhed',
    },
    online_event_link: {
        de: 'Link zur Online Veranstaltung',
        en: 'Link to online event',
        da: 'Link til onlinebegivenhed',
    },
    event_participation: {
        de: 'Teilnahme',
        en: 'Participation',
        da: 'Deltagelse',
    },
    event_registration: {
        de: 'Anmeldung',
        en: 'Register',
        da: 'Tilmeld',
    },
    event_registration_link: {
        de: 'Anmeldenlink',
        en: 'Registration link',
        da: 'Tilmeldingslink',
    },
    event_registration_email: {
        de: 'Per E-Mail anmelden',
        en: 'Register by email',
        da: 'Tilmeld via e-mail',
    },
    event_registration_phone: {
        de: 'Telefonische Anmeldung',
        en: 'Register by phone',
        da: 'Tilmeld telefonisk',
    },
    event_registration_deadline: {
        de: 'Späteste Anmeldung am',
        en: 'Register no later than',
        da: 'Registrer senest den',
    },
    event_category: {
        de: 'Kategorie',
        en: 'Category',
        da: 'Kategori',
    },
    event_type: {
        de: 'Eventtyp',
        en: 'Event type',
        da: 'Begivenhedstype',
    },
    event_genre: {
        de: 'Genre',
        en: 'Genre',
        da: 'Genre',
    },
    event_tags: {
        de: 'Tags',
        en: 'Tags',
        da: 'Tags',
    },
    event_input_tag: {
        de: 'Tag eingeben',
        en: 'Insert tag',
        da: 'Indtast tag',
    },
    event_languages: {
        de: 'Sprachen',
        en: 'Languages',
        da: 'Sprog',
    },
    event_select_language: {
        de: "Sprache auswählen",
        en: "Select language",
        da: "Vælg et sprog",
    },
    event_location: {
        de: "Ort",
        en: "Location",
        da: "Sted",
    },
    event_links: {
        de: 'Externe Links',
        en: 'External links',
        da: 'Eksterne links',
    },
    event_source_link: {
        de: 'Link zur offiziellen Veranstaltungsseite',
        en: 'Link to the official event page',
        da: 'Link til den officielle side med begivenheden',
    },
    event_logo_mode: {
        de: 'Verwendetes Logo',
        en: 'Logo to use',
        da: 'Logo der skal bruges',
    },
    event_logo_mode_organizer: {
        de: 'Veranstalterlogo',
        en: 'Organizer logo',
        da: 'Arrangørlogo',
    },
    event_logo_mode_venue: {
        de: 'Ortslogo',
        en: 'Venue logo',
        da: 'Stedlogo',
    },
    event_link_title: {
        de: 'Linktitel',
        en: 'Link title',
        da: 'Linktitel',
    },
    event_link_type: {
        de: 'Linktyp',
        en: 'Link type',
        da: 'Linktype',
    },
    event_link_url: {
        de: 'URL',
        en: 'URL',
        da: 'URL',
    },
    event_add_link: {
        de: 'Link hinzufügen',
        en: 'Add link',
        da: 'Tilføj link',
    },
    event_online_link: {
        de: 'Link zur Online-Veranstaltung',
        en: 'Online Event Link',
        da: 'Link til online begivenhed',
    },
    all_events: {
        de: 'Alle Events',
        en: 'All events',
        da: 'Alle begivenheder',
    },
    all_event_types: {
        de: 'Alle Typen',
        en: 'All types',
        da: 'Alle typer',
    },
    create_event: {
        de: 'Neues Event erstellen',
        en: 'Create a new event',
        da: 'Opret en ny begivenheder',
    },
    create_event_definition: {
        de: 'Gib den Titel ein, danach kannst du Details bearbeiten.',
        en: 'Enter the title, then edit details.',
        da: 'Indtast titel, derefter kan du redigere detaljer.',
    },
    edit_event: {
        de: 'Event bearbeiten',
        en: 'Edit event',
        da: 'Rediger begivenheder',
    },
    event_release_settings: {
        de: 'Veröffentlichung',
        en: 'Release setting',
        da: 'Udgivelse',
    },
    add_event_image: {
        de: 'Eventbild hinzufügen',
        en: 'Add event image',
        da: 'Tilføj begivenhedsbillede',
    },
    add_new_event: {
        de: 'Neues Event',
        en: 'Add new event',
        da: 'Tilføj ny begivenhed',
    },
    add_new_event_title: {
        de: 'Neues Event erstellen',
        en: 'Create an event',
        da: 'Opret ny begivenhed',
    },
    delete_event: {
        de: 'Event löschen?',
        en: 'Delete event?',
        da: 'Slet begivenhed?',
    },
    deleted_events_irreversible: {
        de: 'Gelöschte Events gehen unwiderruflich verloren',
        en: 'Deleted events are permanently lost',
        da: 'Slettede events går tabt og kan ikke gendannes',
    },
    delete_event_single_or_serie: {
        de: 'Möchtest du nur dieses Event oder die gesamte Serie löschen?',
        en: 'Do you want to delete just this event or the whole series?',
        da: 'Vil du slette kun denne begivenhed eller hele serien?',
    },
    delete_event_occurrence: {
        de: 'Diesen Termin löschen',
        en: 'Delete this occurrence',
        da: 'Slet denne forekomst',
    },
    delete_event_series: {
        de: 'Gesamte Serie mit ~~count~~ Terminen löschen',
        en: 'Delete entire series with ~~count~~ occurrences',
        da: 'Slet hele serien med ~~count~~ forekomster',
    },
    confirm_delete_event: {
        de: 'Möchtest du dieses Event wirklich löschen?',
        en: 'Are you sure you want to delete this event?',
        da: 'Vil du virkelig slette denne begivenhed?',
    },
    failed_to_delete_event: {
        de: 'Das Event konnte nicht gelöscht werden. Bitte versuche es erneut.',
        en: 'The event could not be deletet. Please try again.',
        da: 'Begivenheden kunne ikke slettes. Prøv igen.',
    },
    choose_event_type: {
        de: 'Eventtyp wählen',
        en: 'Choose an event type',
        da: 'Vælg en begivenhedstype',
    },
    event_no_dates_defined: {
        de: 'Für dieses Event wurden noch keine Termine festgelegt.',
        en: 'No dates have been defined for this event yet.',
        da: 'Der er endnu ingen datoer defineret for denne begivenhed.',
    },
    event_add_date: {
        de: 'Datum hinzufügen',
        en: 'Add date',
        da: 'Tilføj dato',
    },
    event_edit_date: {
        de: 'Datum bearbeiten',
        en: 'Edit date',
        da: 'Rediger dato',
    },
    event_organizer: {
        de: 'Veranstalter',
        en: 'Organizer',
        da: 'Arrangør',
    },
    event_release_status: {
        de: 'Veröffentlichungsstatus',
        en: 'Release status',
        da: 'Udgivelsesstatus',
    },
    event_release_date: {
        de: 'Veröffentlichungsdatum',
        en: 'Release date',
        da: 'Udgivelsesdato',
    },
    event_no_release_date: {
        de: 'Noch kein Veröffentlichungsdatum festgelegt.',
        en: 'No release date has been set yet.',
        da: 'Ingen udgivelsesdato angivet endnu.',
    },
    event_without_venue: {
        de: 'Ohne Veranstaltungsort',
        en: 'Without venue',
        da: 'Uden sted',
    },
    event_image_alt_text: {
        de: 'Veranstaltungsbild',
        en: 'Event image',
        da: 'Begivenhedsbillede',
    },
    event_meeting_point: {
        de: 'Treffpunkt',
        en: 'Meeting point',
        da: 'Mødested',
    },
    event_additional_dates: {
        de: 'Weitere Termine',
        en: 'Additional dates',
        da: 'Flere datoer',
    },
    event_all_dates: {
        de: 'Alle Termine',
        en: 'All dates',
        da: 'Alle datoer',
    },
    event_teaser_tags: {
        de: 'Event-Tags',
        en: 'Tags',
        da: 'Tags',
    },
    event_image_license_unknown: {
        de: 'Unbekannte Bildlizenz',
        en: 'Unknown license',
        da: 'Ukendt licens',
    },
    event_seating_capacity_label: {
        de: 'Sitzplatzkapazität',
        en: 'Seating capacity',
        da: 'Siddepladskapacitet',
    },
    event_type_unknown: {
        de: 'Unbekannter Eventtyp',
        en: 'Unknown type',
        da: 'Ukendt type',
    },
    event_start_date: {
        de: 'Startdatum',
        en: 'Start date',
        da: 'Startdato',
    },
    event_start_time: {
        de: 'Startzeit',
        en: 'Start time',
        da: 'Starttid',
    },
    event_end_date: {
        de: 'Enddatum',
        en: 'End date',
        da: 'Slutdato',
    },
    event_end_time: {
        de: 'Endzeit',
        en: 'End time',
        da: 'Sluttid',
    },
    event_entry_time: {
        de: 'Einlasszeit',
        en: 'Entry time',
        da: 'Indgangstid',
    },
    event_duration_minutes: {
        de: 'Dauer in Minuten',
        en: 'Duration in minutes',
        da: 'Varighed i minutter',
    },
    event_all_day: {
        de: 'Ganztägig',
        en: 'All day',
        da: 'Hele dagen',
    },
    event_starts_short: {
        de: 'Beginn',
        en: 'Starts',
        da: 'Start',
    },
    event_starts: {
        de: 'Event beginnt',
        en: 'Event starts',
        da: 'Begivenheder starter',
    },
    event_ends_short: {
        de: 'Ende',
        en: 'Ends',
        da: 'Slut',
    },
    event_entry_time_short: {
        de: 'Einlass',
        en: 'Doors open',
        da: 'Dørene åbner',
    },
    event_tags_heading: {
        de: 'Eventtypen',
        en: 'Event type',
        da: 'Begivenhedstyper',
    },
    event_language_edit: {
        de: 'Sprachen bearbeiten',
        en: 'Edit language',
        da: 'Rediger sprog',
    },
    event_edit_url_title: {
        de: 'Link bearbeiten',
        en: 'Edit link',
        da: 'Rediger link',
    },
    event_url: {
        de: 'Link URL',
        en: 'Link URL',
        da: 'Link URL',
    },
    event_url_title: {
        de: 'Bezeichnung',
        en: 'Label',
        da: 'Navn',
    },
    event_url_type: {
        de: 'Link Typ',
        en: 'Link type',
        da: 'Link type',
    },
    event_add_url: {
        de: 'Link hinzufügen',
        en: 'Add link',
        da: 'Tilføj link',
    },
    event_participation_info: {
        de: 'Infos für Teilnehmende',
        en: 'Participant information',
        da: 'Deltagerinformation',
    },
    event_participation_info_text: {
        de: 'Allgemeine Informationen',
        en: 'General Information',
        da: 'Generel information',
    },
    event_participation_meeting_point: {
        de: 'Angaben zum Treffpunkt',
        en: 'Meeting Point',
        da: 'Mødested',
    },
    event_types_and_genre: {
        de: "Typen und Genres",
        en: "Type and genres",
        da: "Typer og genrer"
    },
    select_event_type: {
        de: "Veranstaltungstyp auswählen",
        en: "Select event type",
        da: "Vælg en begivenhedstype"
    },
    select_event_genre: {
        de: "Genre auswählen",
        en: "Select genre",
        da: "Vælg genre"
    },
    event_age: {
        de: 'Alter',
        en: 'Age',
        da: 'alder',
    },
    event_age_years: {
        de: 'Jahre',
        en: 'years',
        da: 'år',
    },
    event_min_age: {
        de: 'Alter von',
        en: 'Min. Age',
        da: 'Alder fra',
    },
    event_max_age: {
        de: 'Alter bis',
        en: 'Max. Age',
        da: 'Alder til',
    },
    event_filter_categories: {
        de: 'Kategorien',
        en: 'Categories',
        da: 'Kategorier',
    },
    all_event_categories: {
        de: 'Alle Kategorien',
        en: 'All categories',
        da: 'Alle kategorier',
    },
    event_filter_category_culture: {
        de: 'Kultur',
        en: 'Culture',
        da: 'Kultur',
    },
    event_filter_category_education: {
        de: 'Bildung',
        en: 'Education',
        da: 'Uddannelse',
    },
    event_filter_category_sports: {
        de: 'Sport',
        en: 'Sports',
        da: 'Sport',
    },
    event_filter_category_leisure: {
        de: 'Freizeit',
        en: 'Leisure',
        da: 'Fritid',
    },
    event_filter_category_family: {
        de: 'Familie',
        en: 'Family',
        da: 'Familie',
    },
    event_filter_category_society: {
        de: 'Gesellschaft',
        en: 'Society',
        da: 'Samfund',
    },
    event_filter_category_creative: {
        de: 'Kreativ',
        en: 'Creative',
        da: 'Kreativt',
    },
    event_filter_category_food_and_drink: {
        de: 'Essen & Trinken',
        en: 'Food & drink',
        da: 'Mad & drikke',
    },
    event_filter_from: {
        de: 'Von',
        en: 'From',
        da: 'Fra',
    },
    event_filter_max_price: {
        de: 'Höchster Preis',
        en: 'Max price',
        da: 'Højeste pris',
    },
    event_filter_to: {
        de: 'Bis',
        en: 'To',
        da: 'Til',
    },
    event_age_from: {
        de: "Ab ~~min~~ Jahren",
        en: "From ~~min~~ years",
        da: "Fra ~~min~~ år",
    },
    event_age_until: {
        de: "Bis ~~max~~ Jahre",
        en: "Up to ~~max~~ years",
        da: "Op til ~~max~~ år",
    },
    event_age_between: {
        de: "Von ~~min~~ bis ~~max~~ Jahren",
        en: "From ~~min~~ to ~~max~~ years",
        da: "Fra ~~min~~ til ~~max~~ år",
    },
    event_max_attendees: {
        de: "Maximal Teilnehmende",
        en: "Max attendees",
        da: "Maks deltagere",
    },
    event_max_count_attendees: {
        de: "Maximal ~~count~~ Teilnehmende",
        en: "Max ~~count~~ attendees",
        da: "Maks ~~count~~ deltagere",
    },
    event_price: {
        de: 'Preis',
        en: 'Price',
        da: 'Pris',
    },
    event_price_not_specified: {
        de: 'Nicht angegeben',
        en: 'Not specified',
        da: 'Ikke angivet',
    },
    event_price_regular: {
        de: 'Regulärer Preis',
        en: 'Regular price',
        da: 'Almindelig pris',
    },
    event_price_free: {
        de: 'Kostenlos',
        en: 'Free',
        da: 'Gratis',
    },
    event_price_donation: {
        de: 'Spende / freiwilliger Beitrag',
        en: 'Donation / voluntary contribution',
        da: 'Donation / frivilligt bidrag',
    },
    event_price_tiered: {
        de: 'Gestaffelte Preise',
        en: 'Tiered prices',
        da: 'Differentierede priser',
    },
    event_price_range: {
        de: 'Preisspanne',
        en: 'Price range',
        da: 'Prislag',
    },
    event_min_price: {
        de: 'Mindestpreis',
        en: 'Minimum price',
        da: 'Mindste pris',
    },
    event_max_price: {
        de: 'Höchstpreis',
        en: 'Maximum price',
        da: 'Højeste pris',
    },
    event_price_sentence: {
        de: '~~value~~ ~~currency~~',
        en: '~~value~~ ~~currency~~',
        da: '~~value~~ ~~currency~~',
    },
    event_price_from_sentence: {
        de: 'Ab ~~min~~ ~~currency~~',
        en: 'From ~~min~~ ~~currency~~',
        da: 'Fra ~~min~~ ~~currency~~',
    },
    event_price_until_sentence: {
        de: 'Bis ~~max~~ ~~currency~~',
        en: 'Up to ~~max~~ ~~currency~~',
        da: 'Op til ~~max~~ ~~currency~~',
    },
    event_price_between_sentence: {
        de: '~~min~~ bis ~~max~~ ~~currency~~',
        en: '~~min~~ to ~~max~~ ~~currency~~',
        da: '~~min~~ til ~~max~~ ~~currency~~',
    },
    event_price_type: {
        de: 'Preisart',
        en: 'Price Type',
        da: 'Pristype',
    },
    event_price_type_not_specified: {
        de: 'Keine Angabe',
        en: 'not specified',
        da: 'ingen oplysninger',
    },
    event_price_type_regular: {
        de: 'Normalpreis',
        en: 'regular price',
        da: 'normalpris',
    },
    event_price_type_free: {
        de: 'Kostenfrei',
        en: 'free',
        da: 'gratis',
    },
    event_price_type_donation: {
        de: 'Spende',
        en: 'donation',
        da: 'donation',
    },
    event_ticket_information: {
        de: 'Ticketinformationen',
        en: 'Ticket information',
        da: 'Billetinformation',
    },
    event_ticket_options: {
        de: 'Ticketoptionen',
        en: 'Ticket options',
        da: 'Billetmuligheder',
    },
    event_advance_ticket: {
        de: 'Vorverkauf',
        en: 'Advance ticket sales',
        da: 'Forsalg',
    },
    event_presale_fee_applies: {
        de: 'zzgl. Vorverkaufsgebühr',
        en: 'plus presale service fee',
        da: 'ekskl. forsalggebyr',
    },
    event_ticket_required: {
        de: 'Ticket erforderlich',
        en: 'Ticket Required',
        da: 'Billet påkrævet',
    },
    event_on_site_ticket_sales: {
        de: 'Einlasskasse vorhanden',
        en: 'Tickets available on site',
        da: 'Billetsalg på stedet',
    },
    event_registration_required: {
        de: 'Registrierung erforderlich',
        en: 'Registration required',
        da: 'Tilmelding påkrævet',
    },
    event_reduced_price_available: {
        de: 'Reduzierter Preis verfügbar',
        en: 'Reduced-price tickets available',
        da: 'Billetter med reduceret pris tilgængelige'
    },
    event_ticket_link: {
        de: 'Link zu Tickets',
        en: 'Link to tickets',
        da: 'Link til billetter'
    },
    event_occasion_type: {
        de: 'Anlass',
        en: 'Occasion',
        da: 'Anledning',
    },
    event_load_error: {
        de: 'Veranstaltung konnte nicht geladen werden.',
        en: 'Unable to load event.',
        da: 'Begivenheden kunne ikke indlæses.',
    },
    event_description_required: {
        de: 'Eine Beschreibung ist erforderlich',
        en: 'A description is required',
        da: 'En beskrivelse er påkrævet',
    },
    event_release_draft: {
        de: 'Entwurf',
        en: 'Draft',
        da: 'Udkast',
    },
    event_release_review: {
        de: 'Korrektur',
        en: 'Review',
        da: 'Korrektur',
    },
    event_release_released: {
        de: 'Veröffentlicht',
        en: 'Released',
        da: 'Udgivet',
    },
    event_release_cancelled: {
        de: 'Abgesagt',
        en: 'Cancelled',
        da: 'Aflyst',
    },
    event_release_deferred: {
        de: 'Verschoben',
        en: 'Deferred',
        da: 'Udsat',
    },
    event_release_rescheduled: {
        de: 'Verlegt',
        en: 'Reschreduled',
        da: 'Flyttet',
    },
    notification_cant_see_events_title: {
        de: 'Warum kann ich keine Events sehen?',
        en: 'Why can’t I see any events?',
        da: 'Hvorfor kan jeg ikke se nogen begivenheder?',
    },
    event_date_delete_confirm: {
        de: 'Möchtest du dieses Datum wirklich löschen?',
        en: 'Are you sure you want to delete this date?',
        da: 'Er du sikker på, at du vil slette denne dato?',
    },
    event_select_venue: {
        de: 'Veranstaltungsort wählen',
        en: 'Select venue',
        da: 'Vælg sted',
    },
    event_remove_venue: {
        de: 'Veranstaltungsort entfernen',
        en: 'Remove venue',
        da: 'Fjern sted',
    },
    event_remove_date: {
        de: 'Datum entfernen',
        en: 'Remove date',
        da: 'Fjern dato',
    },
    event_date_ticket_link: {
        de: 'Ticket-Link für diesen Termin',
        en: 'Ticket link for this date',
        da: 'Billetlink for denne dato',
    },
    event_date_description: {
        de: 'Beschreibung für diesen Termin',
        en: 'Description for this date',
        da: 'Beskrivelse for denne dato',
    },
    event_date_venue_name: {
        de: 'Veranstaltungsort für diesen Termin',
        en: 'Venue for this date',
        da: 'Sted for denne dato',
    },
    event_date_select_location: {
        de: 'Ort für diesen Termin wählen',
        en: 'Select location for this date',
        da: 'Vælg placering for denne dato',
    },
    event_release_notice: {
        de: 'Bitte veröffentliche ausschließlich Inhalte, für die du über alle erforderlichen Nutzungsrechte verfügst und die keine Urheberrechte Dritter verletzen. Mit dem Klick auf „Speichern“ bestätigst du dies.',
        en: 'Please publish only content for which you hold all necessary usage rights and which does not infringe third-party copyrights. By clicking “Save”, you confirm this.',
        da: 'Publicér kun indhold, som du har alle nødvendige brugsrettigheder til, og som ikke krænker tredjeparts ophavsret. Ved at klikke på “Gem” bekræfter du dette.',
    },
    event_main_image: {
        de: 'Hauptbild',
        en: 'Main image',
        da: 'Hovedbillede'
    },
    event_online_event: {
        de: 'Online Veranstaltung',
        en: 'Online event',
        da: 'Online begivenhed'
    },
    event_online_registration_link: {
        de: "Anmeldelink",
        en: "Registration link",
        da: "Tilmeldingslink"
    },
    event_online_registration_last_date: {
        de: "Anmeldeschluss",
        en: "Registration deadline",
        da: "Tilmeldingsfrist"
    },
    event_online_contact_mail: {
        de: "Kontakt E-Mail",
        en: "Contact email",
        da: "Kontakt e-mail"
    },
    event_online_contact_phone: {
        de: "Kontakt Telefon",
        en: "Contact phone",
        da: "Kontakt telefon"
    },
    count_event_date: {
        de: '1 Termin',
        en: '1 event date',
        da: '1 dato',
    },
    count_event_dates: {
        de: '~~count~~ Termine',
        en: '~~count~~ event dates',
        da: '~~count~~ datoer',
    },
    link_event_not_found: {
        de: 'Diese Veranstaltung ist nicht verfügbar',
        en: 'This event is not available',
        da: 'Denne begivenhed er ikke tilgængelig',
    },
    no_events_to_display: {
        de: 'Keine passenden Veranstaltungen gefunden',
        en: 'No matching events found',
        da: 'Ingen passende arrangementer fundet',
    },
    no_events_to_display_message: {
        de: 'Wähle einen anderen Zeitraum oder passe die Sucheinstellungen an.',
        en: 'Choose a different date range or adjust your search settings.',
        da: 'Vælg en anden periode eller juster dine søgeindstillinger.',
    },
    event_without_date_message: {
        de: 'Dieses Event hat kein Datum!',
        en: 'This event has no date!',
        da: 'Denne begivenhed har ingen dato!',
    },
    more_events_label: {
        de: "+~~moreCount~~ weitere",
        en: "+~~moreCount~~ more events",
        da: "+~~moreCount~~ flere",
    }
}

export default uranusI18nEventTranslations
