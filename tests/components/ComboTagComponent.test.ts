import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ComboTagComponent from '../../src/components/ComboTagComponent.vue'

describe('ComboTagComponent', () => {
  it('renders with label text', () => {
    const wrapper = mount(ComboTagComponent, {
      props: {
        label: 'Test Tag',
      },
    })
    
    expect(wrapper.text()).toContain('Test Tag')
  })

  it('applies default theme when not specified', () => {
    const wrapper = mount(ComboTagComponent, {
      props: {
        label: 'Tag',
      },
    })
    
    expect(wrapper.classes()).toContain('light')
  })

  it('applies custom theme', () => {
    const wrapper = mount(ComboTagComponent, {
      props: {
        label: 'Tag',
        theme: 'dark',
      },
    })
    
    expect(wrapper.classes()).toContain('dark')
  })

  describe('Editable Mode', () => {
    it('does not show close button when not editable', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag',
          editable: false,
        },
      })
      
      expect(wrapper.find('.close-btn').exists()).toBe(false)
      expect(wrapper.classes()).not.toContain('has-close')
    })

    it('shows close button when editable', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag',
          editable: true,
        },
      })
      
      expect(wrapper.find('.close-btn').exists()).toBe(true)
      expect(wrapper.classes()).toContain('has-close')
    })

    it('emits remove event when close button clicked', async () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag',
          editable: true,
        },
      })
      
      const closeBtn = wrapper.find('.close-btn')
      await closeBtn.trigger('click')
      
      expect(wrapper.emitted('remove')).toBeTruthy()
      expect(wrapper.emitted('remove')).toHaveLength(1)
    })

    it('close button has proper accessibility attributes', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag',
          editable: true,
        },
      })
      
      const closeBtn = wrapper.find('.close-btn')
      expect(closeBtn.attributes('type')).toBe('button')
      expect(closeBtn.attributes('aria-label')).toBe('Remove tag')
    })
  })

  describe('Different Themes', () => {
    it('renders with primary theme', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Primary',
          theme: 'primary',
        },
      })
      
      expect(wrapper.classes()).toContain('primary')
    })

    it('renders with success theme', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Success',
          theme: 'success',
        },
      })
      
      expect(wrapper.classes()).toContain('success')
    })

    it('renders with warning theme', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Warning',
          theme: 'warning',
        },
      })
      
      expect(wrapper.classes()).toContain('warning')
    })

    it('renders with error theme', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Error',
          theme: 'error',
        },
      })
      
      expect(wrapper.classes()).toContain('error')
    })
  })

  describe('Label Content', () => {
    it('renders labels with special characters', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag & More!',
        },
      })
      
      expect(wrapper.text()).toContain('Tag & More!')
    })

    it('renders labels with numbers', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: '123 Items',
        },
      })
      
      expect(wrapper.text()).toContain('123 Items')
    })

    it('renders labels with emoji', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: '🎉 Celebration',
        },
      })
      
      expect(wrapper.text()).toContain('🎉 Celebration')
    })

    it('renders long labels', () => {
      const longLabel = 'This is a very long label that should still render correctly'
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: longLabel,
        },
      })
      
      expect(wrapper.text()).toContain(longLabel)
    })
  })

  describe('Component Structure', () => {
    it('has correct root element class', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag',
        },
      })
      
      expect(wrapper.classes()).toContain('uranus-combo-tag')
    })

    it('applies multiple classes correctly', () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag',
          theme: 'primary',
          editable: true,
        },
      })
      
      expect(wrapper.classes()).toContain('uranus-combo-tag')
      expect(wrapper.classes()).toContain('primary')
      expect(wrapper.classes()).toContain('has-close')
    })
  })

  describe('Event Handling', () => {
    it('does not emit events when not editable', async () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag',
          editable: false,
        },
      })
      
      // Try to click the tag itself
      await wrapper.trigger('click')
      
      expect(wrapper.emitted('remove')).toBeFalsy()
    })

    it('emits remove event only when close button clicked', async () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag',
          editable: true,
        },
      })
      
      // Click the tag container (not the close button)
      await wrapper.find('.uranus-combo-tag').trigger('click')
      expect(wrapper.emitted('remove')).toBeFalsy()
      
      // Click the close button
      await wrapper.find('.close-btn').trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
    })

    it('emits remove event multiple times if clicked multiple times', async () => {
      const wrapper = mount(ComboTagComponent, {
        props: {
          label: 'Tag',
          editable: true,
        },
      })
      
      const closeBtn = wrapper.find('.close-btn')
      await closeBtn.trigger('click')
      await closeBtn.trigger('click')
      await closeBtn.trigger('click')
      
      expect(wrapper.emitted('remove')).toHaveLength(3)
    })
  })
})
