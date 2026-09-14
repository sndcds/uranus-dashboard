import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAuthSession, REFRESH_PENDING_KEY, SESSION_STATE_KEY,
} from '@/api/authSession.ts'
import { deferred, installSessionLocks, restoreAuthGlobals, jsonResponse, profile, profileResponse } from './helpers/auth'

beforeEach(() => { installSessionLocks() })
afterEach(() => { restoreAuthGlobals() })

function mockFetch() {
  const mock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', mock)
  return mock
}

function assertCookieRequests(mock: ReturnType<typeof mockFetch>) {
  for (const [, options] of mock.mock.calls) {
    expect(options?.credentials).toBe('include')
    expect(options?.cache).toBe('no-store')
    expect(new Headers(options?.headers).has('Authorization')).toBe(false)
  }
}

describe('cookie session transport', () => {
  it('verifies login cookies and returns profile fields without JWTs', async () => {
    const mock = mockFetch()
      .mockResolvedValueOnce(jsonResponse({ data: { ...profile, access_token: 'secret-access', refresh_token: 'secret-refresh' } }))
      .mockResolvedValueOnce(profileResponse())
    const result = await createAuthSession().login('ada@example.test', ' password ')
    expect(result.profile).toEqual(profile)
    expect(JSON.stringify(result)).not.toContain('secret')
    expect(mock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ email: 'ada@example.test', password: ' password ' }))
    expect(mock.mock.calls.map(([url]) => url)).toEqual(['/api/login', '/api/admin/user/profile'])
    expect(localStorage.getItem(SESSION_STATE_KEY)).not.toContain('secret')
    assertCookieRequests(mock)
  })

  it('does not claim login succeeded when cookies are blocked', async () => {
    mockFetch().mockResolvedValueOnce(jsonResponse({ data: profile })).mockResolvedValueOnce(jsonResponse({}, 401))
    await expect(createAuthSession().login('ada@example.test', 'password')).rejects.toMatchObject({ reason: 'cookies' })
    expect(localStorage.getItem(SESSION_STATE_KEY)).toBeNull()
  })

  it('rejects confirmation of a different account', async () => {
    mockFetch().mockResolvedValueOnce(jsonResponse({ data: profile }))
      .mockResolvedValueOnce(jsonResponse({ data: { user_uuid: 'another-user' } }))
    await expect(createAuthSession().login('ada@example.test', 'password')).rejects.toMatchObject({ reason: 'cookies' })
  })

  it('restores a page reload using only the access cookie', async () => {
    const mock = mockFetch().mockResolvedValueOnce(profileResponse())
    expect((await createAuthSession().restore()).profile).toEqual(profile)
    expect(mock).toHaveBeenCalledTimes(1)
    assertCookieRequests(mock)
  })

  it('renews an expired access cookie then verifies the new cookies', async () => {
    const mock = mockFetch().mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({ access_token: 'ignored', refresh_token: 'ignored' }))
      .mockResolvedValueOnce(profileResponse())
    expect((await createAuthSession().restore()).profile).toEqual(profile)
    expect(mock.mock.calls.map(([url]) => url)).toEqual(['/api/admin/user/profile', '/api/admin/refresh', '/api/admin/user/profile'])
    expect(localStorage.getItem(REFRESH_PENDING_KEY)).toBeNull()
    assertCookieRequests(mock)
  })

  it('coalesces requests within a tab and rechecks cookies after another tab renews', async () => {
    let accessValid = false
    let refreshCount = 0
    const refresh = deferred<Response>()
    const mock = mockFetch().mockImplementation(async (url) => {
      if (url === '/api/admin/refresh') {
        refreshCount++
        const response = await refresh.promise
        accessValid = true
        return response
      }
      return accessValid ? profileResponse() : jsonResponse({}, 401)
    })
    const firstTab = createAuthSession()
    const secondTab = createAuthSession()
    const first = firstTab.restore()
    expect(firstTab.restore()).toBe(first)
    const second = secondTab.restore()
    await vi.waitFor(() => expect(refreshCount).toBe(1))
    refresh.resolve(jsonResponse({}))
    const results = await Promise.all([first, second])
    expect(results.map(result => result.profile)).toEqual([profile, profile])
    expect(refreshCount).toBe(1)
    expect(results[0]?.version).toBe(results[1]?.version)
    assertCookieRequests(mock)
  })

  it('marks missing or revoked refresh cookies as signed out', async () => {
    mockFetch().mockResolvedValueOnce(jsonResponse({}, 401)).mockResolvedValueOnce(jsonResponse({}, 401))
    const session = createAuthSession()
    expect((await session.restore()).profile).toBeNull()
    expect(session.isSignedOut).toBe(true)
  })

  it('never retries a possibly consumed refresh after a lost response', async () => {
    const mock = mockFetch().mockResolvedValueOnce(jsonResponse({}, 401))
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce(jsonResponse({}, 401))
    await expect(createAuthSession().restore()).rejects.toThrow('Network error')
    // A new client simulates a different tab or reload after the interrupted call.
    await expect(createAuthSession().restore()).rejects.toMatchObject({ reason: 'recovery' })
    expect(mock.mock.calls.filter(([url]) => url === '/api/admin/refresh')).toHaveLength(1)
    expect(localStorage.getItem(REFRESH_PENDING_KEY)).toBe('1')
    expect(createAuthSession().isSignedOut).toBe(false)
  })

  it('recovers an interrupted refresh if the browser received its new cookies', async () => {
    localStorage.setItem(REFRESH_PENDING_KEY, '1')
    const mock = mockFetch().mockResolvedValueOnce(profileResponse())
    expect((await createAuthSession().restore()).profile).toEqual(profile)
    expect(localStorage.getItem(REFRESH_PENDING_KEY)).toBeNull()
    expect(mock).toHaveBeenCalledTimes(1)
  })

  it.each([403, 500])('preserves uncertainty after refresh HTTP %s instead of logging out', async status => {
    mockFetch().mockResolvedValueOnce(jsonResponse({}, 401)).mockResolvedValueOnce(jsonResponse({}, status))
    const session = createAuthSession()
    await expect(session.restore()).rejects.toMatchObject({ status })
    expect(session.isSignedOut).toBe(false)
    expect(localStorage.getItem(REFRESH_PENDING_KEY)).toBe('1')
  })

  it('keeps transient profile failures retryable without rotating tokens', async () => {
    const mock = mockFetch().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(profileResponse())
    const session = createAuthSession()
    await expect(session.restore()).rejects.toThrow('offline')
    expect((await session.restore()).profile).toEqual(profile)
    expect(mock.mock.calls.every(([url]) => url === '/api/admin/user/profile')).toBe(true)
  })

  it('serializes logout after an in-flight refresh and prevents queued renewal after logout', async () => {
    let accessValid = false
    const refresh = deferred<Response>()
    const calls: string[] = []
    mockFetch().mockImplementation(async url => {
      calls.push(String(url))
      if (url === '/api/admin/refresh') {
        await refresh.promise
        accessValid = true
        return jsonResponse({})
      }
      if (url === '/api/admin/logout') { accessValid = false; return jsonResponse({}) }
      return accessValid ? profileResponse() : jsonResponse({}, 401)
    })
    const one = createAuthSession()
    const two = createAuthSession()
    const renewing = one.restore()
    await vi.waitFor(() => expect(calls).toContain('/api/admin/refresh'))
    const logout = two.logout()
    const queued = two.restore()
    refresh.resolve(jsonResponse({}))
    await renewing
    expect((await logout).profile).toBeNull()
    expect((await queued).profile).toBeNull()
    expect(calls.filter(path => path === '/api/admin/refresh')).toHaveLength(1)
    expect(calls.at(-1)).toBe('/api/admin/logout')
  })

  it.each([200, 401])('treats logout HTTP %s as completion without refreshing', async status => {
    const mock = mockFetch().mockResolvedValueOnce(jsonResponse({}, status))
    const session = createAuthSession()
    expect((await session.logout()).profile).toBeNull()
    expect(session.isSignedOut).toBe(true)
    expect(mock.mock.calls.map(([url]) => url)).toEqual(['/api/admin/logout'])
    assertCookieRequests(mock)
  })

  it('preserves session state when server-side logout fails', async () => {
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version: 'before', signedOut: false }))
    mockFetch().mockResolvedValueOnce(jsonResponse({}, 503))
    const session = createAuthSession()
    await expect(session.logout()).rejects.toMatchObject({ status: 503 })
    expect(session.version).toBe('before')
    expect(session.isSignedOut).toBe(false)
  })

  it('does not trust a localStorage authentication hint', async () => {
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version: 'untrusted', signedOut: false }))
    mockFetch().mockResolvedValueOnce(jsonResponse({}, 401)).mockResolvedValueOnce(jsonResponse({}, 401))
    expect((await createAuthSession().restore()).profile).toBeNull()
  })

  it('fails closed before authentication when Web Locks are unavailable', async () => {
    vi.stubGlobal('navigator', {})
    const mock = mockFetch()
    await expect(createAuthSession().login('ada@example.test', 'password')).rejects.toMatchObject({ reason: 'unsupported' })
    expect(mock).not.toHaveBeenCalled()
  })
})
