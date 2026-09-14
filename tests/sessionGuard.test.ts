import { createPinia, disposePinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sessionGuard } from '@/router/sessionGuard.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { deferred, installSessionLocks, restoreAuthGlobals, jsonResponse, profileResponse } from './helpers/auth'

let pinia: ReturnType<typeof createPinia>
beforeEach(() => { installSessionLocks(); pinia = createPinia(); setActivePinia(pinia) })
afterEach(() => { disposePinia(pinia); restoreAuthGlobals() })

function routerForTest() {
  const component = { template: '<div />' }
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/admin/edit', component, meta: { requiresAuth: true } },
    { path: '/app/login', name: 'app-login', component, meta: { guestOnly: true } },
    { path: '/app/signup', name: 'app-signup', component, meta: { guestOnly: true } },
    { path: '/events', name: 'events', component },
  ] })
  router.beforeEach(sessionGuard)
  return router
}

describe('session-aware route guard', () => {
  it('waits for verified cookie session before entering a protected deep link', async () => {
    const pending = deferred<Response>()
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending.promise))
    const router = routerForTest()
    const navigation = router.push('/admin/edit?event=123')
    await Promise.resolve()
    expect(router.currentRoute.value.fullPath).not.toContain('/admin/edit')
    pending.resolve(profileResponse())
    await navigation
    expect(router.currentRoute.value.fullPath).toBe('/admin/edit?event=123')
  })

  it('redirects an expired session to login with the original destination', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 401)))
    useTokenStore().markKnownAccount()
    const router = routerForTest(); await router.push('/admin/edit?event=123')
    expect(router.currentRoute.value.name).toBe('app-login')
    expect(router.currentRoute.value.query.redirect).toBe('/admin/edit?event=123')
  })

  it('shows login with a retryable error on failed session verification', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    const router = routerForTest(); await router.push('/admin/edit')
    expect(router.currentRoute.value.name).toBe('app-login')
    expect(useTokenStore().sessionError).toBe('unavailable')
    expect(useTokenStore().status).toBe('unknown')
  })

  it('redirects authenticated users away from guest-only pages after restoration', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(profileResponse()))
    const router = routerForTest(); await router.push('/app/login')
    expect(router.currentRoute.value.name).toBe('events')
  })
})
