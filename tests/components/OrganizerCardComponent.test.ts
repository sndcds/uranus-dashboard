import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import OrganizerCardComponent from '../../src/components/OrganizerCardComponent.vue'
import { useAppStore } from '../../src/store/appStore'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      edit_organizer: 'Edit Organizer',
      organizer_active: 'Active',
      organizer_activate: 'Activate',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/admin/organizer/:organizerId/edit', component: { template: '<div>Edit</div>' } },
  ],
})

interface Space {
  space_id: number
  space_name: string
  upcoming_event_count: number
}

interface Venue {
  venue_id: number
  venue_name: string
  upcoming_event_count: number
  spaces: Space[]
}

interface Organizer {
  organizer_id: number
  organizer_name: string
  total_upcoming_events: number
  venues: Venue[]
}

describe('OrganizerCardComponent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockOrganizer: Organizer = {
    organizer_id: 1,
    organizer_name: 'Test Organizer',
    total_upcoming_events: 10,
    venues: [
      {
        venue_id: 101,
        venue_name: 'Main Venue',
        upcoming_event_count: 5,
        spaces: [
          { space_id: 1001, space_name: 'Hall A', upcoming_event_count: 3 },
          { space_id: 1002, space_name: 'Hall B', upcoming_event_count: 2 },
        ],
      },
      {
        venue_id: 102,
        venue_name: 'Secondary Venue',
        upcoming_event_count: 5,
        spaces: [
          { space_id: 1003, space_name: 'Room 1', upcoming_event_count: 5 },
        ],
      },
    ],
  }

  const createWrapper = (organizer: Organizer = mockOrganizer) => {
    return mount(OrganizerCardComponent, {
      props: { organizer },
      global: {
        plugins: [i18n, router],
      },
    })
  }

  describe('Rendering', () => {
    it('renders organizer name', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h2').text()).toBe('Test Organizer')
    })

    it('renders edit organizer link', () => {
      const wrapper = createWrapper()
      const editLink = wrapper.find('a')
      expect(editLink.exists()).toBe(true)
      expect(editLink.text()).toBe('Edit Organizer')
      expect(editLink.attributes('href')).toContain('/admin/organizer/1/edit')
    })

    it('renders activate button', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Activate')
    })
  })

  describe('Active State', () => {
    it('shows "Active" when organizer is active', () => {
      const appStore = useAppStore()
      appStore.setOrganizerId(1)
      
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      expect(button.text()).toBe('Active')
    })

    it('shows "Activate" when organizer is not active', () => {
      const appStore = useAppStore()
      appStore.setOrganizerId(999) // Different organizer
      
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      expect(button.text()).toBe('Activate')
    })

    it('applies active class to card when organizer is active', () => {
      const appStore = useAppStore()
      appStore.setOrganizerId(1)
      
      const wrapper = createWrapper()
      expect(wrapper.find('.organizer-card--active').exists()).toBe(true)
    })

    it('does not apply active class when organizer is not active', () => {
      const appStore = useAppStore()
      appStore.setOrganizerId(999)
      
      const wrapper = createWrapper()
      expect(wrapper.find('.organizer-card--active').exists()).toBe(false)
    })

    it('applies active class to button when organizer is active', () => {
      const appStore = useAppStore()
      appStore.setOrganizerId(1)
      
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      expect(button.classes()).toContain('uranus-secondary-button--active')
    })
  })

  describe('Activate Functionality', () => {
    it('activates organizer on button click', async () => {
      const appStore = useAppStore()
      appStore.setOrganizerId(999)
      
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      
      await button.trigger('click')
      
      expect(appStore.organizerId).toBe(1)
    })

    it('updates button text after activation', async () => {
      const appStore = useAppStore()
      appStore.setOrganizerId(999)
      
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      
      expect(button.text()).toBe('Activate')
      
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(button.text()).toBe('Active')
    })

    it('can activate different organizer', async () => {
      const appStore = useAppStore()
      appStore.setOrganizerId(1)
      
      const organizer2: Organizer = {
        ...mockOrganizer,
        organizer_id: 2,
        organizer_name: 'Second Organizer',
      }
      
      const wrapper = createWrapper(organizer2)
      const button = wrapper.find('button')
      
      await button.trigger('click')
      
      expect(appStore.organizerId).toBe(2)
    })
  })

  describe('Venue Table', () => {
    it('displays venue table when venues exist', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('displays correct table headers', () => {
      const wrapper = createWrapper()
      const headers = wrapper.findAll('th')
      
      expect(headers).toHaveLength(3)
      expect(headers[0].text()).toBe('Venue')
      expect(headers[1].text()).toBe('Spaces')
      expect(headers[2].text()).toBe('Events')
    })

    it('displays all venues in table', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAll('tbody tr').filter(row => 
        !row.classes().includes('organizer-card__table-row--total')
      )
      
      expect(rows).toHaveLength(2)
      expect(rows[0].text()).toContain('Main Venue')
      expect(rows[1].text()).toContain('Secondary Venue')
    })

    it('displays venue space counts', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAll('tbody tr').filter(row => 
        !row.classes().includes('organizer-card__table-row--total')
      )
      
      const cells1 = rows[0].findAll('td')
      expect(cells1[1].text()).toBe('2') // Main Venue has 2 spaces
      
      const cells2 = rows[1].findAll('td')
      expect(cells2[1].text()).toBe('1') // Secondary Venue has 1 space
    })

    it('displays venue event counts', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAll('tbody tr').filter(row => 
        !row.classes().includes('organizer-card__table-row--total')
      )
      
      const cells1 = rows[0].findAll('td')
      expect(cells1[2].text()).toBe('5')
      
      const cells2 = rows[1].findAll('td')
      expect(cells2[2].text()).toBe('5')
    })

    it('displays total row with correct count', () => {
      const wrapper = createWrapper()
      const totalRow = wrapper.find('.organizer-card__table-row--total')
      
      expect(totalRow.exists()).toBe(true)
      expect(totalRow.text()).toContain('Total')
      expect(totalRow.text()).toContain('10')
    })
  })

  describe('Empty State', () => {
    it('displays empty message when no venues', () => {
      const emptyOrganizer: Organizer = {
        organizer_id: 3,
        organizer_name: 'Empty Organizer',
        total_upcoming_events: 0,
        venues: [],
      }
      
      const wrapper = createWrapper(emptyOrganizer)
      
      expect(wrapper.find('table').exists()).toBe(false)
      expect(wrapper.find('.organizer-card__empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('No venues found')
    })

    it('does not display table when no venues', () => {
      const emptyOrganizer: Organizer = {
        organizer_id: 3,
        organizer_name: 'Empty Organizer',
        total_upcoming_events: 0,
        venues: [],
      }
      
      const wrapper = createWrapper(emptyOrganizer)
      expect(wrapper.find('.organizer-card__table').exists()).toBe(false)
    })
  })

  describe('Venue Data Variations', () => {
    it('handles venue with no spaces', () => {
      const organizer: Organizer = {
        organizer_id: 4,
        organizer_name: 'Test',
        total_upcoming_events: 3,
        venues: [
          {
            venue_id: 201,
            venue_name: 'No Spaces Venue',
            upcoming_event_count: 3,
            spaces: [],
          },
        ],
      }
      
      const wrapper = createWrapper(organizer)
      const rows = wrapper.findAll('tbody tr').filter(row => 
        !row.classes().includes('organizer-card__table-row--total')
      )
      
      const cells = rows[0].findAll('td')
      expect(cells[1].text()).toBe('0')
    })

    it('handles venue with many spaces', () => {
      const manySpaces: Space[] = Array.from({ length: 10 }, (_, i) => ({
        space_id: 2000 + i,
        space_name: `Space ${i + 1}`,
        upcoming_event_count: i,
      }))
      
      const organizer: Organizer = {
        organizer_id: 5,
        organizer_name: 'Test',
        total_upcoming_events: 45,
        venues: [
          {
            venue_id: 301,
            venue_name: 'Large Venue',
            upcoming_event_count: 45,
            spaces: manySpaces,
          },
        ],
      }
      
      const wrapper = createWrapper(organizer)
      const rows = wrapper.findAll('tbody tr').filter(row => 
        !row.classes().includes('organizer-card__table-row--total')
      )
      
      const cells = rows[0].findAll('td')
      expect(cells[1].text()).toBe('10')
    })

    it('handles zero event counts', () => {
      const organizer: Organizer = {
        organizer_id: 6,
        organizer_name: 'Test',
        total_upcoming_events: 0,
        venues: [
          {
            venue_id: 401,
            venue_name: 'No Events Venue',
            upcoming_event_count: 0,
            spaces: [],
          },
        ],
      }
      
      const wrapper = createWrapper(organizer)
      const totalRow = wrapper.find('.organizer-card__table-row--total')
      expect(totalRow.text()).toContain('0')
    })
  })

  describe('Special Characters', () => {
    it('handles special characters in organizer name', () => {
      const organizer: Organizer = {
        ...mockOrganizer,
        organizer_name: 'Café & Bar "The Stage"',
      }
      
      const wrapper = createWrapper(organizer)
      expect(wrapper.find('h2').text()).toBe('Café & Bar "The Stage"')
    })

    it('handles special characters in venue name', () => {
      const organizer: Organizer = {
        ...mockOrganizer,
        venues: [
          {
            venue_id: 501,
            venue_name: 'Hall #1 (Main)',
            upcoming_event_count: 5,
            spaces: [],
          },
        ],
      }
      
      const wrapper = createWrapper(organizer)
      expect(wrapper.text()).toContain('Hall #1 (Main)')
    })
  })

  describe('Component Structure', () => {
    it('has correct root element class', () => {
      const wrapper = createWrapper()
      expect(wrapper.classes()).toContain('uranus-card')
    })

    it('displays ribbon label when active', () => {
      const appStore = useAppStore()
      appStore.setOrganizerId(1)
      
      const wrapper = createWrapper()
      expect(wrapper.attributes('data-ribbon-label')).toBe('⭐')
    })

    it('has header element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('header').exists()).toBe(true)
    })

    it('has button group section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.organizer-card__button-group').exists()).toBe(true)
    })
  })

  describe('Navigation', () => {
    it('generates correct edit link for different organizer IDs', () => {
      const organizer: Organizer = {
        ...mockOrganizer,
        organizer_id: 42,
      }
      
      const wrapper = createWrapper(organizer)
      const editLink = wrapper.find('a')
      expect(editLink.attributes('href')).toContain('/admin/organizer/42/edit')
    })
  })

  describe('Multiple Venues', () => {
    it('calculates total correctly with multiple venues', () => {
      const organizer: Organizer = {
        organizer_id: 7,
        organizer_name: 'Multi Venue',
        total_upcoming_events: 15,
        venues: [
          {
            venue_id: 601,
            venue_name: 'Venue 1',
            upcoming_event_count: 5,
            spaces: [],
          },
          {
            venue_id: 602,
            venue_name: 'Venue 2',
            upcoming_event_count: 7,
            spaces: [],
          },
          {
            venue_id: 603,
            venue_name: 'Venue 3',
            upcoming_event_count: 3,
            spaces: [],
          },
        ],
      }
      
      const wrapper = createWrapper(organizer)
      const totalRow = wrapper.find('.organizer-card__table-row--total')
      expect(totalRow.text()).toContain('15')
    })

    it('renders all venue rows', () => {
      const venues = Array.from({ length: 5 }, (_, i) => ({
        venue_id: 700 + i,
        venue_name: `Venue ${i + 1}`,
        upcoming_event_count: i + 1,
        spaces: [],
      }))
      
      const organizer: Organizer = {
        organizer_id: 8,
        organizer_name: 'Many Venues',
        total_upcoming_events: 15,
        venues,
      }
      
      const wrapper = createWrapper(organizer)
      const rows = wrapper.findAll('tbody tr').filter(row => 
        !row.classes().includes('organizer-card__table-row--total')
      )
      
      expect(rows).toHaveLength(5)
    })
  })
})
