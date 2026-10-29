import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'
import UranusAdminEventCard from '@/component/event/card/UranusAdminEventCard.vue'
import { uranusI18nMessages } from '@/i18n/uranus-i18n-index'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem'

describe('UranusAdminEventCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps the placeholder image after the initial image load fails', async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          preview: 'Preview',
          edit: 'Edit',
          delete: 'Delete',
          online_event: 'Online event',
          event_without_date_message: '',
          delete_event: 'Delete event',
          delete_event_single_or_serie: 'Delete event',
          confirm_delete_event: 'Confirm delete',
          delete_event_occurrence: 'Delete occurrence',
          delete_event_series: 'Delete series',
          one_of_n: '{n} of {m}',
          count_event_date: '1 date',
          count_event_dates: '{count} dates',
        },
      },
    })

    const event = {
      uuid: 'event-1',
      dateUuid: 'date-1',
      title: 'Example event',
      releaseStatus: 'published',
      imageUrl: 'https://example.com/image.jpg',
      eventTypes: [],
      canViewEventInsights: false,
      canEditEvent: false,
      canDeleteEvent: false,
      venueUuid: null,
      spaceUuid: null,
      venueName: '',
      spaceName: '',
      orgName: '',
      isOnlineEvent: false,
      startDate: '2024-01-01',
      startTime: '10:00',
      endDate: '2024-01-01',
      endTime: '11:00',
      seriesTotal: 1,
      seriesIndex: 1,
    } as any

    const wrapper = mount(UranusAdminEventCard, {
      props: { event },
      global: {
        plugins: [i18n],
        stubs: {
          UranusCard: { template: '<div><slot /></div>' },
          UranusFeedback: { template: '<div><slot /></div>' },
          UranusEventReleaseChip: { template: '<div />' },
          UranusEventCategoryDisplay: { template: '<div />' },
          UranusButton: { template: '<button><slot /></button>' },
          UranusPasswordConfirmModal: { template: '<div />' },
        },
      },
    })

    const img = wrapper.get('img')
    expect(img.attributes('src')).toContain('image.jpg')

    await img.trigger('error')
    await nextTick()

    expect(img.attributes('src')).toBe('/assets/event-dummy.png')

    await wrapper.setProps({ event: { ...event, title: 'Updated title' } })
    await nextTick()

    expect(wrapper.get('img').attributes('src')).toBe('/assets/event-dummy.png')
  })

  it('interpolates event series positions, grouped counts and deletion options', async () => {
    const event: AdminEventListItem = {
      uuid: 'event-1', dateUuid: 'date-1', orgUuid: 'org-1', title: 'Concert', categories: null,
      canEditEvent: false, canDeleteEvent: true, canReleaseEvent: false, canViewEventInsights: true,
      isOnlineEvent: false, startDate: '2026-09-26', startTime: '18:00', seriesIndex: 2, seriesTotal: 5,
    }
    const wrapper = mount(UranusAdminEventCard, {
      props: { event },
      global: {
        plugins: [createI18n({ legacy: false, locale: 'en', messages: uranusI18nMessages })],
        stubs: { UranusPasswordConfirmModal: true, UranusEventReleaseChip: true },
      },
    })
    expect(wrapper.get('.card-status').text()).toBe('2 of 5')
    expect(wrapper.findComponent({ name: 'UranusPasswordConfirmModal' }).props('options')).toEqual([
      { label: 'Delete this occurrence', value: 'single' },
      { label: 'Delete entire series with 5 occurrences', value: 'series' },
    ])
    await wrapper.setProps({ grouped: true })
    expect(wrapper.get('.card-status').text()).toBe('5 event dates')
    wrapper.unmount()
  })
})
