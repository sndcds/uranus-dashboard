import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

import EventCalendarSidebar from '../../src/components/EventCalendarSidebar.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      events_calendar_filters_title: 'Filter events',
      events_calendar_filters_subtitle: 'Use search, date range, and categories to focus the calendar.',
      events_calendar_search_label: 'Search events',
      events_calendar_search_placeholder: 'Search by title, organizer, or location…',
      events_calendar_date_label: 'Choose a date',
      events_calendar_end_date_label: 'End date',
      events_calendar_all_dates: 'All dates',
      events_calendar_reset_filters: 'Reset filters',
      events_calendar_date_range_placeholder: 'Select a date range',
      events_calendar_apply_date_range: 'Apply',
      events_calendar_clear_date_range: 'Clear',
      events_calendar_previous_month: 'Previous month',
      events_calendar_next_month: 'Next month',
      events_calendar_location_label: 'Location search',
      events_calendar_show_my_location: 'Show my location',
      events_calendar_radius_label: 'Radius',
      events_calendar_address_search_label: 'Address search',
      events_calendar_address_search_placeholder: 'City…',
      events_calendar_search_address_button: 'Search',
      events_calendar_venue_label: 'Venue',
      events_calendar_venue_all_option: 'All venues',
    },
  },
})

describe('EventCalendarSidebar', () => {
  const defaultProps = {
    searchId: 'search-test',
    dateId: 'date-test',
    endDateId: 'end-date-test',
    addressSearchId: 'address-test',
    searchQuery: '',
    selectedDate: null,
    selectedEndDate: null,
    selectedVenue: null,
    tempStartDate: null,
    tempEndDate: null,
    isLoading: false,
    filtersActive: false,
    showMyLocation: false,
    locationRadius: 25,
    isGeocodingLoading: false,
    userLatitude: null,
    venueCountOptions: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with default props', () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('.calendar-sidebar').exists()).toBe(true)
    expect(wrapper.find('.calendar-sidebar__header h2').text()).toBe('Filter events')
  })

  it('displays search input with correct id', () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    })

    const searchInput = wrapper.find('#search-test')
    expect(searchInput.exists()).toBe(true)
    expect(searchInput.attributes('type')).toBe('search')
  })

  it('emits update:searchQuery when pressing enter inside search input', async () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    })

    const searchInput = wrapper.find('#search-test')
    await searchInput.setValue('test query')
    await searchInput.trigger('keyup.enter')

    expect(wrapper.emitted('update:searchQuery')).toBeTruthy()
    expect(wrapper.emitted('update:searchQuery')?.[0]).toEqual(['test query'])
  })

  it('disables inputs when loading', () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: {
        ...defaultProps,
        isLoading: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    const searchInput = wrapper.find('#search-test')
    const dateTrigger = wrapper.find('.calendar-sidebar__date-range-trigger')

    expect(searchInput.attributes('disabled')).toBeDefined()
    expect(dateTrigger.attributes('disabled')).toBeDefined()
  })

  it('emits date-range-apply when applying new dates', async () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: {
        ...defaultProps,
        tempStartDate: '2025-01-01',
      },
      global: {
        plugins: [i18n],
      },
    })

    const trigger = wrapper.find('.calendar-sidebar__date-range-trigger')
    await trigger.trigger('click')

    const startButton = wrapper.find('[data-date="2025-01-10"]')
    const endButton = wrapper.find('[data-date="2025-01-15"]')
    await startButton.trigger('click')
    await endButton.trigger('click')

    const applyButton = wrapper.find('.calendar-sidebar__date-range-actions .calendar-btn:not(.calendar-btn--ghost)')
    await applyButton.trigger('click')

    expect(wrapper.emitted('date-range-apply')).toBeTruthy()
    expect(wrapper.emitted('date-range-apply')?.[0]).toEqual([{ start: '2025-01-10', end: '2025-01-15' }])
  })

  it('emits clear-date-filters when clear button clicked', async () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: {
        ...defaultProps,
        selectedDate: '2025-11-01',
      },
      global: {
        plugins: [i18n],
      },
    })

    const clearButton = wrapper.find('.calendar-sidebar__all-dates')
    await clearButton.trigger('click')

    expect(wrapper.emitted('clear-date-filters')).toBeTruthy()
  })

  it('emits reset-filters when reset button clicked', async () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: {
        ...defaultProps,
        filtersActive: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    const resetButton = wrapper.find('.calendar-sidebar__reset')
    await resetButton.trigger('click')

    expect(wrapper.emitted('reset-filters')).toBeTruthy()
  })

  it('disables reset button when no filters active', () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: {
        ...defaultProps,
        filtersActive: false,
      },
      global: {
        plugins: [i18n],
      },
    })

    const resetButton = wrapper.find('.calendar-sidebar__reset')
    expect(resetButton.attributes('disabled')).toBeDefined()
  })

  it('enables reset button when filters are active', () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: {
        ...defaultProps,
        filtersActive: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    const resetButton = wrapper.find('.calendar-sidebar__reset')
    expect(resetButton.attributes('disabled')).toBeUndefined()
  })
})
