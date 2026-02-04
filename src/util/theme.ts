import { onMounted } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const applyTheme = (theme: ThemeMode) => {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
}

export const useTheme = (theme: ThemeMode) => {
    onMounted(() => {
        applyTheme(theme)
    })
}
