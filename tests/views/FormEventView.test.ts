import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '../../src/store/appStore'
import UranusDashboardAddEventView from '../../src/views/UranusDashboardAddEventView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      event_form_title: 'Create Event',
      event_form_subtitle: 'Fill in the event details',
      event_submit_button: 'Create Event',
      event_submit_success: 'Event created successfully',
      event_submit_error: 'Failed to create event (status: {status})',
      event_submit_error_generic: 'An error occurred while creating the event',
      event_section_basic: 'Basic Information',
      event_organizer_label: 'Organizer',
      select_placeholder: 'Select...',
      venue: 'Venue',
      choose_event_type: 'Event Type',
      choose_genre: 'Genre',
      event_title_label: 'Title',
      event_title_placeholder: 'Enter event title',
      event_subtitle_label: 'Subtitle',
      event_subtitle_placeholder: 'Enter event subtitle',
      add: 'Add',
      none_selected: 'None selected',
      event_section_dates: 'Event Dates',
      event_section_dates_subtitle: 'Add event dates and times',
      event_start_date: 'Start Date',
      event_start_time: 'Start Time',
      event_end_date: 'End Date',
      event_end_time: 'End Time',
      event_entry_time: 'Entry Time',
      event_all_day: 'All Day',
      event_add_date: 'Add Date',
      event_section_details: 'Event Details',
      event_section_details_subtitle: 'Additional event information',
      event_description_label: 'Description',
      event_description_placeholder: 'Enter event description',
      event_teaser_label: 'Teaser',
      event_teaser_placeholder: 'Enter teaser text',
      language: 'Language',
      event_min_age: 'Minimum Age',
      event_min_age_placeholder: 'Enter minimum age',
      event_max_age: 'Maximum Age',
      event_max_age_placeholder: 'Enter maximum age',
      event_participation_label: 'Participation',
      event_participation_placeholder: 'Enter participation info',
      event_presented_by_label: 'Presented By',
      event_presented_by_placeholder: 'Enter presenter',
      markdown_toolbar_bold: 'Bold',
      markdown_toolbar_italic: 'Italic',
      markdown_toolbar_code: 'Code',
      markdown_toolbar_bullet: 'Bullet List',
      markdown_toolbar_number: 'Numbered List',
      markdown_insert_table: 'Insert Table',
      markdown_toolbar_table_label: 'Table',
      markdown_preview: 'Preview',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/admin/organizer/:organizerId/event/create', component: { template: '<div>Create</div>' } },
    { path: '/admin/event/:id', component: { template: '<div>Event</div>' } },
  ],
})

// Mock apiFetch
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

const mockEventPayload = {
  title: 'Test Event',
  subtitle: 'Event Subtitle',
  description: 'Event description',
  teaser_text: 'Teaser',
  venue_id: 1,
  organizer_id: 1,
  event_dates: [
    {
      start_date: '2025-11-15',
      start_time: '14:00',
    }
  ],
}

describe('UranusDashboardAddEventView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const appStore = useAppStore()
    appStore.setOrganizerId(1)
    vi.clearAllMocks()
  })

  it('renders page title and subtitle', () => {
    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          EventForm: true,
          DashboardHeroComponent: {
            template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>',
            props: ['title', 'subtitle'],
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Create Event')
    expect(wrapper.text()).toContain('Fill in the event details')
  })

  it('passes organizer ID from store to UranusAddEventForm', () => {
    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId'],
          },
          DashboardHeroComponent: true,
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    expect(eventForm.exists()).toBe(true)
    expect(eventForm.props('organizerId')).toBe(1)
  })

  it('handles form submission successfully', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { event_id: 42 },
      status: 201
    })

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/api/admin/event/create', {
      method: 'POST',
      body: JSON.stringify(mockEventPayload),
    })
  })

  it('navigates to event view after successful creation', async () => {
    const { apiFetch } = await import('../../src/api')
    const push = vi.spyOn(router, 'push')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { event_id: 42 },
      status: 201
    })

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(push).toHaveBeenCalledWith('/admin/event/42')
  })

  it('displays success message after creation', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: { event_id: 42 },
      status: 201
    })

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    // Success message is passed to UranusAddEventForm component
    expect(eventForm.props('successMessage')).toBe('Event created successfully')
  })

  it('handles API error with status code', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockResolvedValue({
      data: null,
      status: 400
    })

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(eventForm.props('errorMessage')).toContain('Failed to create event')
  })

  it('handles API error with error object', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue({
      data: { error: 'Custom error message' }
    })

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(eventForm.props('errorMessage')).toBe('Custom error message')
  })

  it('handles API error with Error instance', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(eventForm.props('errorMessage')).toBe('Network error')
  })

  it('handles generic error', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue('Unknown error')

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(eventForm.props('errorMessage')).toContain('An error occurred')
  })

  it('handles API error with Error instance', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(eventForm.props('errorMessage')).toBe('Network error')
  })

  it('handles generic API error', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue('Unknown error')

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(eventForm.props('errorMessage')).toBe('An error occurred while creating the event')
  })

  it('clears error when clearError is emitted', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockRejectedValue(new Error('Test error'))

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(eventForm.props('errorMessage')).toBe('Test error')

    eventForm.vm.$emit('clear-error')
    await flushPromises()

    expect(eventForm.props('errorMessage')).toBeNull()
  })

  it('shows loading state during submission', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    expect(eventForm.props('loading')).toBe(false)

    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    expect(eventForm.props('loading')).toBe(true)
  })

  it('prevents double submission', async () => {
    const { apiFetch } = await import('../../src/api')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(UranusDashboardAddEventView, {
      global: {
        plugins: [i18n, router],
        stubs: {
          DashboardHeroComponent: true,
          EventForm: {
            name: 'EventForm',
            template: '<div></div>',
            props: ['organizerId', 'submitLabel', 'loading', 'errorMessage', 'successMessage'],
            emits: ['submit', 'clear-error'],
          },
        },
      },
    })

    const eventForm = wrapper.findComponent({ name: 'EventForm' })
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    // Try to submit again while first submission is in progress
    eventForm.vm.$emit('submit', mockEventPayload)
    await flushPromises()

    // Should only be called once
    expect(apiFetch).toHaveBeenCalledTimes(1)
  })
})
