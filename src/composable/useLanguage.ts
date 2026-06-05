import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'

export const useLanguage = () => {
    const { locale } = useI18n()
    const tokenStore = useTokenStore()

    const setLanguage = async (lang: string, currentTheme?: string) => {
        locale.value = lang
        localStorage.setItem('app-locale', lang)

        if (tokenStore.isAuthenticated) {
            try {
                await apiFetch('/api/admin/user/settings', {
                    method: 'PUT',
                    body: JSON.stringify({
                        theme: currentTheme,
                        locale: lang
                    })
                })
            } catch (err) {
                console.error('Failed to save language setting:', err)
            }
        }
    }

    const getStoredLanguage = () =>
        localStorage.getItem('app-locale') ?? locale.value

    return { setLanguage, getStoredLanguage }
}