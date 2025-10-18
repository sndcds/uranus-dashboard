// src/i18n/index.js
import { createI18n } from 'vue-i18n'

// Define messages for different locales
const messages = {
    de: {
        logout: 'Abmelden',
        settings: 'Einstellungen',
        welcome: 'Willkommen',
        goodbye: 'Auf Wiedersehen',
        dashboard: 'Übersicht',
        organizers: 'Organisationen',
        venues: 'Spielstätten',
        create_organizer: 'Organisation erstellen',
        failed_to_create_organizer: 'Erstellen der Organisation fehlgeschlagen',
        organizer_created: 'Organisation erfolgreich erstellt',
        unknown_error: 'Unbekannter Fehler',
        oranization_name: 'Organisationsname',
        street: 'Straße',
        house_number: 'Hausnummer',
        postal_code: 'Postleitzahl',
        city: 'Stadt',
        phone: 'Telefon',
        email: 'E-Mail',
        website: 'Website',
    },
    en: {
        logout: 'Logout',
        settings: 'Settings',
        welcome: 'Welcome',
        goodbye: 'Goodbye',
        dashboard: 'Dashboard',
        organizers: 'Organizers',
        venues: 'Venues',
        create_organizer: 'Create Organizer',
        failed_to_create_organizer: 'Failed to create organizer',
        organizer_created: 'Organizer created successfully',
        unknown_error: 'Unknown error',
        organization_name: 'Organization Name',
        street: 'Street',
        house_number: 'House Number',
        postal_code: 'Postal Code',
        city: 'City',
        phone: 'Phone',
        email: 'Email',
        website: 'Website',
    },
    da: {
        logout: 'Afmeld',
        settings: 'Indstillinger',
        welcome: 'velkommen',
        goodbye: 'farvel',
        organizers: 'Organisationer',
        venues: 'Spillesteder',
        create_organizer: 'Opret organisation',
        failed_to_create_organizer: 'Oprettelse af organisation mislykkedes',
        organizer_created: 'Organisation oprettet',
        unknown_error: 'Ukendt fejl',
        organization_name: 'Organisationsnavn',
        street: 'Gade',
        house_number: 'Husnummer',
        postal_code: 'Postnummer',
        city: 'By',
        phone: 'Telefon',
        email: 'E-mail',
        website: 'Websted',
    },
}

// Create the i18n instance
const i18n = createI18n({
    legacy: false, // use Composition API
    locale: 'de',  // default locale
    fallbackLocale: 'en',
    messages
})

export default i18n