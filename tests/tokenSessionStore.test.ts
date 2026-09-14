import { createApp, nextTick } from 'vue'
import { createPinia, disposePinia, setActivePinia } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { useUserStore } from '@/store/userStore.ts'
import { useAppStore } from '@/store/appStore.ts'
import { SESSION_STATE_KEY } from '@/api/authSession.ts'
import { installSessionLocks, restoreAuthGlobals, jsonResponse, profile, profileResponse } from './helpers/auth'

let pinia: ReturnType<typeof createPinia>
beforeEach(() => {
  installSessionLocks()
  pinia = createPinia().use(persistedstate)
  createApp({}).use(pinia)
  setActivePinia(pinia)
})
afterEach(() => { disposePinia(pinia); restoreAuthGlobals() })

function mockFetch() { const mock = vi.fn<typeof fetch>(); vi.stubGlobal('fetch', mock); return mock }

describe('session store', () => {
  it('removes legacy persisted JWTs before hydration and persists only the account hint', async () => {
    localStorage.setItem('token', JSON.stringify({ accessToken: 'old-access', refreshToken: 'old-refresh', hasKnownAccount: true }))
    const store = useTokenStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.hasKnownAccount).toBe(true)
    expect(JSON.stringify(store.$state)).not.toContain('old-')
    expect(JSON.parse(localStorage.getItem('token')!)).toEqual({ hasKnownAccount: true })
    mockFetch().mockResolvedValueOnce(profileResponse())
    await store.initializeSession()
    await nextTick()
    expect(store.isAuthenticated).toBe(true)
    expect(JSON.parse(localStorage.getItem('token')!)).toEqual({ hasKnownAccount: true })
    expect(store.$state).not.toHaveProperty('accessToken')
    expect(store.$state).not.toHaveProperty('refreshToken')
  })

  it('restores identity before reporting a session authenticated', async () => {
    const mock = mockFetch().mockResolvedValueOnce(profileResponse())
    const store = useTokenStore()
    expect(store.isInitialized).toBe(false)
    await store.initializeSession()
    expect(store.isAuthenticated).toBe(true)
    expect(useUserStore().userUuid).toBe(profile.user_uuid)
    await store.initializeSession()
    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('keeps network failures distinct from an invalid session and supports retry', async () => {
    mockFetch().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(profileResponse())
    const store = useTokenStore()
    await store.initializeSession()
    expect(store.status).toBe('unknown')
    expect(store.sessionError).toBe('unavailable')
    expect(await store.restoreSession()).toBe(true)
    expect(store.sessionError).toBeNull()
  })

  it('clears user, avatar, organization and favorite state only after confirmed logout', async () => {
    const mock = mockFetch().mockResolvedValueOnce(profileResponse()).mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse({}, 200))
    const store = useTokenStore()
    await store.initializeSession()
    useAppStore().setOrgUuid('org')
    useAppStore().setFavoriteList('list', 'Favorites')
    useUserStore().setUserAvatarUrl('avatar.png')
    await expect(store.logout()).rejects.toMatchObject({ status: 500 })
    expect(store.logoutFailed).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(useAppStore().orgUuid).toBe('org')
    await store.logout()
    expect(store.logoutFailed).toBe(false)
    expect(store.isAuthenticated).toBe(false)
    expect(useUserStore().userState).toEqual({ uuid: null, displayName: null, userAvatarUrl: null, avatarVersion: null })
    expect(useAppStore().orgUuid).toBeNull()
    expect(useAppStore().favoriteListUuid).toBeNull()
    expect(mock.mock.calls.filter(([url]) => url === '/api/admin/refresh')).toHaveLength(0)
  })

  it('processes another tab logout without sending another logout or refresh', async () => {
    const mock = mockFetch().mockResolvedValueOnce(profileResponse())
    const store = useTokenStore()
    await store.initializeSession()
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version: 'remote-logout', signedOut: true }))
    window.dispatchEvent(new StorageEvent('storage', { key: SESSION_STATE_KEY }))
    expect(store.isAuthenticated).toBe(false)
    expect(useUserStore().userUuid).toBeNull()
    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('revalidates another tab login and discards the previous account context', async () => {
    mockFetch().mockResolvedValueOnce(profileResponse())
      .mockResolvedValueOnce(jsonResponse({ data: { user_uuid: 'new-user', display_name: 'New user' } }))
    const store = useTokenStore()
    await store.initializeSession()
    useAppStore().setOrgUuid('previous-org')
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version: 'remote-login', signedOut: false }))
    window.dispatchEvent(new StorageEvent('storage', { key: SESSION_STATE_KEY }))
    expect(store.status).toBe('unknown')
    expect(useAppStore().orgUuid).toBeNull()
    await vi.waitFor(() => expect(store.isAuthenticated).toBe(true))
    expect(useUserStore().userUuid).toBe('new-user')
  })
})
