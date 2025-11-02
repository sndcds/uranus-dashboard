import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTokenStore } from '../../src/store/token'

describe('Token Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with null tokens', () => {
    const store = useTokenStore()
    expect(store.accessToken).toBeNull()
    expect(store.refreshToken).toBeNull()
  })

  it('sets and gets access token', () => {
    const store = useTokenStore()
    const token = 'test-access-token'
    
    store.setAccessToken(token)
    
    expect(store.accessToken).toBe(token)
    expect(localStorage.getItem('access_token')).toBe(token)
  })

  it('sets and gets refresh token', () => {
    const store = useTokenStore()
    const token = 'test-refresh-token'
    
    store.setRefreshToken(token)
    
    expect(store.refreshToken).toBe(token)
    expect(localStorage.getItem('refresh_token')).toBe(token)
  })

  it('clears both tokens', () => {
    const store = useTokenStore()
    
    store.setAccessToken('access-token')
    store.setRefreshToken('refresh-token')
    
    expect(store.accessToken).toBe('access-token')
    expect(store.refreshToken).toBe('refresh-token')
    
    store.clearTokens()
    
    expect(store.accessToken).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('loads tokens from localStorage on initialization', () => {
    localStorage.setItem('access_token', 'stored-access-token')
    localStorage.setItem('refresh_token', 'stored-refresh-token')
    
    const store = useTokenStore()
    
    expect(store.accessToken).toBe('stored-access-token')
    expect(store.refreshToken).toBe('stored-refresh-token')
  })

  it('returns true when access token exists', () => {
    const store = useTokenStore()
    
    expect(store.accessToken).toBeNull()
    
    store.setAccessToken('test-token')
    
    expect(store.accessToken).toBe('test-token')
  })

  it('returns false when access token is null', () => {
    const store = useTokenStore()
    store.setAccessToken('test-token')
    store.clearTokens()
    
    expect(store.accessToken).toBeNull()
  })
})
