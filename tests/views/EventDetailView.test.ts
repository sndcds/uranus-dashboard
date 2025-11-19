import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'

import EventDetailView from '../../src/views/EventDetailView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      loading: 'Loading…',
      description: 'Description',
      choose_event_type: 'Event Type',
      website: 'Website',
      date: 'Date',
      time: 'Time',
      begin: 'Start',
      event_start: 'Start',
      event_end: 'End',
      event_entry_time: 'Entry Time',
      events_calendar_end_date_label: 'End',
      dashboard_todo_due: 'Duration',
      location: 'Location',
      space: 'Space',
      organizer: 'Organizer',
      organizers: 'Organizer',
      space_details_title: 'Space Details',
      space_total_capacity: 'Total Capacity',
      space_seating_capacity: 'Seated Capacity',
      space_building_level: 'Level',
      details: 'Details',
      geo_location: 'Meeting Point',
      user_permissions_title: 'Permissions',
      languages: 'Languages',
      events_calendar_load_error: 'Could not load event',
      event_load_error: 'Could not load event',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/event/:id/date/:eventDateId', name: 'event-detail', component: { template: '<div>Event</div>' } },
  ],
})

// Mock apiFetch
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

const mockEventDate = {
  event_date_id: 100,
  event_id: 424,
  start_date: '2025-11-04',
  start_time: '14:00',
  end_date: '2025-11-05',
  end_time: '17:00',
  entry_time: '13:30',
  duration: '3 hours',
  venue_id: 245,
  venue_name: 'Test Venue',
  venue_street: 'Main Street',
  venue_house_number: '123',
  venue_postal_code: '12345',
  venue_city: 'Test City',
  venue_state: null,
  venue_country: 'DEU',
  venue_geometry: 'POINT(8.968997 54.621062)',
  venue_lat: 54.621062,
  venue_lon: 8.968997,
  space_id: 1,
  space_name: 'Main Hall',
  space_total_capacity: 500,
  space_seating_capacity: 300,
  space_building_level: '2nd Floor',
}

const mockEvent = {
  event_id: 424,
  title: 'Test Event',
  subtitle: 'Event Subtitle',
  teaser_text: 'This is a teaser',
  description: '## Description\n\nThis is a **markdown** description.',
  duration: '3 hours',
  has_main_image: true,
  image_path: 'https://example.com/image.jpg',
  image_alt_text: 'Image alt',
  image_created_by: 'Photographer',
  image_copyright: 'Copyright',
  image_license_id: '10',
  image_license_short_name: 'ARR',
  image_license_name: 'All rights reserved',
  image_license_url: 'https://example.com/license',
  image_focus_x: 0,
  image_focus_y: 0,
  image_id: 80,
  languages: ['de', 'en'],
  organizer_name: 'Test Organizer',
  organizer_id: 111,
  event_types: [
    { type_id: 12, type_name: 'Exhibition', genre_id: 1, genre_name: 'Art' },
  ],
  event_urls: [
    { id: 10, title: 'Event Website', url: 'https://example.com', url_type: 'website' },
  ],
  meeting_point: 'Entrance Hall',
  participation_info: 'Free admission',
  accessibility_flag_names: null,
  accessibility_flags: null,
  visitor_info_flag_names: null,
  visitor_info_flags: null,
  space_building_level: null,
  space_id: null,
  space_name: null,
  space_seating_capacity: null,
  space_total_capacity: null,
  venue_city: null,
  venue_country: null,
  venue_geometry: null,
  venue_house_number: null,
  venue_id: null,
  venue_lat: null,
  venue_lon: null,
  venue_name: null,
  venue_postal_code: null,
  venue_state: null,
  venue_street: null,
  event_dates: [mockEventDate],
}

