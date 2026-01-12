import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import EventView from '../../src/views/EventView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      loading: 'Loading...',
      event_not_found: 'Event not found',
      event_load_error: 'Failed to load event',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/admin/event/:id', component: { template: '<div>Event</div>' } },
  ],
})

// Mock apiFetch
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

const mockEvent = {
  id: 1,
  title: 'Test Event',
  subtitle: 'Event Subtitle',
  description: 'Event description',
  organization_id: 1,
  organization_name: 'Test Organization',
  summary: 'Summary',
  participation_info: 'Participation info',
  meeting_point: 'Meeting point',
  event_types: [
    { type_id: 1, type_name: 'Concert', genre_id: null, genre_name: null }
  ],
  languages: ['en', 'de'],
  event_dates: [
    {
      event_date_id: 1,
      start_date: '2025-11-15',
      start_time: '14:00',
      end_date: '2025-11-15',
      end_time: '16:00',
      entry_time: '13:45',
      space_id: 1,
      accessibility_flags: 0,
      duration: 120,
      visitor_info_flags: 0,
    }
  ],
  event_urls: [
    { id: 1, title: 'Website', url: 'https://example.com', url_type: 'website' }
  ],
  image_id: 1,
  image_alt_text: 'Event image',
  image_copyright: 'Copyright info',
  image_created_by: 'Photographer',
  image_focus_x: 0.5,
  image_focus_y: 0.5,
  image_license_id: 'CC-BY',
  image_url: 'https://example.com/image.jpg',
  has_main_image: true,
  venue_id: 1,
  venue_name: 'Test Venue',
  venue_street: 'Main Street',
  venue_house_number: '123',
  venue_postal_code: '12345',
  venue_city: 'Test City',
  venue_lat: 54.7833,
  venue_lon: 9.4333,
  venue_country_code: 'DE',
  venue_state_code: 'SH',
  space_id: 1,
  space_name: 'Main Hall',
  start_date: '2025-11-15',
  start_time: '14:00',
  end_date: '2025-11-15',
  end_time: '16:00',
  entry_time: '13:45',
  tags: ['music', 'live'],
  release_status_id: 1,
  release_date: '2025-11-01',
}

describe('EventView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = async (eventId = '1') => {
    await router.push(`/admin/event/${eventId}`)
    await router.isReady()

    return mount(EventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          LocationMapComponent: true,
          EventImageUploadComponent: true,
          EventHeaderSection: true,
          EventDescriptionSection: true,
          EventTeaserSection: true,
          EventVenueSection: true,
          EventUrlSection: true,
          EventScheduleSection: true,
          EventReleaseSection: true,
        },
      },
    })
  }

  it('displays loading state initially', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = await createWrapper()

    expect(wrapper.find('.event-loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('loads event data on mount', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = await createWrapper('42')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/event/42?lang=en')
  })

  it('renders event content after successful load', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.find('.event-content').exists()).toBe(true)
    expect(wrapper.find('.event-loading').exists()).toBe(false)
  })

  it('displays error message when event not found', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: null, status: 404 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.find('.event-loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Event not found')
  })

  it('displays error message on API failure', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue(new Error('API Error'))

    // Suppress console.error for this test since the component logs the error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load event')

    consoleErrorSpy.mockRestore()
  })

  it('renders event layout sections', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.find('.event-layout').exists()).toBe(true)
    expect(wrapper.find('.event-sidebar').exists()).toBe(true)
  })

  it('handles event without image', async () => {
    const { apiFetch } = await import('../../src/api')
    const eventWithoutImage = { ...mockEvent, image_id: null, image_url: null, has_main_image: false }
    vi.mocked(apiFetch).mockResolvedValue({ data: eventWithoutImage, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.find('.event-content').exists()).toBe(true)
  })

  it('handles event without dates', async () => {
    const { apiFetch } = await import('../../src/api')
    const eventWithoutDates = { ...mockEvent, event_dates: [] }
    vi.mocked(apiFetch).mockResolvedValue({ data: eventWithoutDates, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.find('.event-content').exists()).toBe(true)
  })

  it('handles event without venue coordinates', async () => {
    const { apiFetch } = await import('../../src/api')
    const eventWithoutCoords = { ...mockEvent, venue_lat: null, venue_lon: null }
    vi.mocked(apiFetch).mockResolvedValue({ data: eventWithoutCoords, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(wrapper.find('.event-content').exists()).toBe(true)
  })

  it('loads event image details when has_main_image is true', async () => {
    const { apiFetch } = await import('../../src/api')
    const eventWithImageFlag = {
      ...mockEvent,
      has_main_image: true,
      image_id: null,
      image_url: null
    }

    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ data: eventWithImageFlag, status: 200 })
      .mockResolvedValueOnce({
        data: {
          id: 1,
          url: 'https://example.com/loaded-image.jpg',
          alt_text: 'Loaded alt text'
        },
        status: 200
      })

    const wrapper = await createWrapper()
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/event/1/image')
  })

  it('reloads event when loadEvent is called', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = await createWrapper()
    await flushPromises()

    const initialCallCount = vi.mocked(apiFetch).mock.calls.length

    // Trigger reload by emitting updated event from a child component
    const imageUpload = wrapper.findComponent({ name: 'EventImageUploadComponent' })
    if (imageUpload.exists()) {
      imageUpload.vm.$emit('updated')
      await flushPromises()

      expect(vi.mocked(apiFetch).mock.calls.length).toBeGreaterThan(initialCallCount)
    }
  })
})
