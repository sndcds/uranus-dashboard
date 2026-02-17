export const SUPPORTED_UI_LANGUAGES = ['de', 'da', 'en'] as const
export type UiLanguage = typeof SUPPORTED_UI_LANGUAGES[number]