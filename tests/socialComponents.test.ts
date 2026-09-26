import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import UranusOrgCard from '@/component/org/card/UranusOrgCard.vue'
import UranusAdminEventCard from '@/component/event/card/UranusAdminEventCard.vue'
import { createEmptyOrgListItem } from '@/domain/org/orgListItem.model'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api'
import { socialApi } from '@/api/social'
import UranusSocialAccountsModal from '@/component/social/UranusSocialAccountsModal.vue'
import UranusEventSocialPostModal from '@/component/social/UranusEventSocialPostModal.vue'
import en from '@/i18n/json/en.json'
import { socialAccount, socialPost, socialPreviews } from './fixtures/social'

vi.mock('@/api/social', async importOriginal => ({
  ...await importOriginal<typeof import('@/api/social')>(),
  socialApi: { listAccounts: vi.fn(), createAccount: vi.fn(), updateAccount: vi.fn(), deleteAccount: vi.fn(),
    listEventPosts: vi.fn(), createEventPost: vi.fn(), getPost: vi.fn(), updateTargets: vi.fn(), preview: vi.fn(), publish: vi.fn() },
}))
const wrappers: VueWrapper[] = []
function globalOptions() {
  return { plugins: [createI18n({ legacy: false, locale: 'en', messages: { en } })], stubs: {
    UranusModal: { props: ['show'], template: '<div v-if="show"><slot /><slot name="actions" /></div>' },
    UranusFeedback: { template: '<div role="status"><slot /></div>' },
  } }
}
function accountsModal() {
  const wrapper = mount(UranusSocialAccountsModal, { props: { orgUuid: 'org-1' }, global: globalOptions() })
  wrappers.push(wrapper)
  return wrapper
}
function postModal() {
  const wrapper = mount(UranusEventSocialPostModal, {
    props: { orgUuid: 'org-1', eventUuid: 'event-1', eventTitle: 'Concert' }, global: globalOptions(),
  })
  wrappers.push(wrapper)
  return wrapper
}
function button(wrapper: VueWrapper, label: string) {
  const found = wrapper.findAll('button').find(b => b.text() === label)
  if (!found) throw new Error(`Button not found: ${label}`)
  return found
}
async function selectAndPreview(wrapper: VueWrapper) {
  await flushPromises()
  await wrapper.get('#social-target-account-1').setValue(true)
  await wrapper.get('#social-target-account-2').setValue(true)
  await button(wrapper, en.social_prepare_preview).trigger('click')
  await flushPromises()
}
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(socialApi.listAccounts).mockResolvedValue([socialAccount(), socialAccount('account-2')])
  vi.mocked(socialApi.listEventPosts).mockResolvedValue([])
  vi.mocked(socialApi.createEventPost).mockResolvedValue(socialPost())
  vi.mocked(socialApi.updateTargets).mockResolvedValue(socialPost())
  vi.mocked(socialApi.preview).mockResolvedValue(socialPreviews())
  vi.mocked(socialApi.getPost).mockResolvedValue(socialPost())
})
afterEach(() => {
  wrappers.splice(0).forEach(w => w.unmount())
  vi.useRealTimers()
})