describe('EventDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    router.push('/event/424/date/100')
  })

  it('renders loading state initially', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.find('.event-detail-state--loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading')
  })

  it('displays event details after successful load', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.find('.event-detail-state--loading').exists()).toBe(false)
    expect(wrapper.find('h1').text()).toBe('Test Event')
    expect(wrapper.find('.event-detail-hero__subtitle').text()).toBe('Event Subtitle')
  })

  it('displays error state when API fails', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue(new Error('API Error'))

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.find('.event-detail-state--error').exists()).toBe(true)
  })

  it('displays hero image when available', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const heroImage = wrapper.find('.event-image')
    expect(heroImage.exists()).toBe(true)
    expect(heroImage.attributes('src')).toContain('example.com/image.jpg')
  })

  it('displays languages when available', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    // Languages are displayed as uppercase tags
    expect(wrapper.text()).toContain('DE')
    expect(wrapper.text()).toContain('EN')
    expect(wrapper.findAll('.event-detail-language-tag').length).toBe(2)
  })

  it('renders markdown description correctly', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const description = wrapper.find('.event-detail-description')
    expect(description.exists()).toBe(true)
    // Markdown should be converted to HTML
    expect(description.html()).toContain('<h2>')
    expect(description.html()).toContain('<strong>')
  })

  it('displays event types and genres', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Exhibition')
    expect(wrapper.text()).toContain('Art')
  })

  it('displays date and time information', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [router, i18n],
      },
    })

    await flushPromises()

    // For multi-day events, should show Start and End labels
    expect(wrapper.text()).toContain('Start')
    expect(wrapper.text()).toContain('End')
    // Component displays dates in DD.MM.YYYY format
    expect(wrapper.text()).toContain('04.11.2025')
    expect(wrapper.text()).toContain('05.11.2025')
    // Component displays time in 12-hour format with AM/PM
    expect(wrapper.text()).toContain('02:00 PM')
    expect(wrapper.text()).toContain('05:00 PM')
  })

  it('displays venue information', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Test Venue')
    expect(wrapper.text()).toContain('Main Street')
    expect(wrapper.text()).toContain('123')
    expect(wrapper.text()).toContain('12345')
    expect(wrapper.text()).toContain('Test City')
  })

  it('displays space information when available', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Main Hall')
    expect(wrapper.text()).toContain('500')
    expect(wrapper.text()).toContain('300')
    expect(wrapper.text()).toContain('2nd Floor')
  })

  it('displays organizer information', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Test Organizer')
  })

  it('displays external links correctly', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    const link = wrapper.find('.event-detail-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://example.com')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.text()).toContain('Event Website')
  })

  it('displays additional info when available', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [router, i18n],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Entrance Hall')
    // Component displays time in 12-hour format with AM/PM
    expect(wrapper.text()).toContain('01:30 PM')
    expect(wrapper.text()).toContain('Free admission')
  })

  it('hides optional sections when data is not available', async () => {
    const { apiFetch } = await import('../../src/api')
    const minimalEventDate = {
      ...mockEvent.event_dates[0],
      entry_time: null,
      duration: null,
      space_name: null,
      space_total_capacity: null,
      space_seating_capacity: null,
      space_building_level: null,
    }
    const minimalEvent = {
      ...mockEvent,
      subtitle: null,
      teaser_text: null,
      description: null,
      languages: null,
      space_name: null,
      space_total_capacity: null,
      space_seating_capacity: null,
      meeting_point: null,
      participation_info: null,
      event_dates: [minimalEventDate],
    }
    vi.mocked(apiFetch).mockResolvedValue({ data: minimalEvent, status: 200 })

    const wrapper = mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(wrapper.find('.event-detail-hero__subtitle').exists()).toBe(false)
    expect(wrapper.find('.event-detail-teaser').exists()).toBe(false)
    expect(wrapper.find('.event-detail-description').exists()).toBe(false)
    expect(wrapper.find('.event-detail-hero__languages').exists()).toBe(false)
  })

  it('fetches event with correct language parameter', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({ data: mockEvent, status: 200 })

    mount(EventDetailView, {
      global: {
        plugins: [i18n, router],
      },
    })

    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/event/424/date/100?lang=en')
  })
})
