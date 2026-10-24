import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { apiFetch, type ApiResponse } from '@/api'
import type { PartnerRequestDTO } from '@/api/dto/partner.dto'
import { useAppStore } from '@/store/appStore'
import UranusDashboardPartnerRequests from '@/component/dashboard/UranusDashboardPartnerRequests.vue'
import UranusPartnerGrantCard from '@/component/partner/card/UranusPartnerGrantCard.vue'
import UranusPartnerGrantsModal from '@/component/partner/UranusPartnerGrantsModal.vue'
import de from '@/i18n/json/de.json'

vi.mock('@/api', () => ({ apiFetch: vi.fn() }))

const wrappers: VueWrapper[] = []
let requests: PartnerRequestDTO[]
let canAnswer: boolean
let canEdit: boolean

function response<T>(data: T): ApiResponse<T> {
  return { service: 'uranus', api_version: '1', response_type: 'success', status: 200, timestamp: '', data }
}

function globalOptions() {
  const pinia = createPinia()
  return {
    plugins: [pinia, createI18n({ legacy: false, locale: 'de', messages: { de } })],
    stubs: {
      UranusModal: {
        props: ['show', 'title'],
        template: '<div v-if="show" class="test-modal"><h1>{{ title }}</h1><slot /></div>',
      },
      UranusFeedback: { template: '<div role="status"><slot /></div>' },
    },
  }
}

function dashboard(orgUuid: string | null = 'my-org') {
  const global = globalOptions()
  const store = useAppStore(global.plugins[0] as ReturnType<typeof createPinia>)
  store.setOrgUuid(orgUuid)
  store.setOrgName('Meine Organisation')
  const wrapper = mount(UranusDashboardPartnerRequests, { global })
  wrappers.push(wrapper)
  return { wrapper, store }
}

function button(wrapper: VueWrapper, label: string) {
  const found = wrapper.findAll('button').find(item => item.text() === label)
  if (!found) throw new Error(`Button not found: ${label}`)
  return found
}

function mutations() {
  return vi.mocked(apiFetch).mock.calls.filter(([, options]) => options?.method === 'POST')
}

async function openAcceptance(wrapper: VueWrapper) {
  await flushPromises()
  await button(wrapper, de.partner_accept_and_grant).trigger('click')
  return wrapper.get('.test-modal')
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-23T12:00:00'))
  canAnswer = true
  canEdit = true
  requests = [
    { direction: 'outgoing', status: 'pending', created_at: '2026-10-20T09:00:00', org_uuid: 'outgoing', org_name: 'Zielorganisation' },
    { direction: 'incoming', status: 'pending', created_at: '2026-10-22T09:00:00', org_uuid: 'incoming', org_name: 'Anfragende Organisation' },
    { direction: 'incoming', status: 'accepted', created_at: '2026-10-01T09:00:00', org_uuid: 'accepted', org_name: 'Schon angenommen' },
    { direction: 'outgoing', status: 'rejected', created_at: '2026-10-01T09:00:00', org_uuid: 'rejected', org_name: 'Schon abgewiesen' },
  ]
  vi.mocked(apiFetch).mockImplementation(async (path, options) => {
    if (options?.method === 'POST') {
      if (path.endsWith('/accept') || path.endsWith('/reject')) {
        const request = requests.find(item => path.includes(`/request/${item.org_uuid}/`))
        if (request) request.status = path.endsWith('/accept') ? 'accepted' : 'rejected'
      }
      return response(undefined)
    }
    if (path.endsWith('/partner/requests')) return response({ partner_requests: structuredClone(requests) })
    if (path.endsWith('/partner/grants')) return response({ answer_partner_requests: canAnswer, edit_partner_rights: canEdit })
    throw new Error(`Unexpected API path: ${path}`)
  })
})

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  vi.useRealTimers()
})

