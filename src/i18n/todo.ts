/*
    src/i18n/todo.ts
 */

import type { UranusLocaleKey } from './uranus-i18n-index.ts'

export const uranusI18nTodoTranslations: Record<string, Record<UranusLocaleKey, string>> = {
    delete_todo: {
        de: 'Aufgabe löschen',
        en: 'Delete todo',
        da: 'Slet opgave',
    },
    delete_todo_question: {
        de: 'Diese Aufgabe wirklich löschen?',
        en: 'Delete this todo?',
        da: 'Slette denne opgave?',
    },
    failed_to_load_todos: {
        de: 'Aufgaben konnten nicht geladen werden',
        en: 'Could not load todos',
        da: 'Kunne ikke hente opgaver',
    },
    failed_to_delete_todo: {
        de: 'Die Aufgaben konnte nicht gelöscht werden. Bitte versuche es erneut.',
        en: 'The todo could not be deletet. Please try again.',
        da: 'Opgaven kunne ikke slettes. Prøv igen.',
    },

}

export default uranusI18nTodoTranslations