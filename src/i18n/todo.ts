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
}

export default uranusI18nTodoTranslations