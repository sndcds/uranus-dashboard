import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import ForgotPasswordView from '../../src/views/ForgotPasswordView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      forgot_password_title: 'Forgot Password',
      forgot_password_subtitle: "Enter your email address and we'll send you a link to reset your password.",
      email: 'Email',
      email_placeholder: 'Enter your email',
      email_required: 'Email is required',
      email_invalid: 'Please enter a valid email address',
      forgot_password_submit: 'Send Reset Link',
      forgot_password_sending: 'Sending…',
      forgot_password_success: 'Reset link sent! Please check your email.',
      forgot_password_error: 'Failed to send reset link',
      forgot_password_error_generic: 'An error occurred',
      back_to_login: 'Back to Login',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/app/forgot-password', name: 'forgot-password', component: { template: '<div>Forgot</div>' } },
    { path: '/app/login', name: 'login', component: { template: '<div>Login</div>' } },
  ],
})

// Mock apiFetch
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

describe('ForgotPasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    router.push('/app/forgot-password')
  })

  it('renders forgot password form with email field', () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.find('h1').text()).toBe('Forgot Password')
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#forgot-email').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('displays subtitle text', () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.text()).toContain('send you a link to reset your password')
  })

  it('shows link to login page', () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const loginLink = wrapper.find('a[href="/app/login"]')
    expect(loginLink.exists()).toBe(true)
    expect(loginLink.text()).toBe('Back to Login')
  })

  it('validates required email field', async () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Email is required')
  })

  it('validates email format', async () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('invalid-email')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('valid email address')
  })

  it('clears email error when valid email is entered', async () => {
    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('test@example.com')
    await flushPromises()

    await wrapper.vm.$nextTick()
  })

  it('successfully sends reset link with valid email', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'Reset link sent' },
      status: 200,
    })

    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })
  })

  it('shows success message after sending reset link', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 200,
    })

    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Reset link sent')
  })

  it('displays error message on failed request', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue({
      data: { error: 'Email not found' },
    })

    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Email not found')
  })

  it('disables submit button while submitting', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('test@example.com')

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

    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Sending')
  })

  it('trims whitespace from email', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 200,
    })

    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('  test@example.com  ')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })
  })

  it('displays generic error on non-200 status', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: {},
      status: 400,
    })

    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
  })

  it('handles network error gracefully', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(ForgotPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#forgot-email')
    await emailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
  })

  it('accepts valid email with various formats', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 200,
    })

    const validEmails = [
      'test@example.com',
      'user.name@example.co.uk',
      'user+tag@example.com',
      'user_123@subdomain.example.com',
    ]

    for (const email of validEmails) {
      const wrapper = mount(ForgotPasswordView, {
        global: {
          plugins: [i18n, router],
        },
      })

      const emailInput = wrapper.find('#forgot-email')
      await emailInput.setValue(email)

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      await flushPromises()

      expect(apiFetch).toHaveBeenCalledWith('/api/admin/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      vi.clearAllMocks()
    }
  })

  it('rejects invalid email formats', async () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com',
      'user@example',
    ]

    for (const email of invalidEmails) {
      const wrapper = mount(ForgotPasswordView, {
        global: {
          plugins: [i18n, router],
        },
      })

      const emailInput = wrapper.find('#forgot-email')
      await emailInput.setValue(email)

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.text()).toContain('valid email address')
    }
  })
})
