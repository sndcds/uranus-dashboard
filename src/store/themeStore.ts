import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applyTheme, type ThemeMode } from '@/utils/theme.ts'

export const useThemeStore = defineStore('theme', () => {
    // State
    const theme = ref<ThemeMode>('light')

    // Actions
    function setTheme(newTheme: ThemeMode) {
        theme.value = newTheme
        applyTheme(newTheme)
    }

    function initTheme() {
        // Apply the stored theme on initialization
        applyTheme(theme.value)
    }

    return {
        theme,
        setTheme,
        initTheme
    }
}, {
    persist: true
})
