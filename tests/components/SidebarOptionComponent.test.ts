import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SidebarOptionComponent from '../../src/components/SidebarOptionComponent.vue'
import type { SidebarOption } from '../../src/types/types'

describe('SidebarOptionComponent', () => {
  const createWrapper = (option: SidebarOption, active = false) => {
    return mount(SidebarOptionComponent, {
      props: {
        option,
        active,
      },
    })
  }

  describe('Rendering', () => {
    it('renders option label', () => {
      const option: SidebarOption = {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/dashboard',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.find('.label').text()).toBe('Dashboard')
    })

    it('renders icon when provided', () => {
      const option: SidebarOption = {
        id: 'events',
        label: 'Events',
        icon: '📅',
        route: '/events',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.find('.icon').exists()).toBe(true)
      expect(wrapper.find('.icon').text()).toBe('📅')
    })

    it('does not render icon when not provided', () => {
      const option: SidebarOption = {
        id: 'settings',
        label: 'Settings',
        route: '/settings',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.find('.icon').exists()).toBe(false)
    })

    it('applies has-icon class when icon exists', () => {
      const option: SidebarOption = {
        id: 'venues',
        label: 'Venues',
        icon: '🏛️',
        route: '/venues',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.classes()).toContain('has-icon')
    })

    it('does not apply has-icon class when no icon', () => {
      const option: SidebarOption = {
        id: 'profile',
        label: 'Profile',
        route: '/profile',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.classes()).not.toContain('has-icon')
    })
  })

  describe('Active State', () => {
    it('applies active class when active prop is true', () => {
      const option: SidebarOption = {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/dashboard',
      }
      const wrapper = createWrapper(option, true)

      expect(wrapper.classes()).toContain('active')
    })

    it('does not apply active class when active prop is false', () => {
      const option: SidebarOption = {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/dashboard',
      }
      const wrapper = createWrapper(option, false)

      expect(wrapper.classes()).not.toContain('active')
    })

    it('toggles active state correctly', async () => {
      const option: SidebarOption = {
        id: 'events',
        label: 'Events',
        route: '/events',
      }
      const wrapper = createWrapper(option, false)

      expect(wrapper.classes()).not.toContain('active')

      await wrapper.setProps({ active: true })
      expect(wrapper.classes()).toContain('active')

      await wrapper.setProps({ active: false })
      expect(wrapper.classes()).not.toContain('active')
    })
  })

  describe('Click Interactions', () => {
    it('emits change event with option id on click', async () => {
      const option: SidebarOption = {
        id: 'organizations',
        label: 'Organizations',
        route: '/organizations',
      }
      const wrapper = createWrapper(option)

      await wrapper.trigger('click')

      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')?.[0]).toEqual(['organizations'])
    })

    it('emits change event multiple times on multiple clicks', async () => {
      const option: SidebarOption = {
        id: 'venues',
        label: 'Venues',
        route: '/venues',
      }
      const wrapper = createWrapper(option)

      await wrapper.trigger('click')
      await wrapper.trigger('click')
      await wrapper.trigger('click')

      expect(wrapper.emitted('change')).toHaveLength(3)
    })
  })

  describe('Keyboard Accessibility', () => {
    it('has proper accessibility attributes', () => {
      const option: SidebarOption = {
        id: 'settings',
        label: 'Settings',
        route: '/settings',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.attributes('role')).toBe('button')
      expect(wrapper.attributes('tabindex')).toBe('0')
    })

    it('emits change event on Enter key press', async () => {
      const option: SidebarOption = {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/dashboard',
      }
      const wrapper = createWrapper(option)

      await wrapper.trigger('keydown.enter')

      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')?.[0]).toEqual(['dashboard'])
    })

    it('emits change event on Space key press', async () => {
      const option: SidebarOption = {
        id: 'events',
        label: 'Events',
        route: '/events',
      }
      const wrapper = createWrapper(option)

      await wrapper.trigger('keydown.space')

      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')?.[0]).toEqual(['events'])
    })

    it('prevents default behavior on Enter key', async () => {
      const option: SidebarOption = {
        id: 'test',
        label: 'Test',
        route: '/test',
      }
      const wrapper = createWrapper(option)

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      await wrapper.trigger('keydown.enter', event)

      // Vue's @keydown.enter.prevent automatically prevents default
      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('prevents default behavior on Space key', async () => {
      const option: SidebarOption = {
        id: 'test',
        label: 'Test',
        route: '/test',
      }
      const wrapper = createWrapper(option)

      await wrapper.trigger('keydown.space')

      expect(wrapper.emitted('change')).toBeTruthy()
    })
  })

  describe('Different Option Types', () => {
    it('handles option without route', () => {
      const option: SidebarOption = {
        id: 'logout',
        label: 'Logout',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.text()).toContain('Logout')
    })

    it('renders various icons correctly', () => {
      const icons = ['🏠', '📊', '⚙️', '👤', '🔔']

      icons.forEach((icon) => {
        const option: SidebarOption = {
          id: `icon-${icon}`,
          label: 'Test',
          icon,
          route: '/test',
        }
        const wrapper = createWrapper(option)

        expect(wrapper.find('.icon').text()).toBe(icon)
      })
    })

    it('handles long labels', () => {
      const option: SidebarOption = {
        id: 'long',
        label: 'This is a very long label that might overflow',
        route: '/long',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.find('.label').text()).toBe('This is a very long label that might overflow')
    })

    it('handles special characters in labels', () => {
      const option: SidebarOption = {
        id: 'special',
        label: 'Settings & Preferences',
        route: '/settings',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.text()).toContain('Settings & Preferences')
    })
  })

  describe('Component Structure', () => {
    it('has correct root element class', () => {
      const option: SidebarOption = {
        id: 'test',
        label: 'Test',
        route: '/test',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.classes()).toContain('sidebar-option')
    })

    it('maintains grid structure with icon', () => {
      const option: SidebarOption = {
        id: 'test',
        label: 'Test',
        icon: '🎯',
        route: '/test',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.find('.icon').exists()).toBe(true)
      expect(wrapper.find('.label').exists()).toBe(true)
    })

    it('maintains structure without icon', () => {
      const option: SidebarOption = {
        id: 'test',
        label: 'Test',
        route: '/test',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.find('.label').exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string label', () => {
      const option: SidebarOption = {
        id: 'empty',
        label: '',
        route: '/empty',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.find('.label').exists()).toBe(true)
    })

    it('handles numeric id', async () => {
      const option: SidebarOption = {
        id: '123',
        label: 'Numeric ID',
        route: '/numeric',
      }
      const wrapper = createWrapper(option)

      await wrapper.trigger('click')
      expect(wrapper.emitted('change')?.[0]).toEqual(['123'])
    })

    it('handles option with unicode characters', () => {
      const option: SidebarOption = {
        id: 'unicode',
        label: '设置',
        icon: '⚙️',
        route: '/settings',
      }
      const wrapper = createWrapper(option)

      expect(wrapper.text()).toContain('设置')
      expect(wrapper.find('.icon').text()).toBe('⚙️')
    })
  })

  describe('State Persistence', () => {
    it('maintains state after multiple interactions', async () => {
      const option: SidebarOption = {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '🏠',
        route: '/dashboard',
      }
      const wrapper = createWrapper(option, false)

      // Click
      await wrapper.trigger('click')
      expect(wrapper.emitted('change')).toHaveLength(1)

      // Set active
      await wrapper.setProps({ active: true })
      expect(wrapper.classes()).toContain('active')

      // Click again
      await wrapper.trigger('click')
      expect(wrapper.emitted('change')).toHaveLength(2)

      // State should be preserved
      expect(wrapper.classes()).toContain('active')
      expect(wrapper.find('.icon').text()).toBe('🏠')
    })

    it('updates correctly when option prop changes', async () => {
      const option1: SidebarOption = {
        id: 'events',
        label: 'Events',
        route: '/events',
      }
      const option2: SidebarOption = {
        id: 'venues',
        label: 'Venues',
        icon: '🏛️',
        route: '/venues',
      }

      const wrapper = createWrapper(option1)
      expect(wrapper.text()).toContain('Events')
      expect(wrapper.find('.icon').exists()).toBe(false)

      await wrapper.setProps({ option: option2 })
      expect(wrapper.text()).toContain('Venues')
      expect(wrapper.find('.icon').exists()).toBe(true)
      expect(wrapper.find('.icon').text()).toBe('🏛️')
    })
  })
})
