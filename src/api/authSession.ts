import type { ThemeMode } from '@/composable/useTheme.ts'
import { apiUrl } from '@/api/baseUrl.ts'
import { ApiError } from '@/api/apiError.ts'

export interface SessionProfile {
  user_uuid: string
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  locale?: string
  theme?: ThemeMode
}

export type SessionErrorReason = 'unavailable' | 'unsupported' | 'cookies' | 'recovery' | 'changed'

export class SessionError extends Error {
  constructor(public reason: SessionErrorReason) {
    super('The session could not be verified. Please try signing in again.')
  }
}

// These records contain coordination metadata only, never credentials.
export const SESSION_STATE_KEY = 'uranus-session-state'
export const REFRESH_PENDING_KEY = 'uranus-session-refresh-pending'
export const SESSION_LOCK_NAME = 'uranus-cookie-session'

interface SharedSession {
  version: string
  signedOut: boolean
}

export interface SessionSnapshot {
  profile: SessionProfile | null
  version: string
}

function readSharedSession(): SharedSession | null {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(SESSION_STATE_KEY) ?? 'null')
    if (data && typeof data === 'object' && 'version' in data && typeof data.version === 'string'
      && 'signedOut' in data && typeof data.signedOut === 'boolean') {
      return { version: data.version, signedOut: data.signedOut }
    }
  } catch { /* A server check, never a storage hint, authenticates the user. */ }
  return null
}

function saveSharedSession(signedOut: boolean, newVersion = false): string {
  const previous = readSharedSession()
  const version = newVersion || !previous ? crypto.randomUUID() : previous.version
  localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version, signedOut }))
  return version
}

function profileFromJSON(value: unknown): SessionProfile {
  if (!value || typeof value !== 'object' || !('data' in value)
    || !value.data || typeof value.data !== 'object'
    || !('user_uuid' in value.data) || typeof value.data.user_uuid !== 'string' || !value.data.user_uuid) {
    throw new SessionError('unavailable')
  }
  const data = value.data as Record<string, unknown>
  // Whitelist profile fields; the legacy login response also contains JWTs.
  const profile: SessionProfile = { user_uuid: value.data.user_uuid }
  for (const key of ['display_name', 'first_name', 'last_name', 'avatar_url'] as const) {
    if (typeof data[key] === 'string' || data[key] === null) profile[key] = data[key]
  }
  if (typeof data.locale === 'string') profile.locale = data.locale
  if (data.theme === 'light' || data.theme === 'dark') profile.theme = data.theme
  return profile
}

// Each tab gets a client. Web Locks coordinate all clients of the dashboard's
// origin, including login/logout. A storage lease cannot provide this guarantee.
export function createAuthSession() {
  let recovery: Promise<SessionSnapshot> | null = null

  async function withSessionLock<T>(action: () => Promise<T>): Promise<T> {
    if (!navigator.locks) throw new SessionError('unsupported')
    return navigator.locks.request(SESSION_LOCK_NAME, async () => {
      // Rotation needs durable coordination even if the tab closes mid-request.
      try {
        const key = 'uranus-session-storage-check'
        localStorage.setItem(key, '1')
        localStorage.removeItem(key)
      } catch { throw new SessionError('unavailable') }
      return action()
    })
  }

  async function request(path: string, options: RequestInit = {}): Promise<Response> {
    return fetch(apiUrl(path), {
      ...options,
      credentials: 'include',
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })
  }

  async function getProfile(): Promise<SessionProfile | null> {
    const response = await request('/api/admin/user/profile')
    if (response.status === 401) return null
    if (!response.ok) throw new ApiError('Session verification failed', response.status)
    return profileFromJSON(await response.json())
  }

  function authenticated(profile: SessionProfile, newVersion = false): SessionSnapshot {
    const version = saveSharedSession(false, newVersion)
    localStorage.removeItem(REFRESH_PENDING_KEY)
    return { profile, version }
  }

  function signedOut(): SessionSnapshot {
    const version = saveSharedSession(true, true)
    localStorage.removeItem(REFRESH_PENDING_KEY)
    return { profile: null, version }
  }

  async function recover(): Promise<SessionSnapshot> {
    return withSessionLock(async () => {
      const shared = readSharedSession()
      // A queued 401 must never renew the session after another tab logged out.
      if (shared?.signedOut) return { profile: null, version: shared.version }
      const profile = await getProfile()
      if (profile) return authenticated(profile)

      // An interrupted request may already have consumed its token. First probe
      // the cookies above, but never blindly retry that refresh after a failure.
      if (localStorage.getItem(REFRESH_PENDING_KEY)) throw new SessionError('recovery')
      localStorage.setItem(REFRESH_PENDING_KEY, '1')
      const response = await request('/api/admin/refresh', { method: 'POST' })
      if (response.status === 401) return signedOut()
      if (!response.ok) throw new ApiError('Session renewal failed', response.status)
      // Confirm cookies actually work; ignore JWTs in the compatibility body.
      const renewedProfile = await getProfile()
      if (!renewedProfile) throw new SessionError('cookies')
      return authenticated(renewedProfile)
    })
  }

  return {
    get version(): string { return readSharedSession()?.version ?? '' },
    get isSignedOut(): boolean { return readSharedSession()?.signedOut === true },
    restore(): Promise<SessionSnapshot> {
      if (!recovery) {
        const operation = recover()
        const pending = operation.finally(() => { if (recovery === pending) recovery = null })
        recovery = pending
      }
      return recovery
    },
    async login(email: string, password: string): Promise<SessionSnapshot> {
      return withSessionLock(async () => {
        const response = await request('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!response.ok) throw new ApiError('Login failed', response.status)
        const loginProfile = profileFromJSON(await response.json())
        const profile = await getProfile()
        if (!profile || profile.user_uuid !== loginProfile.user_uuid) throw new SessionError('cookies')
        return authenticated({ ...loginProfile, ...profile }, true)
      })
    },
    async logout(): Promise<SessionSnapshot> {
      return withSessionLock(async () => {
        // Dedicated request: a logout 401 is completion, never a refresh trigger.
        const response = await request('/api/admin/logout', { method: 'POST' })
        if (!response.ok && response.status !== 401) throw new ApiError('Logout failed', response.status)
        return signedOut()
      })
    },
  }
}

export const authSession = createAuthSession()
