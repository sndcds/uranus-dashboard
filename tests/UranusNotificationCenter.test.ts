import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import { apiFetch, type ApiResponse } from '@/api'
import { useTokenStore } from '@/store/uranusTokenStore'
import { useUserStore } from '@/store/userStore'
import { useNotificationStore } from '@/store/notificationStore'
import UranusNotificationCenter from '@/component/notification/UranusNotificationCenter.vue'
import { safeNotificationAction } from '@/domain/notification/notification.mapper'
import type { NotificationDTO } from '@/domain/notification/notification.model'
import de from '@/i18n/json/de.json'
import en from '@/i18n/json/en.json'
import da from '@/i18n/json/da.json'

vi.mock('@/api', () => ({ apiFetch: vi.fn() }))
const fetchMock = vi.mocked(apiFetch)
const org = '019d2eed-a25a-7caf-a762-a2a71917c6a1'
const member = '019d9c59-4c56-723a-b38e-08ef287cee35'
const permissions = `/admin/org/${org}/member/${member}/permissions`
const fixture = (changes: Partial<NotificationDTO> = {}): NotificationDTO => ({
  uuid: 'notification-1',
  type: 'organization_team_invite_accepted',
  organization_uuid: org,
  action_url: permissions,
  metadata: {
    organization_name: 'Kulturzentrum Beispiel',
    member_name: 'Anna Beispiel',
  },
  created_at: '2026-09-10T10:00:00Z',
  read_at: null,
  dismissed_at: null,
  ...changes,
})
function response<T>(data: T): ApiResponse<T> {
  return {
    status: 200,
    data,
    service: 'test',
    api_version: '1',
    response_type: 'success',
    timestamp: '',
  }
}
function page(items: NotificationDTO[], hasMore = false) {
  return response({ notifications: items, has_more: hasMore })
}
let wrapper: VueWrapper | undefined

beforeEach(() => {
  fetchMock.mockReset()
  setActivePinia(createPinia())
  useTokenStore().setTokens('test-access')
  useUserStore().setUserUuid('inviter')
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

async function render(items: NotificationDTO[] = [fixture()], locale = 'de') {
  fetchMock.mockResolvedValueOnce(page(items))
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/dashboard', component: { template: '<div />' } },
      {
        path: '/admin/org/:orgUuid/member/:memberUuid/permissions',
        component: { template: '<div />' },
      },
      { path: '/admin/orgs', component: { template: '<div />' } },
    ],
  })
  await router.push('/admin/dashboard')
  wrapper = mount(UranusNotificationCenter, {
    global: {
      plugins: [
        router,
        createI18n({ legacy: false, locale, messages: { de, en, da } }),
      ],
    },
  })
  await flushPromises()
  return { wrapper, router, store: useNotificationStore() }
}
function button(text: string) {
  const result = wrapper?.findAll('button').find((item) => item.text() === text)
  if (!result) throw new Error(`Button missing: ${text}`)
  return result
}

