import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nOrganizationTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    organization: {
        de: 'Organisation',
        en: 'Organization',
        da: 'Organisation',
    },
    organization_name: {
        de: 'Organisationsname',
        en: 'Organization name',
        da: 'Organisationsnavn',
    },
    organizations_dashboard_description: {
        de: 'Verwalte deine Organisationen.',
        en: 'Manage your organizations.',
        da: 'Administrer dine organisationer.',
    },
    organization_edit_description: {
        de: 'Überprüfe und aktualisiere die Daten deiner Organisation.',
        en: 'Review and update your organization details.',
        da: 'Gennemse og opdater oplysningerne om din arrangør.',
    },
    organization_no_membership_message: {
        de: 'Du hast noch keine Organisation für die du agieren kannst. Erstelle eine Organisation oder bitte eine andere Organisation dich ins Team einzuladen',
        en: 'You don’t have an organization to act for yet. Create an organization or ask another organization to invite you to the team.',
        da: 'Du har endnu ingen organisation, som du kan handle for. Opret en organisation eller bed en anden organisation om at invitere dig til teamet.',
    },
    organization_select_legal_form: {
        de: 'Wähle eine Organisationsform',
        en: 'Select legal form',
        da: 'Vælg en organisationsform',
    }
}