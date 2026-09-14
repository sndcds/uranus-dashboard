import { defineStore } from 'pinia'
import { computed, onScopeDispose, ref } from 'vue'
import { useUserStore } from '@/store/userStore.ts'
import { useAppStore } from '@/store/appStore.ts'
import {
  authSession, SESSION_STATE_KEY, SessionError,
  type SessionErrorReason, type SessionSnapshot,
} from '@/api/authSession.ts'

// Scrub legacy persisted JWTs before the persistence plugin hydrates this store.
function migrateTokenStorage() {
  try {
    const legacy: unknown = JSON.parse(localStorage.getItem('token') ?? '{}')
    const known = legacy !== null && typeof legacy === 'object' && (
      ('hasKnownAccount' in legacy && legacy.hasKnownAccount === true)
      || ('accessToken' in legacy && typeof legacy.accessToken === 'string' && !!legacy.accessToken)
    )
    localStorage.setItem('token', JSON.stringify({ hasKnownAccount: known }))
  } catch {
    try { localStorage.removeItem('token') } catch { /* Storage may be disabled. */ }
  }
}

// Keep the existing store ID and consumers; authentication is now verified from
// HttpOnly cookies. Only the non-sensitive account hint is persisted.
export const useTokenStore = defineStore('token', () => {
  const status = ref<'unknown' | 'authenticated' | 'anonymous'>('unknown')
  const hasKnownAccount = ref(false)
  const isInitialized = ref(false)
  const isRestoring = ref(false)
  const isLoggingOut = ref(false)
  const sessionError = ref<SessionErrorReason | null>(null)
  const logoutFailed = ref(false)
  const isAuthenticated = computed(() => status.value === 'authenticated')
  let restorePromise: Promise<boolean> | null = null

  function markKnownAccount() { hasKnownAccount.value = true }

  function clearSession() {
    status.value = 'anonymous'
    useUserStore().resetUserState()
    useAppStore().clearOrg()
  }

  function applySnapshot(snapshot: SessionSnapshot): boolean {
    if (snapshot.version !== authSession.version) throw new SessionError('changed')
    if (snapshot.profile) {
      const user = useUserStore()
      if (user.userUuid !== snapshot.profile.user_uuid) {
        user.resetUserState()
        useAppStore().clearOrg()
      }
      user.setUserUuid(snapshot.profile.user_uuid)
      user.setDisplayName(snapshot.profile.display_name ?? '')
      user.setUserAvatarUrl(snapshot.profile.avatar_url ?? null)
      status.value = 'authenticated'
      markKnownAccount()
    } else { clearSession() }
    isInitialized.value = true
    sessionError.value = null
    return isAuthenticated.value
  }

  async function restoreSession(): Promise<boolean> {
    if (!restorePromise) {
      isRestoring.value = true
      const operation = authSession.restore().then(applySnapshot).catch((error: unknown) => {
        sessionError.value = error instanceof SessionError ? error.reason : 'unavailable'
        throw error
      }).finally(() => {
        isRestoring.value = false
        restorePromise = null
      })
      restorePromise = operation
    }
    return restorePromise
  }

  async function initializeSession(): Promise<void> {
    if (isInitialized.value) return
    try { await restoreSession() } catch {
      // Let public pages and the login/retry screen render during an outage.
      isInitialized.value = true
    }
  }

  async function login(email: string, password: string) {
    const snapshot = await authSession.login(email, password)
    applySnapshot(snapshot)
    logoutFailed.value = false
    return snapshot.profile!
  }

  async function logout(): Promise<void> {
    if (isLoggingOut.value) return
    isLoggingOut.value = true
    logoutFailed.value = false
    try { applySnapshot(await authSession.logout()) } catch (error) {
      // Cookies cannot be cleared by JavaScript. Do not report success when the
      // server could not revoke them; keep the session and offer a retry.
      logoutFailed.value = true
      throw error
    } finally { isLoggingOut.value = false }
  }

  function onSessionChange(event: StorageEvent) {
    if (event.key !== SESSION_STATE_KEY) return
    if (authSession.isSignedOut) {
      clearSession()
      isInitialized.value = true
      sessionError.value = null
    } else {
      // Invalidate views before checking the new account's shared cookies.
      status.value = 'unknown'
      isInitialized.value = false
      useUserStore().resetUserState()
      useAppStore().clearOrg()
      void restoreSession().catch(() => { /* Exposed through sessionError. */ })
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onSessionChange)
    onScopeDispose(() => window.removeEventListener('storage', onSessionChange))
  }

  return {
    status, hasKnownAccount, isAuthenticated, isInitialized, isRestoring,
    isLoggingOut, sessionError, logoutFailed, markKnownAccount,
    initializeSession, restoreSession, login, logout,
  }
}, {
  persist: { pick: ['hasKnownAccount'], beforeHydrate: migrateTokenStorage },
})
