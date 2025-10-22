import { defineStore } from 'pinia'
import { applyTheme, getStoredTheme, storeTheme, type ThemeMode } from '@/utils/theme'

export const useThemeStore = defineStore('theme', {
    state: () => ({
        theme: getStoredTheme() as ThemeMode,
    }),

    actions: {
        setTheme(theme: ThemeMode) {
            this.theme = theme
            storeTheme(theme)
            applyTheme(theme)
        },

        initTheme() {
            // Apply the stored theme on initialization
            applyTheme(this.theme)
        },
    },
})
