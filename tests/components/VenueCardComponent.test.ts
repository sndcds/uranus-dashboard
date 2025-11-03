import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'

import VenueCardComponent from '../../src/components/VenueCardComponent.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      events: 'Events',
      edit_venue: 'Edit Venue',
      spaces: 'Spaces',
      add_new_space: 'Add New Space',
      edit_space: 'Edit Space',
      spaces_empty: 'No spaces available',
    },
  },
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/admin/organizer/:organizerId/venue/:venueId/edit', component: { template: '<div>Edit Venue</div>' } },
    { path: '/admin/organizer/:organizerId/venue/:venueId/space/create', component: { template: '<div>Create Space</div>' } },
    { path: '/admin/organizer/:organizerId/venue/:venueId/space/:spaceId/edit', component: { template: '<div>Edit Space</div>' } },
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
  can_edit_venue?: boolean
  can_add_space?: boolean
  can_edit_space?: boolean
}

describe('VenueCardComponent', () => {
  const mockVenue: Venue = {
    venue_id: 1,
    venue_name: 'Test Venue',
    upcoming_event_count: 5,
    spaces: [],
    can_edit_venue: true,
    can_add_space: true,
    can_edit_space: true,
  }

  const createWrapper = (venue: Venue = mockVenue, organizerId = 100) => {
    return mount(VenueCardComponent, {
      props: {
        venue,
        organizerId,
      },
      global: {
        plugins: [i18n, router],
      },
    })
  }

  it('renders venue name', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('h2').text()).toBe('Test Venue')
  })

  it('displays upcoming event count', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('Events')
  })

  it('shows edit venue button when permitted', () => {
    const wrapper = createWrapper()
    const editLink = wrapper.find('a[href*="/venue/1/edit"]')
    expect(editLink.exists()).toBe(true)
    expect(editLink.text()).toBe('Edit Venue')
  })

  it('hides edit venue button when not permitted', () => {
    const venue = { ...mockVenue, can_edit_venue: false }
    const wrapper = createWrapper(venue)
    const editLink = wrapper.find('a[href*="/venue/1/edit"]')
    expect(editLink.exists()).toBe(false)
  })

  it('generates correct edit venue route', () => {
    const wrapper = createWrapper(mockVenue, 123)
    const editLink = wrapper.find('a[href*="/venue/1/edit"]')
    expect(editLink.attributes('href')).toContain('/admin/organizer/123/venue/1/edit')
  })

  describe('Spaces Section', () => {
    it('displays spaces heading', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h3').text()).toBe('Spaces')
    })

    it('shows add new space button when permitted', () => {
      const wrapper = createWrapper()
      const addLink = wrapper.find('a[href*="/space/create"]')
      expect(addLink.exists()).toBe(true)
      expect(addLink.text()).toBe('Add New Space')
    })

    it('hides add new space button when not permitted', () => {
      const venue = { ...mockVenue, can_add_space: false }
      const wrapper = createWrapper(venue)
      const addLink = wrapper.find('a[href*="/space/create"]')
      expect(addLink.exists()).toBe(false)
    })

    it('generates correct add space route', () => {
      const wrapper = createWrapper(mockVenue, 456)
      const addLink = wrapper.find('a[href*="/space/create"]')
      expect(addLink.attributes('href')).toContain('/admin/organizer/456/venue/1/space/create')
    })

    it('displays empty state when no spaces', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('No spaces available')
    })

    it('displays list of spaces when available', () => {
      const venue = {
        ...mockVenue,
        spaces: [
          { space_id: 10, space_name: 'Main Hall', upcoming_event_count: 3 },
          { space_id: 20, space_name: 'Studio A', upcoming_event_count: 2 },
        ],
      }
      const wrapper = createWrapper(venue)
      
      expect(wrapper.text()).toContain('Main Hall')
      expect(wrapper.text()).toContain('Studio A')
      expect(wrapper.text()).not.toContain('No spaces available')
    })

    it('displays space event counts', () => {
      const venue = {
        ...mockVenue,
        spaces: [
          { space_id: 10, space_name: 'Main Hall', upcoming_event_count: 7 },
        ],
      }
      const wrapper = createWrapper(venue)
      
      expect(wrapper.text()).toContain('7')
    })

    it('shows edit space buttons for each space when permitted', () => {
      const venue = {
        ...mockVenue,
        can_edit_space: true,
        spaces: [
          { space_id: 10, space_name: 'Main Hall', upcoming_event_count: 3 },
          { space_id: 20, space_name: 'Studio A', upcoming_event_count: 2 },
        ],
      }
      const wrapper = createWrapper(venue, 789)
      
      const editLinks = wrapper.findAll('a[href*="/space/"]').filter(link => 
        link.attributes('href')?.includes('/edit')
      )
      expect(editLinks.length).toBe(2)
      
      expect(editLinks[0].attributes('href')).toContain('/admin/organizer/789/venue/1/space/10/edit')
      expect(editLinks[1].attributes('href')).toContain('/admin/organizer/789/venue/1/space/20/edit')
    })

    it('hides edit space buttons when not permitted', () => {
      const venue = {
        ...mockVenue,
        can_edit_space: false,
        spaces: [
          { space_id: 10, space_name: 'Main Hall', upcoming_event_count: 3 },
        ],
      }
      const wrapper = createWrapper(venue)
      
      const editSpaceLinks = wrapper.findAll('a').filter(link => 
        link.text() === 'Edit Space'
      )
      expect(editSpaceLinks.length).toBe(0)
    })
  })

  describe('Multiple Spaces', () => {
    it('renders all spaces in correct order', () => {
      const venue = {
        ...mockVenue,
        spaces: [
          { space_id: 1, space_name: 'Space 1', upcoming_event_count: 1 },
          { space_id: 2, space_name: 'Space 2', upcoming_event_count: 2 },
          { space_id: 3, space_name: 'Space 3', upcoming_event_count: 3 },
        ],
      }
      const wrapper = createWrapper(venue)
      
      const listItems = wrapper.findAll('li')
      expect(listItems).toHaveLength(3)
      expect(listItems[0].text()).toContain('Space 1')
      expect(listItems[1].text()).toContain('Space 2')
      expect(listItems[2].text()).toContain('Space 3')
    })

    it('handles spaces with zero events', () => {
      const venue = {
        ...mockVenue,
        spaces: [
          { space_id: 1, space_name: 'Empty Space', upcoming_event_count: 0 },
        ],
      }
      const wrapper = createWrapper(venue)
      
      expect(wrapper.text()).toContain('Empty Space')
      expect(wrapper.text()).toContain('0')
    })
  })

  describe('Event Count Display', () => {
    it('displays zero events correctly', () => {
      const venue = { ...mockVenue, upcoming_event_count: 0 }
      const wrapper = createWrapper(venue)
      expect(wrapper.text()).toContain('0')
    })

    it('displays single event', () => {
      const venue = { ...mockVenue, upcoming_event_count: 1 }
      const wrapper = createWrapper(venue)
      expect(wrapper.text()).toContain('1')
    })

    it('displays large event counts', () => {
      const venue = { ...mockVenue, upcoming_event_count: 999 }
      const wrapper = createWrapper(venue)
      expect(wrapper.text()).toContain('999')
    })
  })

  describe('Permissions Combinations', () => {
    it('handles venue with all permissions disabled', () => {
      const venue = {
        ...mockVenue,
        can_edit_venue: false,
        can_add_space: false,
        can_edit_space: false,
      }
      const wrapper = createWrapper(venue)
      
      expect(wrapper.find('a[href*="/venue/1/edit"]').exists()).toBe(false)
      expect(wrapper.find('a[href*="/space/create"]').exists()).toBe(false)
    })

    it('handles venue with all permissions enabled', () => {
      const venue = {
        ...mockVenue,
        can_edit_venue: true,
        can_add_space: true,
        can_edit_space: true,
        spaces: [
          { space_id: 1, space_name: 'Space 1', upcoming_event_count: 1 },
        ],
      }
      const wrapper = createWrapper(venue)
      
      expect(wrapper.find('a[href*="/venue/1/edit"]').exists()).toBe(true)
      expect(wrapper.find('a[href*="/space/create"]').exists()).toBe(true)
      expect(wrapper.find('a[href*="/space/1/edit"]').exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    it('renders as article element', () => {
      const wrapper = createWrapper()
      expect(wrapper.element.tagName).toBe('ARTICLE')
    })

    it('has correct CSS class', () => {
      const wrapper = createWrapper()
      expect(wrapper.classes()).toContain('uranus-card')
    })

    it('has header and section elements', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('header').exists()).toBe(true)
      expect(wrapper.find('section').exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles venue with special characters in name', () => {
      const venue = { ...mockVenue, venue_name: 'Café & Bar "The Stage"' }
      const wrapper = createWrapper(venue)
      expect(wrapper.text()).toContain('Café & Bar "The Stage"')
    })

    it('handles space with special characters in name', () => {
      const venue = {
        ...mockVenue,
        spaces: [
          { space_id: 1, space_name: 'Hall #1 (Main)', upcoming_event_count: 5 },
        ],
      }
      const wrapper = createWrapper(venue)
      expect(wrapper.text()).toContain('Hall #1 (Main)')
    })

    it('handles very long venue name', () => {
      const longName = 'A'.repeat(100)
      const venue = { ...mockVenue, venue_name: longName }
      const wrapper = createWrapper(venue)
      expect(wrapper.text()).toContain(longName)
    })

    it('handles many spaces', () => {
      const manySpaces = Array.from({ length: 20 }, (_, i) => ({
        space_id: i,
        space_name: `Space ${i}`,
        upcoming_event_count: i,
      }))
      const venue = { ...mockVenue, spaces: manySpaces }
      const wrapper = createWrapper(venue)
      
      const listItems = wrapper.findAll('li')
      expect(listItems).toHaveLength(20)
    })
  })
})
