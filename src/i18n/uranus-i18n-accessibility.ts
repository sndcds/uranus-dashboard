/*
    src/i18n/uranus-i18n-accessibility.ts

    2026-02-15, Roald
 */

export const uranusI18nAccessibilityTranslations: Record<string, Record<'en' | 'de' | 'da', string>> = {
    space_accessibility: {
        en: 'Space Accessibility Information',
        de: 'Barrierefreiheit des Veranstaltungsorts',
        da: 'Tilgængelighed for lokalet',
    },
    space_accessibility_summary: {
        en: 'Accessibility summary',
        de: 'Barrierefreiheits-Zusammenfassung',
        da: 'Tilgængelighedsoversigt',
    },
    physical_accessibility: {
        en: 'Physical Accessibility',
        de: 'Physische Barrierefreiheit',
        da: 'Fysisk tilgængelighed',
    },
    assistance_animals: {
        en: 'Assistance Animals',
        de: 'Assistenztiere',
        da: 'Service- og hjælpedyr',
    },
    hearing_accessibility: {
        en: 'Hearing Accessibility',
        de: 'Hörbarrierefreiheit',
        da: 'Høretilgængelighed',
    },
    visual_accessibility: {
        en: 'Visual Accessibility',
        de: 'Visuelle Barrierefreiheit',
        da: 'Visuel tilgængelighed',
    },
    cognitive_accessibility: {
        en: 'Cognitive Accessibility',
        de: 'Kognitive Barrierefreiheit',
        da: 'Kognitiv tilgængelighed',
    },
    digital_accessibility: {
        en: 'Digital Accessibility',
        de: 'Digitale Barrierefreiheit',
        da: 'Digital tilgængelighed',
    },
    wheelchair_accessible: {
        en: "Wheelchair Accessible",
        de: "Rollstuhlgerecht",
        da: "Kørestolsadgang",
    },
    accessible_parking: {
        en: "Accessible Parking",
        de: "Barrierefreier Parkplatz",
        da: "Handicapparkering",
    },
    elevator_available: {
        en: "Elevator Available",
        de: "Aufzug Verfügbar",
        da: "Elevator tilgængelig",
    },
    ramp_available: {
        en: "Ramp Available",
        de: "Rampe Verfügbar",
        da: "Rampe tilgængelig",
    },
    step_free_access: {
        en: "Step-Free Access",
        de: "Stufenfreier Zugang",
        da: "Trinfri adgang",
    },
    accessible_restroom: {
        en: "Accessible Restroom",
        de: "Barrierefreies WC",
        da: "Handicapvenligt toilet",
    },
    reserved_seating: {
        en: "Reserved Seating",
        de: "Reservierte Sitzplätze",
        da: "Reserveret siddeplads",
    },
    service_animals_allowed: {
        en: "Service Animals Allowed",
        de: "Assistenzhunde Erlaubt",
        da: "Servicehunde tilladt",
    },
    sign_language_interpretation: {
        en: "Sign Language Interpretation",
        de: "Gebärdensprachdolmetschen",
        da: "Tegnsprogstolkning",
    },
    captioning_available: {
        en: "Captioning Available",
        de: "Untertitel Verfügbar",
        da: "Undertekster tilgængelige",
    },
    hearing_loop: {
        en: "Hearing Loop",
        de: "Hörschleife",
        da: "Høreloop",
    },
    assistive_listening_devices: {
        en: "Assistive Listening Devices",
        de: "Hilfshörgeräte",
        da: "Hjælpemidler til lytning",
    },
    audio_description: {
        en: "Audio Description",
        de: "Audio Beschreibung",
        da: "Audiobeskrivelse",
    },
    braille_materials: {
        en: "Braille Materials",
        de: "Braille Materialien",
        da: "Braille-materialer",
    },
    high_contrast_signage: {
        en: "High Contrast Signage",
        de: "Hochkontrastbeschilderung",
        da: "Højkontrast skilte",
    },
    tactile_guides: {
        en: "Tactile Guides",
        de: "Taktilführer",
        da: "Taktil guider",
    },
    easy_read_materials: {
        en: "Easy Read Materials",
        de: "Leicht lesbare Materialien",
        da: "Letlæselige materialer",
    },
    quiet_space: {
        en: "Quiet Space",
        de: "Ruhiger Raum",
        da: "Stille område",
    },
    clear_signage: {
        en: "Clear Signage",
        de: "Klare Beschilderung",
        da: "Klar skiltning",
    },
    trained_staff: {
        en: "Trained Staff",
        de: "Ausgebildetes Personal",
        da: "Trænet personale",
    },
    low_light_environment: {
        en: "Low Light Environment",
        de: "Dämmerumgebung",
        da: "Lavt lysmiljø",
    },
    accessible_website: {
        en: "Accessible Website",
        de: "Barrierefreie Webseite",
        da: "Tilgængelig hjemmeside",
    },
    screen_reader_support: {
        en: "Screen Reader Support",
        de: "Unterstützung für Bildschirmleser",
        da: "Skærmlæser support",
    },
    keyboard_navigation: {
        en: "Keyboard Navigation",
        de: "Tastaturnavigation",
        da: "Tastaturnavigation",
    },
    voice_command_support: {
        en: "Voice Command Support",
        de: "Sprachsteuerung Unterstützung",
        da: "Stemmekommando support",
    }
}

export const uranusI18nAccessibilityFlags = [
    {
        topic: 1,
        topic_name: "physical_accessibility",
        flags: [
            { id: 0, name: "wheelchair_accessible" },
            { id: 1, name: "accessible_parking" },
            { id: 2, name: "elevator_available" },
            { id: 3, name: "ramp_available" },
            { id: 4, name: "step_free_access" },
            { id: 5, name: "accessible_restroom" },
            { id: 6, name: "reserved_seating" },
        ],
    },
    {
        topic: 2,
        topic_name: "assistance_animals",
        flags: [
            { id: 7, name: "service_animals_allowed" },
        ],
    },
    {
        topic: 3,
        topic_name: "hearing_accessibility",
        flags: [
            { id: 14, name: "sign_language_interpretation" },
            { id: 15, name: "captioning_available" },
            { id: 16, name: "hearing_loop" },
            { id: 17, name: "assistive_listening_devices" },
            { id: 24, name: "audio_description" },
        ],
    },
    {
        topic: 4,
        topic_name: "visual_accessibility",
        flags: [
            { id: 25, name: "braille_materials" },
            { id: 26, name: "high_contrast_signage" },
            { id: 27, name: "tactile_guides" },
        ],
    },
    {
        topic: 5,
        topic_name: "cognitive_accessibility",
        flags: [
            { id: 34, name: "easy_read_materials" },
            { id: 35, name: "quiet_space" },
            { id: 36, name: "clear_signage" },
            { id: 37, name: "trained_staff" },
            { id: 38, name: "low_light_environment" },
        ],
    },
    {
        topic: 6,
        topic_name: "digital_accessibility",
        flags: [
            { id: 44, name: "accessible_website" },
            { id: 45, name: "screen_reader_support" },
            { id: 46, name: "keyboard_navigation" },
            { id: 47, name: "voice_command_support" },
        ],
    },
]