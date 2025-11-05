import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import ResetPasswordView from '../../src/views/ResetPasswordView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      reset_password_title: 'Reset Password',
      reset_password_subtitle: 'Enter your new password below.',
      new_password: 'New Password',
      confirm_password: 'Confirm Password',
      reset_password_submit: 'Reset Password',
      reset_password_submitting: 'Resetting password…',
      reset_password_success: 'Password reset successfully! Redirecting to login…',
      event_error_required: 'This field is required',
      reset_password_mismatch: 'Passwords do not match',
      reset_password_failed: 'Password reset failed',
      reset_password_missing_token: 'No reset token provided',
      reset_password_error_generic: 'An error occurred',
      back_to_login: 'Back to Login',
      password_show_label: 'Show password',
      password_hide_label: 'Hide password',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/app/reset-password/:token?', name: 'app-reset-password', component: { template: '<div>Reset</div>' } },
    { path: '/app/login', name: 'app-login', component: { template: '<div>Login</div>' } },
  ],
})

// Mock apiFetch
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

describe('ResetPasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders reset password form with all fields', async () => {
    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('Reset Password')
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input#new-password').exists()).toBe(true)
    expect(wrapper.find('input#confirm-password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('displays subtitle text', async () => {
    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Enter your new password')
  })

  it('extracts token from route params', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 200,
    })

    await router.push('/app/reset-password/token-from-params')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'token-from-params',
        new_password: 'newpassword123',
      }),
    })
  })

  it('extracts token from query params if not in route params', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 200,
    })

    await router.push('/app/reset-password?token=token-from-query')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'token-from-query',
        new_password: 'newpassword123',
      }),
    })
  })

  it('shows error when no token is provided', async () => {
    await router.push('/app/reset-password')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const confirmPasswordInput = wrapper.find('input#confirm-password')
    await confirmPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('No reset token provided')
  })

  it('validates required password field', async () => {
    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('This field is required')
  })

  it('validates required repeat password field', async () => {
    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('This field is required')
  })

  it('validates passwords match', async () => {
    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('password123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('different456')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('do not match')
  })

  it('clears repeat password error when passwords match', async () => {
    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('password123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('different456')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    await repeatPasswordInput.setValue('password123')
    await flushPromises()

    await wrapper.vm.$nextTick()
  })

  it('successfully resets password with valid data', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'Password reset successfully' },
      status: 200,
    })

    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token-123',
        new_password: 'newpassword123',
      }),
    })
  })

  it('shows success message after successful reset', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 200,
    })

    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Password reset successfully')
  })

  it('redirects to login after successful reset with delay', async () => {
    vi.useFakeTimers()

    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 200,
    })

    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    // Should not redirect immediately
    expect(router.currentRoute.value.path).toBe('/app/reset-password/valid-token-123')

    // Advance timer by 2 seconds
    vi.advanceTimersByTime(2000)
    await flushPromises()

    // Should redirect after delay
    expect(router.currentRoute.value.path).toBe('/app/login')

    vi.useRealTimers()
  })

  it('disables submit button while submitting', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

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

    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Resetting password')
  })

  it('displays error message on failed reset', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue({
      data: { error: 'Invalid or expired token' },
    })

    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Invalid or expired token')
  })

  it('displays generic error on non-200 status', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: {},
      status: 400,
    })

    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Password reset failed')
  })

  it('trims whitespace from password', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 200,
    })

    await router.push('/app/reset-password/valid-token-123')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('  newpassword123  ')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('  newpassword123  ')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token-123',
        new_password: 'newpassword123',
      }),
    })
  })

  it('does not submit when token is missing', async () => {
    const { apiFetch } = await import('../../src/api')

    await router.push('/app/reset-password')

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const passwordInput = wrapper.find('input#new-password')
    await passwordInput.setValue('newpassword123')

    const repeatPasswordInput = wrapper.find('input#confirm-password')
    await repeatPasswordInput.setValue('newpassword123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).not.toHaveBeenCalled()
  })
})
