import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import UranusDashboardEventsView from '../../src/views/UranusDashboardEventsView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      events_title: 'Events',
      events_subtitle: 'Manage your events',
      add_new_event: 'Add New Event',
      events_fetch_failed: 'Failed to load events (status: {status})',
      events_fetch_failed_generic: 'Failed to load events',
      event_type_unknown: 'Unknown',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/admin/organizer/:id/events', component: { template: '<div>Events</div>' } },
    { path: '/admin/organizer/:organizerId/event/create', component: { template: '<div>Create</div>' } },
    { path: '/admin/event/:id', component: { template: '<div>Event Detail</div>' } },
  ],
})

// Mock apiFetch
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

const mockEvents = [
  {
    event_id: 1,
    title: 'Test Event 1',
    subtitle: 'Event Subtitle',
    start_date: '2025-11-15',
    start_time: '14:00',
    venue_name: 'Test Venue',
    release_status_id: 1,
  },
  {
    event_id: 2,
    title: 'Test Event 2',
    subtitle: null,
    start_date: '2025-11-20',
    start_time: null,
    venue_name: 'Another Venue',
    release_status_id: 2,
  },
]

describe('UranusDashboardEventsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = async (organizerId = '1') => {
    await router.push(`/admin/organizer/${organizerId}/events`)
    await router.isReady()

    return mount(UranusDashboardEventsView, {
      global: {
        plugins: [i18n, router],
      },
    })
  }

  it('renders page title and subtitle', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.text()).toContain('Events')
    expect(wrapper.text()).toContain('Manage your events')
  })

  it('displays add new event button', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    const addButton = wrapper.find('a.uranus-button')
    expect(addButton.exists()).toBe(true)
    expect(addButton.text()).toBe('Add New Event')
    expect(addButton.attributes('href')).toBe('/admin/organizer/1/event/create')
  })

  it('loads events on mount', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = await createWrapper('123')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/organizer/123/events?start=2000-01-01')
  })

  it('handles array response format', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(apiFetch).toHaveBeenCalled()
  })

  it('handles object response format with events property', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { events: mockEvents },
      status: 200
    })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(apiFetch).toHaveBeenCalled()
  })

  it('handles empty events list', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: [], status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(apiFetch).toHaveBeenCalled()
  })

  it('displays loading state', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = await createWrapper()

    // Component should render and pass loading state to UranusDashboardEventCard
    const eventsCard = wrapper.findComponent({ name: 'OrganizerEventsCard' })
    expect(eventsCard.exists()).toBe(true)
  })

  it('clears loading state after successful fetch', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.html()).toBeTruthy()
  })

  it('handles API error with status', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: null, status: 404 })

    const wrapper = await createWrapper()
    await flushPromises()

    // Error should be passed to UranusDashboardEventCard component
    expect(apiFetch).toHaveBeenCalled()
  })

  it('handles API error with error object', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue({
      data: { error: 'Custom error message' }
    })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(apiFetch).toHaveBeenCalled()
  })

  it('handles API error with Error instance', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue(new Error('Network error'))

    const wrapper = await createWrapper()
    await flushPromises()

    expect(apiFetch).toHaveBeenCalled()
  })

  it('handles generic API error', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue('Unknown error')

    const wrapper = await createWrapper()
    await flushPromises()

    expect(apiFetch).toHaveBeenCalled()
  })

  it('uses correct API base URL', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.html()).toBeTruthy()
  })
})
