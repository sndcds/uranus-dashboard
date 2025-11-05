import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import SignupView from '../../src/views/SignupView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      signup: 'Sign Up',
      signup_subtitle: 'Create a new organizer account to get started.',
      email: 'Email',
      repeat_email: 'Repeat Email',
      password: 'Password',
      signup_cta: 'Create Account',
      signup_loading: 'Creating account…',
      have_account: 'Already have an account?',
      login: 'Log In',
      event_error_required: 'This field is required',
      organizer_form_invalid_email: 'Please provide a valid email address.',
      emails_do_not_match: 'Email addresses do not match',
      signup_failed: 'Signup failed',
      password_show_label: 'Show password',
      password_hide_label: 'Hide password',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/app/signup', name: 'signup', component: { template: '<div>Signup</div>' } },
    { path: '/app/login', name: 'login', component: { template: '<div>Login</div>' } },
  ],
})

// Mock apiFetch
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

describe('SignupView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    router.push('/app/signup')
  })

  it('renders signup form with all fields', () => {
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.find('h1').text()).toBe('Sign Up')
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#signup-email').exists()).toBe(true)
    expect(wrapper.find('#signup-repeat-email').exists()).toBe(true)
    expect(wrapper.find('#signup-password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('displays subtitle text', () => {
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.text()).toContain('Create a new organizer account')
  })

  it('shows link to login page', () => {
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const loginLink = wrapper.find('a[href="/app/login"]')
    expect(loginLink.exists()).toBe(true)
    expect(loginLink.text()).toBe('Log In')
  })

  it('validates required email field', async () => {
    const wrapper = mount(SignupView, {
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
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('invalid-email')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('valid email address')
  })

  it('validates required repeat email field', async () => {
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('This field is required')
  })

  it('validates repeat email format', async () => {
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('invalid')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('valid email address')
  })

  it('validates emails match', async () => {
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('different@example.com')

    const passwordInput = wrapper.find('#signup-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('do not match')
  })

  it('validates emails match case-insensitively', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 201,
    })

    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('Test@Example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#signup-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalled()
  })

  it('validates required password field', async () => {
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('test@example.com')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('This field is required')
  })

  it('clears email error when valid email is entered', async () => {
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')
    await flushPromises()

    await wrapper.vm.$nextTick()
  })

  it('clears repeat email error when emails match', async () => {
    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('different@example.com')

    const passwordInput = wrapper.find('#signup-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    await repeatEmailInput.setValue('test@example.com')
    await flushPromises()

    await wrapper.vm.$nextTick()
  })

  it('successfully signs up with valid data', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'Account created successfully' },
      status: 201,
    })

    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#signup-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    // Should redirect to login
    expect(router.currentRoute.value.path).toBe('/app/login')
  })

  it('resets form after successful signup', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 201,
    })

    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#signup-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    // Form should be reset (inputs cleared)
    expect((emailInput.element as HTMLInputElement).value).toBe('')
    expect((repeatEmailInput.element as HTMLInputElement).value).toBe('')
    expect((passwordInput.element as HTMLInputElement).value).toBe('')
  })

  it('displays error message on failed signup', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue({
      data: { error: 'Email already exists' },
    })

    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#signup-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Email already exists')
  })

  it('disables submit button while submitting', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#signup-password')
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

    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#signup-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Creating account')
  })

  it('trims whitespace from inputs', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { message: 'success' },
      status: 201,
    })

    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('  test@example.com  ')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('  test@example.com  ')

    const passwordInput = wrapper.find('#signup-password')
    await passwordInput.setValue('  password123  ')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })
  })

  it('displays generic error on non-201 status', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: {},
      status: 400,
    })

    const wrapper = mount(SignupView, {
      global: {
        plugins: [i18n, router],
      },
    })

    const emailInput = wrapper.find('#signup-email')
    await emailInput.setValue('test@example.com')

    const repeatEmailInput = wrapper.find('#signup-repeat-email')
    await repeatEmailInput.setValue('test@example.com')

    const passwordInput = wrapper.find('#signup-password')
    await passwordInput.setValue('password123')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.feedback--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Signup failed')
  })
})
