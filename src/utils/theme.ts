export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'app-theme'

const isBrowser = typeof window !== 'undefined'

export const getStoredTheme = (): ThemeMode => {
    if (!isBrowser) return 'light'
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'dark' ? 'dark' : 'light'
}

export const applyTheme = (theme: ThemeMode) => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = theme
    if (document.body) {
        document.body.dataset.theme = theme
    }
}

export const storeTheme = (theme: ThemeMode) => {
    if (!isBrowser) return
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}
