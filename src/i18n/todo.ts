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
    }
}

export default uranusI18nTodoTranslations