describe('dashboard partner requests', () => {
  it('lists only pending requests with dates, organizations, and days pending', async () => {
    const { wrapper } = dashboard()
    await flushPromises()
    const cards = wrapper.findAll('section.uranus-card')
    expect(cards).toHaveLength(2)
    expect(cards[0]!.text()).toContain('Ausstehende Anfragen an Partner')
    expect(cards[0]!.text()).toContain('Anfrage vom 20.10.2026')
    expect(cards[0]!.text()).toContain('an Zielorganisation')
    expect(cards[0]!.text()).toContain('3 Tage ausstehend')
    expect(cards[0]!.findAll('button')).toHaveLength(0)
    expect(cards[1]!.text()).toContain('Partneranfragen an Meine Organisation')
    expect(cards[1]!.text()).toContain('Anfrage gestellt am 22.10.2026')
    expect(cards[1]!.text()).toContain('von Anfragende Organisation')
    expect(cards[1]!.text()).toContain('1 Tag ausstehend')
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.text()).not.toContain('Schon angenommen')
    expect(wrapper.text()).not.toContain('Schon abgewiesen')
  })

  it('shows no notices for empty results and makes no requests without an organization', async () => {
    const { wrapper, store } = dashboard(null)
    await flushPromises()
    expect(apiFetch).not.toHaveBeenCalled()
    expect(wrapper.find('section').exists()).toBe(false)
    requests = []
    store.setOrgUuid('my-org')
    await flushPromises()
    expect(wrapper.find('.uranus-card').exists()).toBe(false)
  })

  it('counts calendar days across daylight-saving changes and shows zero for requests from today', async () => {
    vi.setSystemTime(new Date('2026-10-26T12:00:00'))
    requests[0]!.created_at = '2026-10-24T23:59:00'
    requests[1]!.created_at = '2026-10-26T09:00:00'
    const { wrapper } = dashboard()
    await flushPromises()
    expect(wrapper.text()).toContain('2 Tage ausstehend')
    expect(wrapper.text()).toContain('0 Tage ausstehend')
  })

  it('opens permission selection before accepting and allows cancellation without changing anything', async () => {
    const { wrapper } = dashboard()
    const modal = await openAcceptance(wrapper)
    expect(modal.text()).toContain('Anfragende Organisation')
    expect(modal.findAll('input[type="checkbox"]')).toHaveLength(4)
    expect(mutations()).toHaveLength(0)
    await button(wrapper, de.cancel).trigger('click')
    expect(wrapper.find('.test-modal').exists()).toBe(false)
    expect(mutations()).toHaveLength(0)
  })

  it('accepts and saves the chosen rights, then removes the answered request', async () => {
    const { wrapper } = dashboard()
    const modal = await openAcceptance(wrapper)
    await modal.findAll('input')[0]!.setValue(true)
    await modal.findAll('input')[2]!.setValue(true)
    await modal.get('form').trigger('submit')
    await flushPromises()
    expect(mutations()).toEqual([
      ['/api/admin/org/my-org/partner/request/incoming/accept', { method: 'POST' }],
      ['/api/admin/org/my-org/partner/incoming/grants', { method: 'POST', body: JSON.stringify({
        can_choose_venue: true, can_choose_partner: false, can_choose_promoter: true, can_see_insights: false,
      }) }],
    ])
    expect(wrapper.find('.test-modal').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Anfragende Organisation')
    expect(wrapper.text()).toContain('Zielorganisation')
  })

  it('rejects incoming requests and retains them with feedback after a failure', async () => {
    const { wrapper } = dashboard()
    await flushPromises()
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('network'))
    await button(wrapper, de.partner_reject_request).trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(de.partner_request_reject_error)
    expect(wrapper.text()).toContain('Anfragende Organisation')
    await button(wrapper, de.partner_reject_request).trigger('click')
    await flushPromises()
    expect(mutations().at(-1)?.[0]).toBe('/api/admin/org/my-org/partner/request/incoming/reject')
    expect(wrapper.text()).not.toContain('Anfragende Organisation')
  })

  it('keeps permission selection open after acceptance fails without saving rights', async () => {
    const { wrapper } = dashboard()
    const modal = await openAcceptance(wrapper)
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('denied'))
    await modal.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain(de.partner_request_accept_error)
    expect(wrapper.find('.test-modal').exists()).toBe(true)
    expect(mutations()).toHaveLength(1)
  })

  it('retries only the permission save after the request was already accepted', async () => {
    const { wrapper } = dashboard()
    const modal = await openAcceptance(wrapper)
    vi.mocked(apiFetch).mockResolvedValueOnce(response(undefined)).mockRejectedValueOnce(new Error('network'))
    await modal.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain(de.partner_request_grants_save_error)
    expect(wrapper.find('.test-modal').exists()).toBe(true)
    await modal.get('form').trigger('submit')
    await flushPromises()
    expect(mutations().filter(([path]) => path.endsWith('/accept'))).toHaveLength(1)
    expect(mutations().filter(([path]) => path.endsWith('/grants'))).toHaveLength(2)
    expect(wrapper.find('.test-modal').exists()).toBe(false)
  })

  it('removes an accepted request when closing after permission saving failed', async () => {
    const { wrapper } = dashboard()
    const modal = await openAcceptance(wrapper)
    vi.mocked(apiFetch).mockResolvedValueOnce(response(undefined)).mockRejectedValueOnce(new Error('network'))
    requests[1]!.status = 'accepted'
    await modal.get('form').trigger('submit')
    await flushPromises()
    await button(wrapper, de.cancel).trigger('click')
    await flushPromises()
    expect(wrapper.find('.test-modal').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Anfragende Organisation')
  })

  it('prevents duplicate acceptance while saving is in progress', async () => {
    const { wrapper } = dashboard()
    const modal = await openAcceptance(wrapper)
    let finish: (value: ApiResponse<undefined>) => void = () => {}
    vi.mocked(apiFetch).mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    await modal.get('form').trigger('submit')
    await modal.get('form').trigger('submit')
    expect(mutations()).toHaveLength(1)
    expect(modal.get('fieldset').attributes('disabled')).toBeDefined()
    finish(response(undefined))
    await flushPromises()
    expect(mutations()).toHaveLength(2)
  })

  it('hides actions without answer permission and grants no rights without edit permission', async () => {
    canAnswer = false
    const { wrapper, store } = dashboard()
    await flushPromises()
    expect(wrapper.findAll('button')).toHaveLength(0)
    canAnswer = true
    canEdit = false
    store.setOrgUuid('other-org')
    await flushPromises()
    await button(wrapper, de.accept).trigger('click')
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(0)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(mutations()).toEqual([['/api/admin/org/other-org/partner/request/incoming/accept', { method: 'POST' }]])
  })

  it('discards responses for a previous organization after switching organizations', async () => {
    let resolvePrevious: (value: ApiResponse<unknown>) => void = () => {}
    vi.mocked(apiFetch).mockImplementationOnce(() => new Promise(resolve => { resolvePrevious = resolve }))
    const { wrapper, store } = dashboard()
    store.setOrgUuid('other-org')
    requests = []
    await flushPromises()
    resolvePrevious(response({ partner_requests: [{ direction: 'incoming', status: 'pending', org_uuid: 'stale', org_name: 'Alte Organisation', created_at: '2026-10-01' }] }))
    await flushPromises()
    expect(wrapper.text()).not.toContain('Alte Organisation')
    expect(wrapper.find('.uranus-card').exists()).toBe(false)
  })

  it('shows load errors with a working retry', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('network'))
    const { wrapper } = dashboard()
    await flushPromises()
    expect(wrapper.text()).toContain(de.partner_requests_load_error)
    await button(wrapper, de.refresh).trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Anfragende Organisation')
    expect(wrapper.text()).not.toContain(de.partner_requests_load_error)
  })
})

