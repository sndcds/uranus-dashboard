import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import UranusMapLocationPicker from './UranusMapLocationPicker.vue'

vi.mock('@/store/themeStore.ts', () => ({
  useThemeStore: () => ({ theme: 'light' }),
}))

vi.mock('@/component/map/UranusMapRenderer.vue', () => ({
  default: {
    name: 'UranusMapRenderer',
    template: '<div class="mock-map" />',
  },
}))

describe('UranusMapLocationPicker', () => {
  it('shows the placement hint before a marker exists', () => {
    const wrapper = mount(UranusMapLocationPicker, {
      props: { modelValue: null, selectable: true },
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'de',
            messages: {
              de: {
                marker_set_location_hint: 'Klicke in die Karte, um einen Marker zu setzen.',
                remove_marker: 'Marker entfernen',
              },
            },
          }),
        ],
      },
    })

    expect(wrapper.text()).toContain('Klicke in die Karte, um einen Marker zu setzen.')
    expect(wrapper.text()).not.toContain('Marker entfernen')
  })

  it('shows the remove button once a marker exists', () => {
    const wrapper = mount(UranusMapLocationPicker, {
      props: { modelValue: { lat: 54.1, lng: 10.1 }, selectable: true },
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'de',
            messages: {
              de: {
                marker_set_location_hint: 'Klicke in die Karte, um einen Marker zu setzen.',
                remove_marker: 'Marker entfernen',
              },
            },
          }),
        ],
      },
    })

    expect(wrapper.text()).toContain('Marker entfernen')
    expect(wrapper.text()).not.toContain('Klicke in die Karte, um einen Marker zu setzen.')
  })
})
