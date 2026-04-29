/*
    src/composable/useTheme.ts
 */

import { ref, onMounted } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const applyTheme = (theme: ThemeMode) => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
}

export const getTheme = (): ThemeMode => {
    if (typeof document === 'undefined') return 'light'

    return document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light'
}

export const useTheme = (initialTheme?: ThemeMode) => {
    const theme = ref<ThemeMode>(initialTheme ?? getTheme())

    const setTheme = (t: ThemeMode) => {
        theme.value = t
        applyTheme(t)
    }

    onMounted(() => {
        // sync with DOM in case it changed externally
        theme.value = getTheme()

        const observer = new MutationObserver(() => {
            theme.value = getTheme()
        })

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        })
    })

    return {
        theme,
        setTheme,
        isDark: () => theme.value === 'dark',
        isLight: () => theme.value === 'light'
    }
}