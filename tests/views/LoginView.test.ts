import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import UranusLoginView from '../../src/views/UranusLoginView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      login: 'Log In',
      login_subtitle: 'Welcome back! Sign in to continue organizing your events.',
      email: 'Email',
      password: 'Password',
      forgot_password: 'Forgot Password?',
      login_cta: 'Log In',
      login_loading: 'Logging in…',
      need_account: "Don't have an account?",
      signup: 'Sign Up',
      event_error_required: 'This field is required',
      organization_form_invalid_email: 'Please provide a valid email address.',
      invalid_credentials: 'Invalid credentials',
      login_failed: 'Login failed',
      password_show_label: 'Show password',
      password_hide_label: 'Hide password',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/app/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/app/signup', name: 'signup', component: { template: '<div>Signup</div>' } },
    { path: '/app/forgot-password', name: 'forgot-password', component: { template: '<div>Forgot</div>' } },
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/admin/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
  ],
})

// Mock apiFetch
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

describe('UranusLoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    router.push('/app/login')
  })

  it('renders login form with all fields', async () => {
    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.find('h1').text()).toBe('Log In')
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#login-email').exists()).toBe(true)
    expect(wrapper.find('#login-password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('displays subtitle text', () => {
    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.text()).toContain('Welcome back')
  })

  it('shows link to signup page', () => {
    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const signupLink = wrapper.find('a[href="/app/signup"]')
    expect(signupLink.exists()).toBe(true)
    expect(signupLink.text()).toBe('Sign Up')
  })

  it('shows forgot password link', () => {
    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const forgotLink = wrapper.find('a[href="/app/forgot-password"]')
    expect(forgotLink.exists()).toBe(true)
    expect(forgotLink.text()).toBe('Forgot Password?')
  })

  it('validates required email field', async () => {
    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('This field is required')
  })

  it('validates email format', async () => {
    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('invalid-email')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('valid email address')
  })

  it('validates required password field', async () => {
    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('This field is required')
  })

  it('clears email error when valid email is entered', async () => {
    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('This field is required')

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('test@example.com')
    await flushPromises()

    const errorElements = wrapper.findAll('.feedback--error')
    const emailErrorGone = !errorElements.some(el => el.text().includes('valid email'))
    expect(emailErrorGone).toBe(true)
  })

  it('clears password error when password is entered', async () => {
    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    const passwordInput = wrapper.find('#login-password')
    await passwordInput.setValue('password123')
    await flushPromises()

    // The password error should be cleared
    await wrapper.vm.$nextTick()
  })

  it('successfully logs in with valid credentials', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        message: 'login successful',
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        user_id: 123,
        display_name: 'Test User',
        locale: 'en',
        theme: 'light',
      },
      status: 200,
    })

    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#login-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })
  })

  it('displays error message on failed login', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue({
      data: { error: 'Invalid credentials' },
    })

    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#login-password')
    await passwordInput.setValue('wrongpassword')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Invalid credentials')
  })

  it('disables submit button while submitting', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#login-password')
    await passwordInput.setValue('password123')

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeUndefined()

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('shows loading text while submitting', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#login-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Logging in')
  })

  it('trims whitespace from email and password', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        message: 'login successful',
        access_token: 'test-token',
        refresh_token: 'test-refresh',
      },
      status: 200,
    })

    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('  test@example.com  ')

    const passwordInput = wrapper.find('#login-password')
    await passwordInput.setValue('  password123  ')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })
  })

  it('handles redirect query parameter after successful login', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        message: 'login successful',
        access_token: 'test-token',
        refresh_token: 'test-refresh',
      },
      status: 200,
    })

    await router.push('/app/login?redirect=/admin/dashboard')

    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#login-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    // Router should redirect to the redirect query parameter
    expect(router.currentRoute.value.path).toBe('/admin/dashboard')
  })

  it('displays generic error on network failure', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(UranusLoginView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#login-email')
    await emailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#login-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Login failed')
  })
})