it('uses the same modal to edit existing partner grants without accepting a request', async () => {
  const global = globalOptions()
  useAppStore(global.plugins[0] as ReturnType<typeof createPinia>).setOrgUuid('my-org')
  const partner = { direction: 'outgoing' as const, orgUuid: 'partner', orgName: 'Partner',
    canChooseVenue: true, canChoosePartner: false, canChoosePromoter: false, canSeeInsights: true }
  const wrapper = mount(UranusPartnerGrantCard, { props: { items: [partner], direction: 'outgoing', canEditPartnerRights: true }, global })
  wrappers.push(wrapper)
  await wrapper.get('[role="button"]').trigger('click')
  expect(wrapper.findComponent(UranusPartnerGrantsModal).exists()).toBe(true)
  const inputs = wrapper.findAll<HTMLInputElement>('input[type="checkbox"]')
  expect(inputs.map(input => input.element.checked)).toEqual([true, false, false, true])
  await inputs[1]!.setValue(true)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  expect(mutations()).toHaveLength(1)
  expect(mutations()[0]?.[0]).toBe('/api/admin/org/my-org/partner/partner/grants')
  expect(partner.canChoosePartner).toBe(true)
  expect(wrapper.findComponent(UranusPartnerGrantsModal).exists()).toBe(false)
})
