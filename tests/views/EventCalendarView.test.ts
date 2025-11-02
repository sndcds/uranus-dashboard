import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import EventCalendarView from '../../src/views/EventCalendarView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      events_calendar_title: 'Event calendar',
      events_calendar_subtitle: 'Discover upcoming happenings',
      events_calendar_loading: 'Loading events…',
      events_calendar_empty: 'No events found',
      events_calendar_detailed_view: 'Details',
      events_calendar_compact_view: 'List',
      events_calendar_tiles_view: 'Tiles',
      events_calendar_view_details: 'View details',
      events_calendar_today: 'Today',
      events_calendar_tomorrow: 'Tomorrow',
      events_calendar_yesterday: 'Yesterday',
      events_calendar_time_all_day: 'All day',
      events_calendar_load_error: 'Could not load events',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/events', name: 'events-calendar', component: { template: '<div>Events</div>' } },
    { path: '/event/:id', name: 'event-details', component: { template: '<div>Event Detail</div>' } },
  ],
})

// Mock apiFetch
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

const mockEvents = [
  {
    id: 1,
    title: 'Test Event 1',
    subtitle: 'Event Subtitle',
    image_path: 'https://example.com/image1.jpg',
    teaser_text: 'This is a test event',
    description: 'Full description',
    start_date: '2025-11-15',
    start_time: '14:00',
    end_date: '2025-11-15',
    end_time: '16:00',
    venue_name: 'Test Venue',
    venue_city: 'Test City',
    venue_street: 'Main Street',
    venue_house_number: '123',
    venue_postal_code: '12345',
    event_types: [{ type_id: 1, type_name: 'Concert', genre_id: null, genre_name: null }],
    organizer_name: 'Test Organizer',
  },
  {
    id: 2,
    title: 'Test Event 2',
    subtitle: null,
    image_path: null,
    teaser_text: null,
    description: null,
    start_date: '2025-11-20',
    start_time: null,
    end_date: null,
    end_time: null,
    venue_name: 'Another Venue',
    venue_city: 'Another City',
    venue_street: null,
    venue_house_number: null,
    venue_postal_code: null,
    event_types: [{ type_id: 2, type_name: 'Exhibition', genre_id: 1, genre_name: 'Art' }],
    organizer_name: 'Another Organizer',
  },
]

describe('EventCalendarView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(EventCalendarView, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.find('.calendar-state--loading').exists()).toBe(true)
    expect(wrapper.find('.calendar-state--loading').text()).toContain('Loading events')
  })

  it('displays events after successful load', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = mount(EventCalendarView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.find('.calendar-state--loading').exists()).toBe(false)
    expect(wrapper.text()).toContain('Test Event 1')
    expect(wrapper.text()).toContain('Test Event 2')
  })

  it('displays error state when API fails', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue(new Error('API Error'))

    const wrapper = mount(EventCalendarView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.find('.calendar-state--error').exists()).toBe(true)
  })

  it('switches between view modes', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = mount(EventCalendarView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    // Default is detailed view
    expect(wrapper.find('.calendar-body').exists()).toBe(true)

    // Switch to compact view
    const compactButton = wrapper.findAll('.calendar-toggle-btn')[1]
    await compactButton.trigger('click')
    expect(wrapper.find('.calendar-body-compact').exists()).toBe(true)

    // Switch to tiles view
    const tilesButton = wrapper.findAll('.calendar-toggle-btn')[2]
    await tilesButton.trigger('click')
    expect(wrapper.find('.calendar-body-tiles').exists()).toBe(true)
  })

  it('filters events by search query', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = mount(EventCalendarView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    // Both events should be visible initially
    expect(wrapper.text()).toContain('Test Event 1')
    expect(wrapper.text()).toContain('Test Event 2')

    // Search for first event
    const searchInput = wrapper.find('input[type="search"]')
    await searchInput.setValue('Test Event 1')
    await flushPromises()

    // Only first event should be visible
    expect(wrapper.text()).toContain('Test Event 1')
    expect(wrapper.text()).not.toContain('Test Event 2')
  })

  it('displays event types correctly', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = mount(EventCalendarView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Concert')
    expect(wrapper.text()).toContain('Exhibition')
  })

  it('formats dates correctly', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = mount(EventCalendarView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    // Check that dates are formatted (not raw ISO strings)
    expect(wrapper.text()).not.toContain('2025-11-15')
    expect(wrapper.text()).toMatch(/November|Nov/)
  })

  it('displays venue information', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = mount(EventCalendarView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Test Venue')
    expect(wrapper.text()).toContain('Test City')
  })

  it('shows empty state when no events match filters', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvents, status: 200 })

    const wrapper = mount(EventCalendarView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    // Search for non-existent event
    const searchInput = wrapper.find('input[type="search"]')
    await searchInput.setValue('Non-existent Event')
    await flushPromises()

    expect(wrapper.find('.calendar-state--empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('No events found')
  })
})
