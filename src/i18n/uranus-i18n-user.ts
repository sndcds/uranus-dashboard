import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nUserTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    user_unknown: {
        de: 'Unbekannter Nutzer',
        en: 'Unknown user',
        da: 'Ukendt bruger',
    },
    user_profile_username: {
        de: 'Benutzername',
        en: 'Username',
        da: 'Brugernavn',
    },
    user_no_permissions_data_notification: {
        de: 'Du hast noch keine Berechtigungen.<br>Erfahre mehr in der Online-Hilfe.',
        en: 'You don’t have any permissions yet.<br>Learn more in the online manual.',
        da: 'Du har endnu ingen rettigheder.<br>Læs mere i online manualen',
    },
    user_profile: {
        de: 'Nutzerprofil',
        en: 'User Profile',
        da: 'Brugerprofil',
    },
    user_profile_title: {
        de: 'Dein Profil',
        en: 'Your profile',
        da: 'Din profil',
    },
    user_profile_subtitle: {
        de: 'Verwalte, wie du in der Plattform erscheinst.',
        en: 'Manage how you appear to teammates and organisers.',
        da: 'Styr hvordan andre ser dine oplysninger.',
    },
    user_profile_photo_label: {
        de: 'Profilbild',
        en: 'Profile picture',
        da: 'Profilbillede',
    },
    user_profile_photo_hint: {
        de: 'JPG oder PNG, maximal 5 MB.',
        en: 'JPG or PNG, max 5 MB.',
        da: 'JPG eller PNG, maks. 5 MB.',
    },
    user_profile_upload: {
        de: 'Neues Bild hochladen',
        en: 'Upload new photo',
        da: 'Upload nyt billede',
    },
    user_profile_remove_photo: {
        de: 'Bild entfernen',
        en: 'Remove photo',
        da: 'Fjern billede',
    },
    user_profile_display_name: {
        de: 'Anzeigename',
        en: 'Display name',
        da: 'Visningsnavn',
    },
    user_profile_first_name: {
        de: 'Vorname',
        en: 'First name',
        da: 'Fornavn',
    },
    user_profile_last_name: {
        de: 'Nachname',
        en: 'Last name',
        da: 'Efternavn',
    },
    user_profile_email: {
        de: 'E-Mail-Adresse',
        en: 'Email address',
        da: 'E-mailadresse',
    },
    user_profile_save: {
        de: 'Profil speichern',
        en: 'Save profile',
        da: 'Gem profil',
    },
    user_profile_save_success: {
        de: 'Profil wurde aktualisiert.',
        en: 'Profile updated successfully.',
        da: 'Profilen er opdateret.',
    },
    user_profile_save_error: {
        de: 'Profil konnte nicht gespeichert werden.',
        en: 'Could not save your profile.',
        da: 'Profilen kunne ikke gemmes.',
    },
    user_profile_load_error: {
        de: 'Profil konnte nicht geladen werden.',
        en: 'Could not load your profile.',
        da: 'Profilen kunne ikke indlæses.',
    },
    user_profile_loading: {
        de: 'Profil wird geladen…',
        en: 'Loading profile…',
        da: 'Indlæser profil…',
    },
    user_profile_validation_error: {
        de: 'Bitte gib Anzeigenamen und E-Mail-Adresse an.',
        en: 'Please provide a display name and email address.',
        da: 'Angiv venligst visningsnavn og e-mailadresse.',
    },
    user_profile_preferences_heading: {
        de: 'Arbeitsbereich einstellen',
        en: 'Workspace preferences',
        da: 'Arbejdsmiljø-indstillinger',
    },
    user_profile_preferences_description: {
        de: 'Sprache und Darstellungsmodus gelten überall im Dashboard.',
        en: 'Language and theme apply across your dashboard experience.',
        da: 'Sprog og tema gælder i hele dashboardet.',
    },
    user_permissions_title: {
        de: 'Berechtigungen.',
        en: 'Permissions',
        da: 'Rettigheder',
    },
    user_permissions_subtitle: {
        de: 'Benutzerrechte von [name] für [organization] verwalten.',
        en: 'These roles and capabilities are assigned to your account.',
        da: 'Disse roller og tilladelser er knyttet til din konto.',
    },
    user_permissions_loading: {
        de: 'Berechtigungen werden geladen…',
        en: 'Loading permissions…',
        da: 'Indlæser rettigheder…',
    },
    user_permissions_entities: {
        de: '[count] Einträge',
        en: '[count] entries',
        da: '[count] poster',
    },
    user_permissions_relation: {
        de: 'Relation-ID [id]',
        en: 'Relation #{id}',
        da: 'Relations-ID {id}',
    },
    user_permissions_add_event: {
        de: 'Event anlegen',
        en: 'Create event',
        da: 'Opret begivenhed',
    },
    user_permissions_edit_event: {
        de: 'Event bearbeiten',
        en: 'Edit event',
        da: 'Rediger begivenhed',
    },
    user_permissions_delete_event: {
        de: 'Event löschen',
        en: 'Delete event',
        da: 'Slet begivenhed',
    },
    user_permissions_add_space: {
        de: 'Raum anlegen',
        en: 'Create space',
        da: 'Opret lokale',
    },
    user_permissions_edit_space: {
        de: 'Raum bearbeiten',
        en: 'Edit space',
        da: 'Rediger lokale',
    },
    user_permissions_delete_space: {
        de: 'Raum löschen',
        en: 'Delete space',
        da: 'Slet lokale',
    },
    user_permissions_add_venue: {
        de: 'Spielstätte anlegen',
        en: 'Create venue',
        da: 'Opret spillested',
    },
    user_permissions_edit_venue: {
        de: 'Spielstätte bearbeiten',
        en: 'Edit venue',
        da: 'Rediger spillested',
    },
    user_permissions_delete_venue: {
        de: 'Spielstätte löschen',
        en: 'Delete venue',
        da: 'Slet spillested',
    },
    user_permissions_edit_organization: {
        de: 'Organisation bearbeiten',
        en: 'Edit organization',
        da: 'Rediger organisation',
    },
    user_permissions_delete_organization: {
        de: 'Organisation löschen',
        en: 'Delete organization',
        da: 'Slet organisation',
    },
    user_permissions_type_organization: {
        de: 'Organisationen',
        en: 'Organizations',
        da: 'Organisationer',
    },
    user_permissions_type_venue: {
        de: 'Spielstätten',
        en: 'Venues',
        da: 'Spillesteder',
    },
    user_permissions_type_space: {
        de: 'Räume',
        en: 'Spaces',
        da: 'Lokaler',
    },
    user_permissions_type_event: {
        de: 'Events',
        en: 'Events',
        da: 'Begivenheder',
    },
    user_permissions_invalid_response: {
        de: 'Antwort konnte nicht verarbeitet werden.',
        en: 'Received an unexpected response.',
        da: 'Uventet svar fra serveren.',
    },
    user_permissions_load_error: {
        de: 'Berechtigungen konnten nicht geladen werden.',
        en: 'Unable to load permissions.',
        da: 'Rettighederne kunne ikke indlæses.',
    },
    user_permissions_can_release: {
        de: 'Darf Events veröffentlichen',
        en: 'May release events',
        da: 'Må udgive arrangementer',
    },
    user_permissions_cannot_release: {
        de: 'Kann Events nicht veröffentlichen',
        en: 'Cannot release events',
        da: 'Må ikke udgive begivenheder',
    },
    user_permissions_can_view_insights: {
        de: 'Darf Event-Insights sehen',
        en: 'May view event insights',
        da: 'Må se begivenhedstatistik',
    },
    user_permissions_cannot_view_insights: {
        de: 'Kann Event-Insights nicht sehen',
        en: 'Cannot view event insights',
        da: 'Må ikke se begivenhedstatistik',
    },
    user_permissions_flag_yes: {
        de: 'Ja',
        en: 'Yes',
        da: 'Ja',
    },
    user_permissions_flag_no: {
        de: 'Nein',
        en: 'No',
        da: 'Nej',
    },
    forgot_password: {
        de: 'Passwort vergessen?',
        en: 'Forgot password?',
        da: 'Glemt adgangskode?',
    },
    forgot_password_title: {
        de: 'Passwort zurücksetzen',
        en: 'Reset password',
        da: 'Nulstil adgangskode',
    },
    forgot_password_subtitle: {
        de: 'Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.',
        en: 'Enter your email address and we will send you a reset link.',
        da: 'Indtast din e-mailadresse, så sender vi et link til nulstilling.',
    },
    forgot_password_submit: {
        de: 'Link senden',
        en: 'Send reset link',
        da: 'Send nulstillingslink',
    },
    forgot_password_sending: {
        de: 'Senden…',
        en: 'Sending…',
        da: 'Sender…',
    },
    forgot_password_success: {
        de: 'Wenn ein Konto existiert, wurde eine E-Mail zum Zurücksetzen versendet.',
        en: 'If an account exists, a reset email has been sent.',
        da: 'Hvis en konto findes, er der sendt en e-mail med nulstillingslink.',
    },
    forgot_password_error: {
        de: 'Zurücksetzen fehlgeschlagen (Status {status}).',
        en: 'Password reset failed (status {status}).',
        da: 'Nulstilling mislykkedes (status {status}).',
    },
    forgot_password_error_generic: {
        de: 'Zurücksetzen fehlgeschlagen.',
        en: 'Password reset failed.',
        da: 'Nulstilling mislykkedes.',
    },
    back_to_login: {
        de: 'Zurück zur Anmeldung',
        en: 'Back to login',
        da: 'Tilbage til login',
    },
    reset_password_title: {
        de: 'Neues Passwort setzen',
        en: 'Choose a new password',
        da: 'Vælg en ny adgangskode',
    },
    reset_password_subtitle: {
        de: 'Wähle ein neues Passwort und bestätige es.',
        en: 'Enter and confirm your new password.',
        da: 'Indtast og bekræft din nye adgangskode.',
    },
    new_password: {
        de: 'Neues Passwort',
        en: 'New password',
        da: 'Ny adgangskode',
    },
    confirm_password: {
        de: 'Passwort bestätigen',
        en: 'Confirm password',
        da: 'Bekræft adgangskode',
    },
    confirm_password_placeholder: {
        de: 'Bestätige dein Passwort',
        en: 'Re-enter your password',
        da: 'Gentag adgangskoden',
    },
    reset_password_submit: {
        de: 'Passwort speichern',
        en: 'Save new password',
        da: 'Gem ny adgangskode',
    },
    reset_password_submitting: {
        de: 'Speichere…',
        en: 'Saving…',
        da: 'Gemmer…',
    },
    reset_password_missing: {
        de: 'Bitte fülle beide Passwortfelder aus.',
        en: 'Please fill in both password fields.',
        da: 'Udfyld begge adgangskodefelter.',
    },
    reset_password_mismatch: {
        de: 'Die Passwörter stimmen nicht überein.',
        en: 'Passwords do not match.',
        da: 'Adgangskoderne er ikke ens.',
    },
    reset_password_missing_token: {
        de: 'Der Link ist ungültig oder abgelaufen.',
        en: 'The reset link is invalid or has expired.',
        da: 'Linket er ugyldigt eller udløbet.',
    },
    reset_password_success: {
        de: 'Dein Passwort wurde zurückgesetzt. Du wirst gleich weitergeleitet.',
        en: 'Your password has been reset. Redirecting…',
        da: 'Din adgangskode er nulstillet. Du viderestilles om et øjeblik.',
    },
    reset_password_failed: {
        de: 'Zurücksetzen fehlgeschlagen (Status {status}).',
        en: 'Password reset failed (status {status}).',
        da: 'Nulstilling mislykkedes (status {status}).',
    },
    reset_password_error_generic: {
        de: 'Zurücksetzen fehlgeschlagen.',
        en: 'Password reset failed.',
        da: 'Nulstilling mislykkedes.',
    },
    activate_account: {
        de: 'Konto aktivieren',
        en: 'Activate Account',
        da: 'Aktiver konto',
    },
    activate_account_subtitle: {
        de: 'Bitte warten, während wir dein Konto aktivieren.',
        en: 'Please wait while we activate your account.',
        da: 'Vent venligst, mens vi aktiverer din konto.',
    },
    activating_account: {
        de: 'Konto wird aktiviert…',
        en: 'Activating account…',
        da: 'Aktiverer konto…',
    },
    activation_success: {
        de: 'Dein Konto wurde erfolgreich aktiviert!',
        en: 'Your account has been successfully activated!',
        da: 'Din konto er blevet aktiveret!',
    },
    redirecting_to_login: {
        de: 'Du wirst zur Anmeldeseite weitergeleitet…',
        en: 'Redirecting you to the login page…',
        da: 'Sender dig videre til login…',
    },
    activation_no_token: {
        de: 'Kein Aktivierungstoken gefunden. Bitte überprüfe den Link aus deiner E-Mail.',
        en: 'No activation token provided. Please check the link from your email.',
        da: 'Intet aktiveringstoken fundet. Tjek venligst linket fra din e-mail.',
    },
    activation_failed: {
        de: 'Kontoaktivierung fehlgeschlagen. Bitte versuche es erneut oder kontaktiere den Support.',
        en: 'Account activation failed. Please try again or contact support.',
        da: 'Kontoaktivering mislykkedes. Prøv igen eller kontakt support.',
    },
}