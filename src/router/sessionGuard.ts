import type { RouteLocationNormalized } from 'vue-router'
import { useTokenStore } from '@/store/uranusTokenStore.ts'

export async function sessionGuard(to: RouteLocationNormalized) {
    const tokenStore = useTokenStore()
    await tokenStore.initializeSession()
    const isAuthenticated = tokenStore.isAuthenticated
    const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
    const guestOnly = to.matched.some((record) => record.meta?.guestOnly)

    if (requiresAuth && !isAuthenticated) {
        return {
            name: tokenStore.hasKnownAccount || tokenStore.sessionError ? 'app-login' : 'app-signup',
            query: { redirect: to.fullPath },
        }
    }

    if (guestOnly && isAuthenticated && to.query.logout !== '1') {
        if (to.name !== 'events') {
            return { name: 'events' }
        }
        return true
    }

    return true
}
