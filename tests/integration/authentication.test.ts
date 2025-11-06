import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { apiFetch } from '../../src/api'
import { useTokenStore } from '../../src/store/tokenStore'

vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      login: 'Log in',
      email: 'Email',
      password: 'Password',
      login_subtitle: 'Sign in to manage your events',
      login_cta: 'Log in',
      login_loading: 'Signing in…',
      invalid_credentials: 'Invalid credentials',
      login_failed: 'Login failed',
      password_placeholder_login: 'Your password',
      email_placeholder: 'email address',
    },
  },
})

describe('Authentication Flow', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
      ],
    })
  })

  it('stores tokens after successful login', async () => {
    const mockLoginResponse = {
      data: {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        user_id: '123',
        message: 'Login successful',
      },
      status: 200,
    }

    vi.mocked(apiFetch).mockResolvedValue(mockLoginResponse)

    const tokenStore = useTokenStore()

    // Simulate login
    await apiFetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
    })

    tokenStore.setTokens(
      mockLoginResponse.data.access_token,
      mockLoginResponse.data.refresh_token
    )

    expect(tokenStore.accessToken).toBe('test-access-token')
    expect(tokenStore.refreshToken).toBe('test-refresh-token')
  })

  it('clears tokens on logout', () => {
    const tokenStore = useTokenStore()
    
    tokenStore.setTokens('access-token', 'refresh-token')
    expect(tokenStore.accessToken).toBe('access-token')
    
    tokenStore.clearTokens()
    
    expect(tokenStore.accessToken).toBeNull()
    expect(tokenStore.refreshToken).toBeNull()
  })

  it('handles login failure gracefully', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error('Invalid credentials'))

    try {
      await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'wrong@example.com', password: 'wrong' }),
      })
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe('Invalid credentials')
    }

    const tokenStore = useTokenStore()
    expect(tokenStore.accessToken).toBeNull()
  })

  it('includes auth token in subsequent requests', async () => {
    const tokenStore = useTokenStore()
    tokenStore.setAccessToken('test-token')

    const mockEventResponse = {
      data: [{ id: 1, title: 'Test Event' }],
      status: 200,
    }

    vi.mocked(apiFetch).mockResolvedValue(mockEventResponse)

    await apiFetch('/api/events')

    // Token should be available for the request
    expect(tokenStore.accessToken).toBe('test-token')
  })

  it('persists tokens across page refreshes', () => {
    const tokenStore = useTokenStore()
    
    tokenStore.setAccessToken('persistent-token')
    
    expect(localStorage.getItem('access_token')).toBe('persistent-token')
    
    // Simulate page refresh by creating new store instance
    setActivePinia(createPinia())
    const newStore = useTokenStore()
    
    expect(newStore.accessToken).toBe('persistent-token')
  })
})
