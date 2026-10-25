/*
    src/i18n/image.ts
 */

import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nImageTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    image_uploading: {
        de: 'Bild wird hochgeladen …',
        en: 'Uploading image …',
        da: 'Uploader billede …',
    },
    image_upload_progress: {
        de: 'Bild wird hochgeladen: {progress} %',
        en: 'Uploading image: {progress} %',
        da: 'Uploader billede: {progress} %',
    },
    image_processing: {
        de: 'Bild wird gespeichert …',
        en: 'Saving image …',
        da: 'Gemmer billede …',
    },
    image_file_too_large: {
        de: 'Die Bilddatei ist zu groß.',
        en: 'The image file is too large.',
        da: 'Billedfilen er for stor.',
    },
    image_not_authorized: {
        de: 'Keine Berechtigung zum Speichern des Bildes.',
        en: 'Not authorized to save the image.',
        da: 'Ingen tilladelse til at gemme billedet.',
    },
    image_save_failed: {
        de: 'Das Bild konnte nicht gespeichert werden. Bitte versuche es erneut.',
        en: 'The image could not be saved. Please try again.',
        da: 'Billedet kunne ikke gemmes. Prøv igen.',
    },
    image_alt_text: {
        de: 'Alternativtext',
        en: 'Alt Text',
        da: 'Alternativtekst',
    },
    image_creator_name: {
        de: 'Urheber / Fotograf',
        en: 'Creator / Photographer',
        da: 'Ophavsmand / Fotograf',
    },
    image_copyright: {
        de: 'Copyright / Rechteinhaber',
        en: 'Copyright / Rights Holder',
        da: 'Copyright / Rettighedshaver',
    },
    image_license: {
        de: 'Lizenz',
        en: 'License',
        da: 'Licens',
    },
    image_ai_label: {
        de: 'KI-Status',
        en: 'AI label',
        da: 'AI-status',
    },
    ai_label_none: {
        de: 'Keine KI verwendet',
        en: 'No AI',
        da: 'Ingen AI anvendt',
    },
    ai_label_ai: {
        de: 'Mit KI erstellt/bearbeitet',
        en: 'Basic icon',
        da: 'Med AI oprettet/redigeret',
    },
    ai_label_ai_generated: {
        de: 'KI-generiert',
        en: 'Fully AI-generated',
        da: 'AI-genereret',
    },
    ai_label_ai_modified: {
        de: 'Teilweise mit KI bearbeitet',
        en: 'Partially AI-modified',
        da: 'Delvist AI-redigeret',
    },
    image_focus_x: {
        de: 'Fokus X',
        en: 'Focus X',
        da: 'Fokus X',
    },
    image_focus_y: {
        de: 'Fokus Y',
        en: 'Focus Y',
        da: 'Fokus Y',
    },
    image_description: {
        de: 'Beschreibung',
        en: 'Description',
        da: 'Beskrivelse',
    },
    set_focus_point: {
        de: 'Fokuspunkt setzen',
        en: 'Set focus point',
        da: 'Sæt fokuspunkt',
    },
    cancel_focus_point: {
        de: 'Fokuspunkt aufheben',
        en: 'Cancel focus point',
        da: 'Annuller fokuspunkt',
    },
    remove_focus_point: {
        de: 'Fokuspunkt entfernen',
        en: 'Remove focus point',
        da: 'Fjern fokuspunkt',
    },
    choose_image: {
        de: 'Bild bearbeiten',
        en: 'Edit image',
        da: 'Rediger billede',
    },
    edit_image: {
        de: 'Bild bearbeiten',
        en: 'Edit image',
        da: 'Rediger billede',
    },
    add_image: {
        de: 'Bild hinzufügen',
        en: 'Add image',
        da: 'Tilføj billede',
    },
    delete_image_alert: {
        de: 'Willst du dieses Bild wirklich löschen?',
        en: 'Do you really want to delete this image?',
        da: 'Vil du virkelig slette dette billede?',
    },
}

export default uranusI18nImageTranslations
