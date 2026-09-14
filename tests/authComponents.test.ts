import { createApp } from 'vue'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia, disposePinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GenericHeader from '@/component/layout/GenericHeader.vue'
import UranusLoginView from '@/component/register/UranusLoginView.vue'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { SessionError } from '@/api/authSession.ts'
import { deferred, installSessionLocks, restoreAuthGlobals, jsonResponse, profile } from './helpers/auth'

let pinia: ReturnType<typeof createPinia>
const wrappers: Array<ReturnType<typeof shallowMount>> = []
beforeEach(() => { installSessionLocks(); pinia = createPinia(); createApp({}).use(pinia); setActivePinia(pinia) })
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); disposePinia(pinia); restoreAuthGlobals() })

function testRouter() {
  const component = { template: '<div />' }
  return createRouter({ history: createMemoryHistory(), routes: [
    { path: '/app/login', name: 'app-login', component },
    { path: '/app/signup', name: 'app-signup', component },
    { path: '/admin/edit', component },
    { path: '/page/about', component },
  ] })
}

function mountOptions(router: ReturnType<typeof testRouter>) {
  return { global: {
    plugins: [pinia, router, createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false, messages: { en: {} } })],
    stubs: {
      UranusBasicCardPage: { template: '<div><slot /></div>' },
      UranusCard: { template: '<div><slot /></div>' },
      UranusForm: { template: '<form><slot /></form>' },
      UranusFormActions: { template: '<div><slot /></div>' },
      UranusFeedback: { template: '<div role="alert"><slot /></div>' },
      UranusButton: { props: ['disabled', 'type'], template: '<button :disabled="disabled" :type="type"><slot /></button>' },
      UranusTextfield: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
      UranusPasswordInput: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
    },
  } }
}

describe('authentication UI', () => {
  it('uses session login without handling JWTs, preserves passwords and restores a deep link', async () => {
    const router = testRouter(); await router.push('/app/login?redirect=/admin/edit')
    const login = vi.spyOn(useTokenStore(), 'login').mockResolvedValue(profile)
    const wrapper = shallowMount(UranusLoginView, mountOptions(router)); wrappers.push(wrapper)
    await wrapper.get('#login-email').setValue(' ada@example.test ')
    await wrapper.get('#login-password').setValue(' password with spaces ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(login).toHaveBeenCalledWith('ada@example.test', ' password with spaces ')
    expect(router.currentRoute.value.path).toBe('/admin/edit')
    expect((wrapper.get('#login-password').element as HTMLInputElement).value).toBe('')
  })

  it('keeps the login screen and explains blocked cookies', async () => {
    const router = testRouter(); await router.push('/app/login')
    vi.spyOn(useTokenStore(), 'login').mockRejectedValue(new SessionError('cookies'))
    const wrapper = shallowMount(UranusLoginView, mountOptions(router)); wrappers.push(wrapper)
    await wrapper.get('#login-email').setValue('ada@example.test')
    await wrapper.get('#login-password').setValue('password')
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(wrapper.text()).toContain('auth_session_cookies')
    expect(router.currentRoute.value.path).toBe('/app/login')
  })

  it('does not revoke the session when the user cancels leaving an edited page', async () => {
    const router = testRouter(); await router.push('/admin/edit')
    router.beforeEach(() => false)
    const store = useTokenStore(); store.status = 'authenticated'
    const logout = vi.spyOn(store, 'logout')
    const wrapper = shallowMount(GenericHeader, mountOptions(router)); wrappers.push(wrapper)
    await wrapper.get('.generic-header__user-trigger').trigger('click')
    await wrapper.get('.generic-header__user-dropdown-item--logout').trigger('click')
    await flushPromises()
    expect(logout).not.toHaveBeenCalled()
    expect(store.isAuthenticated).toBe(true)
  })

  it('shows failed server logout and disables duplicate requests while pending', async () => {
    const router = testRouter(); await router.push('/admin/edit')
    const store = useTokenStore(); store.status = 'authenticated'
    const pending = deferred<Response>()
    const fetch = vi.fn().mockReturnValue(pending.promise); vi.stubGlobal('fetch', fetch)
    const wrapper = shallowMount(GenericHeader, mountOptions(router)); wrappers.push(wrapper)
    await wrapper.get('.generic-header__user-trigger').trigger('click')
    await wrapper.get('.generic-header__user-dropdown-item--logout').trigger('click')
    await flushPromises()
    expect(store.isLoggingOut).toBe(true)
    await wrapper.get('.generic-header__user-trigger').trigger('click')
    expect(wrapper.get('.generic-header__user-dropdown-item--logout').attributes('disabled')).toBeDefined()
    pending.resolve(jsonResponse({}, 503)); await flushPromises()
    expect(store.isAuthenticated).toBe(true)
    expect(wrapper.get('[role="alert"]').text()).toContain('logout_failed')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0]?.[0]).toBe('/api/admin/logout')
  })
})
