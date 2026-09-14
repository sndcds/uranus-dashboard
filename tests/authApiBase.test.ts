import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiBaseUrl, apiUrl } from '@/api/baseUrl.ts'

afterEach(() => vi.unstubAllEnvs())

describe('API origin for cookie sessions', () => {
  it('uses the same-origin Vite proxy in development, even with a remote upstream', () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_API_URL', 'https://api.kulturbytes.de')
    expect(apiBaseUrl()).toBe('')
    expect(apiUrl('/api/admin/refresh')).toBe('/api/admin/refresh')
  })

  it('uses the configured API origin in production', () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_API_URL', 'https://api.kulturbytes.de/')
    expect(apiUrl('/api/admin/refresh')).toBe('https://api.kulturbytes.de/api/admin/refresh')
  })
})
