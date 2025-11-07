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
      events_calendar_type_label: 'Event type',
      events_calendar_all_dates: 'All dates',
      events_calendar_all_categories: 'All categories',
      events_calendar_reset_filters: 'Reset filters',
    },
  },
})

describe('EventCalendarSidebar', () => {
  const defaultProps = {
    searchId: 'search-test',
    dateId: 'date-test',
    endDateId: 'end-date-test',
    typeId: 'type-test',
    searchQuery: '',
    selectedType: 'all' as 'all' | string,
    selectedDate: null,
    selectedEndDate: null,
    tempStartDate: null,
    tempEndDate: null,
    isLoading: false,
    isTypesLoading: false,
    typeOptions: ['Concert', 'Exhibition', 'Workshop'],
    lastAvailableDate: '2025-12-31',
    firstAvailableDate: '2025-01-01',
    filtersActive: false,
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

  it('emits update:searchQuery when search input changes', async () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    })

    const searchInput = wrapper.find('#search-test')
    await searchInput.setValue('test query')

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
    const dateInput = wrapper.find('#date-test')
    const endDateInput = wrapper.find('#end-date-test')

    expect(searchInput.attributes('disabled')).toBeDefined()
    expect(dateInput.attributes('disabled')).toBeDefined()
    expect(endDateInput.attributes('disabled')).toBeDefined()
  })

  it('emits date-confirm when date input changes', async () => {
    const wrapper = mount(EventCalendarSidebar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    })

    const dateInput = wrapper.find('#date-test')
    await dateInput.trigger('blur')

    expect(wrapper.emitted('date-confirm')).toBeTruthy()
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
