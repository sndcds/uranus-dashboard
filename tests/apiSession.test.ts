import { createPinia, disposePinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/api.ts'
import { SESSION_STATE_KEY } from '@/api/authSession.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { deferred, installSessionLocks, restoreAuthGlobals, jsonResponse, profileResponse } from './helpers/auth'

let pinia: ReturnType<typeof createPinia>
beforeEach(() => { installSessionLocks(); pinia = createPinia(); setActivePinia(pinia) })
afterEach(() => { disposePinia(pinia); restoreAuthGlobals() })
function mockFetch() { const mock = vi.fn<typeof fetch>(); vi.stubGlobal('fetch', mock); return mock }

describe('cookie-authenticated API requests', () => {
  it('sends cookies, strips legacy Bearer headers and preserves multipart boundaries', async () => {
    const mock = mockFetch().mockResolvedValueOnce(jsonResponse({ data: { saved: true } }))
    const body = new FormData(); body.append('avatar', new Blob(['image']), 'avatar.png')
    await apiFetch('/api/admin/user/avatar', { method: 'POST', body, credentials: 'omit', headers: { Authorization: 'Bearer legacy' } })
    const options = mock.mock.calls[0]?.[1]
    expect(options?.credentials).toBe('include')
    expect(options?.body).toBe(body)
    expect(new Headers(options?.headers).has('Authorization')).toBe(false)
    expect(new Headers(options?.headers).has('Content-Type')).toBe(false)
  })

  it('coalesces parallel 401s, rotates once and retries each request once', async () => {
    let accessValid = false
    let mutations = 0
    const mock = mockFetch().mockImplementation(async url => {
      if (url === '/api/admin/refresh') { accessValid = true; return jsonResponse({}) }
      if (url === '/api/admin/user/profile') return accessValid ? profileResponse() : jsonResponse({}, 401)
      if (!accessValid) return jsonResponse({}, 401)
      mutations++
      return jsonResponse({ data: { saved: true } })
    })
    const results = await Promise.all([
      apiFetch('/api/admin/event/one', { method: 'PUT', body: '{}' }),
      apiFetch('/api/admin/event/two', { method: 'PUT', body: '{}' }),
    ])
    expect(results).toHaveLength(2)
    expect(mutations).toBe(2)
    expect(mock.mock.calls.filter(([url]) => url === '/api/admin/refresh')).toHaveLength(1)
  })

  it('keeps public lookups credential-free and independent of session initialization', async () => {
    const pending = deferred<Response>()
    const mock = mockFetch().mockReturnValueOnce(pending.promise)
    const lookup = apiFetch('/api/choosable-languages?lang=en')
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version: 'initialized', signedOut: false }))
    pending.resolve(jsonResponse({ data: [] }))
    await expect(lookup).resolves.toMatchObject({ data: [] })
    expect(mock.mock.calls[0]?.[1]?.credentials).toBe('omit')
  })

  it('does not attempt session renewal for rejected public authentication requests', async () => {
    const mock = mockFetch().mockResolvedValueOnce(jsonResponse({}, 401))
    await expect(apiFetch('/api/activate', { method: 'POST', body: '{}' })).rejects.toMatchObject({ status: 401 })
    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock.mock.calls[0]?.[1]?.credentials).toBe('omit')
  })

  it('propagates a second 401 without looping', async () => {
    const mock = mockFetch().mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(profileResponse()).mockResolvedValueOnce(jsonResponse({}, 401))
    await expect(apiFetch('/api/admin/test')).rejects.toMatchObject({ status: 401 })
    expect(mock).toHaveBeenCalledTimes(3)
  })

  it('does not sign out or refresh on network and non-401 API failures', async () => {
    const mock = mockFetch().mockResolvedValueOnce(profileResponse())
      .mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(jsonResponse({}, 403))
    const store = useTokenStore(); await store.initializeSession()
    await expect(apiFetch('/api/admin/test')).rejects.toThrow('offline')
    await expect(apiFetch('/api/admin/test')).rejects.toMatchObject({ status: 403 })
    expect(store.isAuthenticated).toBe(true)
    expect(mock.mock.calls.some(([url]) => url === '/api/admin/refresh')).toBe(false)
  })

  it('rejects stale results after logout or account changes in another tab', async () => {
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version: 'before', signedOut: false }))
    const response = deferred<Response>()
    mockFetch().mockReturnValueOnce(response.promise)
    const result = apiFetch('/api/admin/test')
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version: 'after', signedOut: true }))
    response.resolve(jsonResponse({ data: 'previous-user-data' }))
    await expect(result).rejects.toMatchObject({ reason: 'changed' })
  })

  it.each(['/api/login', '/api/admin/refresh', '/api/admin/logout'])('requires dedicated coordination for %s', async path => {
    const mock = mockFetch()
    await expect(apiFetch(path, { method: 'POST' })).rejects.toThrow('Use the session store')
    expect(mock).not.toHaveBeenCalled()
  })
})