describe('persistent notification center', () => {
  it('renders unread inviter copy without automatically marking it read', async () => {
    const { wrapper } = await render()
    expect(wrapper.text()).toContain('Neues Teammitglied')
    expect(wrapper.text()).toContain(
      'Anna Beispiel ist dem Team von Kulturzentrum Beispiel beigetreten.',
    )
    expect(wrapper.find('.notification-center__item--unread').exists()).toBe(
      true,
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('opens the exact member permission route and marks the notification read', async () => {
    const { router, store } = await render()
    fetchMock.mockResolvedValueOnce(
      response({ read_at: '2026-09-10T11:00:00Z', dismissed_at: null }),
    )
    await button('Berechtigungen festlegen').trigger('click')
    await flushPromises()
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/admin/user/notifications/notification-1/read',
      { method: 'PATCH' },
    )
    expect(router.currentRoute.value.path).toBe(permissions)
    expect(store.unreadCount).toBe(0)
    expect(store.notifications).toHaveLength(1)
  })

  it('opens the existing organization list for a new member', async () => {
    const { router } = await render([
      fixture({ type: 'organization_team_joined', action_url: '/admin/orgs' }),
    ])
    expect(wrapper?.text()).toContain('Willkommen im Team')
    expect(wrapper?.text()).toContain(
      'Deine Mitgliedschaft wurde erfolgreich aktiviert.',
    )
    fetchMock.mockResolvedValueOnce(
      response({ read_at: 'now', dismissed_at: null }),
    )
    await button('Organisation öffnen').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/admin/orgs')
  })

  it('marks read only after API success and retains the visible card', async () => {
    await render()
    fetchMock.mockResolvedValueOnce(
      response({ read_at: 'now', dismissed_at: null }),
    )
    await button('Als gelesen markieren').trigger('click')
    await flushPromises()
    expect(wrapper?.find('.notification-center__item--unread').exists()).toBe(
      false,
    )
    expect(wrapper?.find('.notification-center__item').exists()).toBe(true)
  })

  it('dismisses and stays empty after reloading the persisted server state', async () => {
    const { store } = await render()
    fetchMock.mockResolvedValueOnce(
      response({ read_at: null, dismissed_at: 'now' }),
    )
    await button('Ausblenden').trigger('click')
    await flushPromises()
    expect(store.notifications).toHaveLength(0)
    fetchMock.mockResolvedValueOnce(page([]))
    await store.load()
    await flushPromises()
    expect(wrapper?.text()).toContain('Du hast keine Benachrichtigungen.')
  })

  it('keeps the card and shows a localized error when an action fails', async () => {
    const { router, store } = await render()
    fetchMock.mockRejectedValueOnce(new Error('private server detail'))
    await button('Berechtigungen festlegen').trigger('click')
    await flushPromises()
    await vi.waitFor(() =>
      expect(wrapper?.find('[role="alert"]').text()).toContain(
        'Bitte versuche es erneut.',
      ),
    )
    expect(wrapper?.text()).not.toContain('private server detail')
    expect(store.unreadCount).toBe(1)
    expect(router.currentRoute.value.path).toBe('/admin/dashboard')
  })

  it('shows empty state', async () => {
    await render([])
    expect(wrapper?.text()).toContain('Du hast keine Benachrichtigungen.')
    expect(wrapper?.find('.notification-center__item').exists()).toBe(false)
  })

  it('retries a failed load', async () => {
    const { store } = await render([])
    fetchMock.mockRejectedValueOnce(new Error('offline'))
    await store.load()
    await flushPromises()
    await vi.waitFor(() =>
      expect(wrapper?.find('[role="alert"]').exists()).toBe(true),
    )
    fetchMock.mockResolvedValueOnce(page([fixture()]))
    await button('Erneut versuchen').trigger('click')
    await flushPromises()
    expect(wrapper?.text()).toContain('Anna Beispiel')
    expect(store.error).toBe(false)
  })

  it.each([
    ['en', 'New team member', 'Set permissions'],
    ['da', 'Nyt teammedlem', 'Indstil rettigheder'],
  ])('renders %s translations', async (locale, title, action) => {
    await render([fixture()], locale)
    expect(wrapper?.text()).toContain(title)
    expect(button(action).exists()).toBe(true)
    expect(wrapper?.text()).not.toContain('notification_')
  })

  it('supports pagination without duplicate cards', async () => {
    const { store } = await render()
    fetchMock.mockResolvedValueOnce(
      page([fixture(), fixture({ uuid: 'second' })]),
    )
    await store.load(true)
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/admin/user/notifications?offset=1',
    )
    expect(store.notifications).toHaveLength(2)
  })

  it('clears on logout and ignores a previous account request', async () => {
    const { store } = await render()
    let resolve!: (value: ApiResponse<unknown>) => void
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const loading = store.load()
    useTokenStore().clearTokens({ broadcast: false })
    expect(store.notifications).toHaveLength(0)
    resolve(page([fixture()]))
    await loading
    expect(store.notifications).toHaveLength(0)
  })

  it('ignores a stale GET that finishes after dismiss', async () => {
    const { store } = await render()
    let resolve!: (value: ApiResponse<unknown>) => void
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const loading = store.load()
    fetchMock.mockResolvedValueOnce(
      response({ read_at: null, dismissed_at: 'now' }),
    )
    await store.update('notification-1', 'dismiss')
    resolve(page([fixture()]))
    await loading
    expect(store.notifications).toHaveLength(0)
  })

  it('does not render an external action URL', async () => {
    await render([fixture({ action_url: 'https://evil.example' })])
    expect(wrapper?.text()).not.toContain('Berechtigungen festlegen')
  })
})

it.each([
  'https://evil.example',
  '//evil.example',
  '/admin/\\evil',
  'javascript:alert(1)',
  '/app/login',
])('rejects unsafe action %s', (value) => {
  expect(safeNotificationAction(value)).toBeNull()
})
