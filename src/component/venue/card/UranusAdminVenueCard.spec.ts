import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import UranusAdminVenueCard from './UranusAdminVenueCard.vue'

const makeVenue = (overrides = {}) => ({
  venueUuid: 'venue-1',
  venueName: 'Test Venue',
  recordKind: 'standard',
  eventCount: 0,
  spaces: [],
  canAddEvent: false,
  canAddSpace: true,
  canDeleteEvent: false,
  canDeleteSpace: false,
  canDeleteVenue: false,
  canEditEvent: false,
  canEditSpace: false,
  canEditVenue: false,
  canReleaseEvent: false,
  mainLogoUuid: null,
  lightThemeLogoUuid: null,
  darkThemeLogoUuid: null,
  ...overrides,
})

describe('UranusAdminVenueCard', () => {
  it('hides the spaces section for provisional venues', () => {
    const wrapper = mount(UranusAdminVenueCard, {
      props: {
        orgUuid: 'org-1',
        venueListItem: makeVenue({
          recordKind: 'provisional',
          spaces: [{
            spaceUuid: 'space-1',
            spaceName: 'Main Hall',
            eventCount: 2,
            canEditSpace: false,
            canDeleteSpace: false,
          }],
          canAddSpace: true,
        }),
      },
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'de',
            messages: {
              de: {
                venue_spaces: 'Räume',
                add_element: 'Hinzufügen',
                spaces_empty: 'Keine Räume',
                edit: 'Bearbeiten',
                delete: 'Löschen',
                event_count_plural: '{count} Veranstaltungen',
                event_count_singular: '1 Veranstaltung',
                confirm_delete_venue: 'Delete venue {name}?',
                confirm_delete_space: 'Delete space {name}?',
                delete_venue: 'Ort löschen',
                delete_space: 'Raum löschen',
                deleting: 'Löschen',
                failed_to_delete_venue: 'Failed venue delete',
                failed_to_delete_space: 'Failed space delete',
              },
            },
          }),
        ],
        stubs: {
          UranusPasswordConfirmModal: true,
          PlutoImage: true,
          UranusCard: true,
          UranusIconAction: true,
          UranusButton: { template: '<button><slot /></button>' },
        },
      },
    })

    expect(wrapper.text()).not.toContain('Räume')
    expect(wrapper.text()).not.toContain('Main Hall')
  })
})
