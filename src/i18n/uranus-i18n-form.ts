import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nFormTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    required_field: {
        de: 'Pflichtfeld',
        en: 'This field is required',
        da: 'Feltet er påkrævet',
    },
    organization_name: {
        de: 'Organisationsname',
        en: 'Organization name',
        da: 'Organisationsnavn',
    },
    organization_edit_description: {
        de: 'Überprüfe und aktualisiere die Daten deiner Organisation.',
        en: 'Review and update your organization details.',
        da: 'Gennemse og opdater oplysningerne om din arrangør.',
    },
}