describe('organization social accounts editor', () => {
  it('loads organization targets, adds a target and clears transient secrets', async () => {
    vi.mocked(socialApi.createAccount).mockResolvedValue(socialAccount('new-account'))
    const wrapper = accountsModal()
    await flushPromises()
    expect(socialApi.listAccounts).toHaveBeenCalledWith('org-1')
    expect(wrapper.text()).toContain('account-1')
    await button(wrapper, en.social_add_account).trigger('click')
    await wrapper.get('#social-name').setValue('New account')
    await wrapper.get('#social-remote-id').setValue('page-id')
    await wrapper.get('#social-access-token').setValue('write-only-secret')
    expect(wrapper.get('#social-access-token').attributes('type')).toBe('password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(socialApi.createAccount).toHaveBeenCalledWith('org-1', expect.objectContaining({ name: 'New account', remoteAccountId: 'page-id', accessToken: 'write-only-secret' }))
    expect(wrapper.text()).toContain(en.social_saved)
    expect(wrapper.html()).not.toContain('write-only-secret')
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })
  it('edits and disables a target without overwriting saved credentials', async () => {
    vi.mocked(socialApi.updateAccount).mockResolvedValue(socialAccount('account-1', { name: 'Changed', enabled: false }))
    const wrapper = accountsModal()
    await flushPromises()
    await button(wrapper, en.edit).trigger('click')
    expect(wrapper.get<HTMLInputElement>('#social-access-token').element.value).toBe('')
    await wrapper.get('#social-name').setValue('Changed')
    await wrapper.get('#social-enabled').setValue(false)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(socialApi.updateAccount).toHaveBeenCalledWith('account-1', expect.objectContaining({ name: 'Changed', enabled: false }))
    expect(vi.mocked(socialApi.updateAccount).mock.calls[0]?.[1]).not.toHaveProperty('accessToken')
    expect(wrapper.text()).toContain('Changed')
  })
  it('shows safe API errors and clears credentials even after failed saves', async () => {
    vi.mocked(socialApi.updateAccount).mockRejectedValue(new ApiError('secret-in-error', 409))
    const wrapper = accountsModal()
    await flushPromises()
    await button(wrapper, en.edit).trigger('click')
    await wrapper.get('#social-access-token').setValue('secret-in-error')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain(en.social_error_conflict)
    expect(wrapper.html()).not.toContain('secret-in-error')
    expect(wrapper.get<HTMLInputElement>('#social-access-token').element.value).toBe('')
  })
  it('shows list failure distinctly from empty state and allows retry', async () => {
    vi.mocked(socialApi.listAccounts).mockRejectedValueOnce(new ApiError('denied', 403))
    const wrapper = accountsModal()
    await flushPromises()
    expect(wrapper.text()).toContain(en.error_message_forbidden_action)
    expect(wrapper.text()).not.toContain(en.social_no_accounts)
    await button(wrapper, en.social_reload).trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('account-1')
  })
  it('confirms deletion and retains the account when the API rejects it', async () => {
    vi.mocked(socialApi.deleteAccount).mockRejectedValue(new ApiError('used', 409))
    const wrapper = accountsModal()
    await flushPromises()
    await button(wrapper, en.delete).trigger('click')
    expect(socialApi.deleteAccount).not.toHaveBeenCalled()
    const confirmButtons = wrapper.findAll('button').filter(b => b.text() === en.delete)
    await confirmButtons.at(-1)!.trigger('click')
    await flushPromises()
    expect(socialApi.deleteAccount).toHaveBeenCalledWith('account-1')
    expect(wrapper.text()).toContain(en.social_error_conflict)
    expect(wrapper.text()).toContain('account-1')
  })
})

describe('event social posting', () => {
  it('loads the event organization, selects multiple targets and publishes a single post', async () => {
    vi.mocked(socialApi.publish).mockResolvedValue(socialPost('scheduled').targets.map(t => ({ targetUuid: t.uuid, socialAccountUuid: t.socialAccountUuid, status: t.status, error: null })))
    vi.mocked(socialApi.getPost).mockResolvedValue(socialPost('scheduled'))
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    expect(socialApi.listAccounts).toHaveBeenCalledWith('org-1')
    expect(socialApi.listEventPosts).toHaveBeenCalledWith('org-1', 'event-1')
    expect(socialApi.createEventPost).toHaveBeenCalledOnce()
    expect(socialApi.createEventPost).toHaveBeenCalledWith('org-1', 'event-1', ['account-1', 'account-2'])
    expect(wrapper.text()).toContain(en.social_draft_created)
    expect(wrapper.text()).toContain('Concert preview')
    await button(wrapper, en.social_publish).trigger('click')
    await flushPromises()
    expect(socialApi.publish).toHaveBeenCalledWith('post-1', 'en')
    expect(wrapper.text()).toContain(en.social_accepted)
    expect(wrapper.text()).not.toContain(en.social_published)
    expect(wrapper.findAll('button').some(b => b.text() === en.social_publish)).toBe(false)
  })
  it('polls accepted posts to successful completion and stops after unmount', async () => {
    vi.useFakeTimers()
    vi.mocked(socialApi.publish).mockResolvedValue([{ targetUuid: 'target-0', socialAccountUuid: 'account-1', status: 'scheduled', error: null }])
    vi.mocked(socialApi.getPost).mockResolvedValueOnce(socialPost('scheduled')).mockResolvedValue(socialPost('published'))
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    await button(wrapper, en.social_publish).trigger('click')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(wrapper.text()).toContain(en.social_published)
    expect(socialApi.getPost).toHaveBeenCalledTimes(2)
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(10000)
    expect(socialApi.getPost).toHaveBeenCalledTimes(2)
  })
  it('shows publish errors without losing the saved draft or creating another post', async () => {
    vi.mocked(socialApi.publish).mockRejectedValue(new ApiError('private-provider-error', 500))
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    await button(wrapper, en.social_publish).trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(en.social_error_request)
    expect(wrapper.text()).not.toContain('private-provider-error')
    expect(socialApi.createEventPost).toHaveBeenCalledTimes(1)
  })
  it('shows worker failures per target and does not claim publication succeeded', async () => {
    vi.mocked(socialApi.publish).mockResolvedValue([])
    vi.mocked(socialApi.getPost).mockResolvedValue(socialPost('failed'))
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    await button(wrapper, en.social_publish).trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(en.social_target_failed)
    expect(wrapper.text()).not.toContain(en.social_published)
  })
  it('supports empty state configuration and excludes disabled accounts', async () => {
    vi.mocked(socialApi.listAccounts).mockResolvedValue([socialAccount('disabled', { enabled: false })])
    const wrapper = postModal()
    await flushPromises()
    expect(wrapper.text()).toContain(en.social_no_accounts)
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(0)
    await button(wrapper, en.social_configure).trigger('click')
    expect(wrapper.findComponent(UranusSocialAccountsModal).exists()).toBe(true)
  })
  it('offers previews but prevents publishing on unimplemented platforms', async () => {
    vi.mocked(socialApi.listAccounts).mockResolvedValue([socialAccount('account-1', { platform: 'facebook' }), socialAccount('account-2')])
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    expect(wrapper.text()).toContain(en.social_preview_only_hint)
    expect(wrapper.findAll('button').some(b => b.text() === en.social_publish)).toBe(false)
    expect(socialApi.publish).not.toHaveBeenCalled()
  })
  it('recovers an existing queued post without creating a duplicate', async () => {
    vi.mocked(socialApi.listEventPosts).mockResolvedValue([socialPost('scheduled')])
    vi.mocked(socialApi.getPost).mockResolvedValue(socialPost('scheduled'))
    const wrapper = postModal()
    await flushPromises()
    await wrapper.get('section button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(en.social_worker_hint)
    expect(socialApi.createEventPost).not.toHaveBeenCalled()
    expect(socialApi.publish).not.toHaveBeenCalled()
  })
  it('requires a fresh preview after changing targets', async () => {
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    expect(button(wrapper, en.social_publish).exists()).toBe(true)
    await wrapper.get('#social-target-account-2').setValue(false)
    expect(wrapper.findAll('button').some(b => b.text() === en.social_publish)).toBe(false)
  })
  it('preserves the draft after preview failure', async () => {
    vi.mocked(socialApi.preview).mockRejectedValue(new ApiError('an image is required', 400))
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    expect(wrapper.text()).toContain(en.social_error_image)
    await button(wrapper, en.social_prepare_preview).trigger('click')
    await flushPromises()
    expect(socialApi.createEventPost).toHaveBeenCalledTimes(1)
    expect(socialApi.updateTargets).toHaveBeenCalledTimes(1)
  })
  it('does not create twice while the first create request is pending', async () => {
    let finish: ((value: ReturnType<typeof socialPost>) => void) | undefined
    vi.mocked(socialApi.createEventPost).mockReturnValue(new Promise(resolve => { finish = resolve }))
    const wrapper = postModal()
    await flushPromises()
    await wrapper.get('#social-target-account-1').setValue(true)
    await wrapper.get('#social-target-account-2').setValue(true)
    const prepare = button(wrapper, en.social_prepare_preview)
    await prepare.trigger('click')
    await prepare.trigger('click')
    expect(socialApi.createEventPost).toHaveBeenCalledTimes(1)
    finish!(socialPost())
    await flushPromises()
    expect(wrapper.text()).toContain('Concert preview')
  })
  it('reconciles an ambiguous publish response without publishing twice', async () => {
    vi.mocked(socialApi.publish).mockRejectedValue(new Error('connection lost after commit'))
    vi.mocked(socialApi.getPost).mockResolvedValue(socialPost('scheduled'))
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    await button(wrapper, en.social_publish).trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(en.social_manual_queue)
    expect(wrapper.findAll('button').some(b => b.text() === en.social_publish)).toBe(false)
    expect(socialApi.publish).toHaveBeenCalledTimes(1)
  })
  it('invalidates a preview when a refreshed post has different targets', async () => {
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    expect(button(wrapper, en.social_publish).exists()).toBe(true)
    const changed = socialPost()
    changed.targets[0]!.uuid = 'replacement-target'
    vi.mocked(socialApi.getPost).mockResolvedValue(changed)
    await button(wrapper, en.social_refresh_status).trigger('click')
    await flushPromises()
    expect(wrapper.findAll('button').some(b => b.text() === en.social_publish)).toBe(false)
  })
  it('requires list recovery after an ambiguous creation failure', async () => {
    vi.mocked(socialApi.createEventPost).mockRejectedValue(new Error('network'))
    const wrapper = postModal()
    await selectAndPreview(wrapper)
    expect(wrapper.text()).toContain(en.social_creation_uncertain)
    expect(button(wrapper, en.social_prepare_preview).attributes('disabled')).toBeDefined()
    expect(socialApi.createEventPost).toHaveBeenCalledTimes(1)
  })
})


describe('social action permissions', () => {
  it('shows organization management only with the existing canEditOrg grant', async () => {
    const global = globalOptions()
    const org = { ...createEmptyOrgListItem(), uuid: 'org-1', name: 'Org' }
    const wrapper = mount(UranusOrgCard, { props: { org }, global: {
      ...global, plugins: [...global.plugins, createPinia()], stubs: { ...global.stubs, UranusLogoImage: true, UranusPasswordConfirmModal: true },
    } })
    wrappers.push(wrapper)
    expect(wrapper.text()).not.toContain(en.social_media)
    await wrapper.setProps({ org: { ...org, canEditOrg: true } })
    await button(wrapper, en.social_media).trigger('click')
    await flushPromises()
    expect(wrapper.findComponent(UranusSocialAccountsModal).exists()).toBe(true)
    await wrapper.setProps({ org })
    expect(wrapper.findComponent(UranusSocialAccountsModal).exists()).toBe(false)
  })
  it('does not equate event editing with the API-required organization grant', async () => {
    const event: AdminEventListItem = {
      uuid: 'event-1', dateUuid: 'date-1', orgUuid: 'org-1', title: 'Concert', categories: null,
      canEditEvent: true, canDeleteEvent: false, canReleaseEvent: false, canViewEventInsights: false,
      isOnlineEvent: false, startDate: '2026-09-26', startTime: '18:00', seriesTotal: 1,
    }
    const global = globalOptions()
    const wrapper = mount(UranusAdminEventCard, { props: { event }, global: {
      ...global, plugins: [...global.plugins, createPinia()], stubs: { ...global.stubs, RouterLink: true, UranusPasswordConfirmModal: true },
    } })
    wrappers.push(wrapper)
    expect(wrapper.text()).not.toContain(en.social_post_event)
    await wrapper.setProps({ canPostSocial: true })
    await button(wrapper, en.social_post_event).trigger('click')
    await flushPromises()
    expect(wrapper.findComponent(UranusEventSocialPostModal).exists()).toBe(true)
    await wrapper.setProps({ canPostSocial: false })
    expect(wrapper.findComponent(UranusEventSocialPostModal).exists()).toBe(false)
  })
})
