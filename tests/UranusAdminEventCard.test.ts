import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'
import UranusAdminEventCard from '@/component/event/card/UranusAdminEventCard.vue'

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
          one_of_n: '{seriesIndex} of {seriesTotal}',
          count_event_date: '1 date',
          count_event_dates: '{n} dates',
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
})
