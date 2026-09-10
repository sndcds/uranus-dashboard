import type { UranusLocaleKey } from './uranus-i18n-index'

export const uranusI18nNotificationTranslations: Record<
  string,
  Record<UranusLocaleKey, string>
> = {
  notification_center: {
    de: 'Benachrichtigungen',
    en: 'Notifications',
    da: 'Notifikationer',
  },
  notification_update_error: {
    de: 'Die Benachrichtigungen konnten nicht aktualisiert werden. Bitte versuche es erneut.',
    en: 'Notifications could not be updated. Please try again.',
    da: 'Notifikationerne kunne ikke opdateres. Prøv igen.',
  },
  notification_retry: {
    de: 'Erneut versuchen',
    en: 'Try again',
    da: 'Prøv igen',
  },
  notification_empty: {
    de: 'Du hast keine Benachrichtigungen.',
    en: 'You have no notifications.',
    da: 'Du har ingen notifikationer.',
  },
  notification_unread: {
    de: 'Ungelesen',
    en: 'Unread',
    da: 'Ulæst',
  },
  notification_member_joined_title: {
    de: 'Neues Teammitglied',
    en: 'New team member',
    da: 'Nyt teammedlem',
  },
  notification_member_joined_description: {
    de: '{member} ist dem Team von {organization} beigetreten.',
    en: '{member} has joined the team at {organization}.',
    da: '{member} er blevet en del af teamet hos {organization}.',
  },
  notification_permissions_hint: {
    de: 'Das neue Teammitglied ist ohne zusätzliche Berechtigungen beigetreten. Prüfe jetzt, welche Bereiche es verwalten darf.',
    en: 'The new member joined without additional permissions. Review which areas they may manage.',
    da: 'Det nye medlem blev tilføjet uden yderligere rettigheder. Kontrollér, hvilke områder medlemmet må administrere.',
  },
  notification_permissions_action: {
    de: 'Berechtigungen festlegen',
    en: 'Set permissions',
    da: 'Indstil rettigheder',
  },
  notification_team_joined_title: {
    de: 'Willkommen im Team',
    en: 'Welcome to the team',
    da: 'Velkommen til teamet',
  },
  notification_team_joined_description: {
    de: 'Du bist jetzt Mitglied im Team von {organization}. Deine Mitgliedschaft wurde erfolgreich aktiviert.',
    en: 'You are now a member of the team at {organization}. Your membership has been activated.',
    da: 'Du er nu medlem af teamet hos {organization}. Dit medlemskab er aktiveret.',
  },
  notification_joined_hint: {
    de: 'Welche Bereiche du bearbeiten kannst, hängt von den Berechtigungen ab, die dir die Organisation zuweist.',
    en: 'The areas you can edit depend on the permissions assigned by the organization.',
    da: 'De områder, du kan redigere, afhænger af de rettigheder, organisationen tildeler dig.',
  },
  notification_open_organization: {
    de: 'Organisation öffnen',
    en: 'Open organization',
    da: 'Åbn organisation',
  },
  notification_mark_read: {
    de: 'Als gelesen markieren',
    en: 'Mark as read',
    da: 'Markér som læst',
  },
  notification_dismiss: {
    de: 'Ausblenden',
    en: 'Dismiss',
    da: 'Skjul',
  },
  notification_load_more: {
    de: 'Weitere Benachrichtigungen laden',
    en: 'Load more notifications',
    da: 'Indlæs flere notifikationer',
  },
  notification_generic_title: {
    de: 'Neue Benachrichtigung',
    en: 'New notification',
    da: 'Ny notifikation',
  },
  notification_generic_description: {
    de: 'Es gibt Neuigkeiten für dich.',
    en: 'There is an update for you.',
    da: 'Der er nyt til dig.',
  },
  notification_open: {
    de: 'Öffnen',
    en: 'Open',
    da: 'Åbn',
  },
  notification_member_fallback: {
    de: 'Ein neues Mitglied',
    en: 'A new member',
    da: 'Et nyt medlem',
  },
  notification_member_active: {
    de: 'Mitglied beigetreten',
    en: 'Member joined',
    da: 'Medlem tiltrådt',
  },
  notification_invitation_pending: {
    de: 'Einladung ausstehend',
    en: 'Invitation pending',
    da: 'Invitation afventer',
  },
}
