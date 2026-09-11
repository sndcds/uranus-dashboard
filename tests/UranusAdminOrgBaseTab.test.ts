import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UranusAdminOrgBaseTab from '@/component/org/editor/UranusAdminOrgBaseTab.vue'
import { useOrgStore } from '@/store/orgStore'
import { uranusI18nStandardTranslations } from '@/i18n/standard'
import { apiFetch } from '@/api'

vi.mock('@/api', () => ({ apiFetch: vi.fn().mockResolvedValue({}) }))

function mountEditor() {
  const store = useOrgStore()
  store.resetToEmpty()
  store.draft!.uuid = store.original!.uuid = 'org-1'
  const wrapper = mount(UranusAdminOrgBaseTab, {
    global: {
      plugins: [createI18n({
        legacy: false,
        locale: 'de',
        messages: {
          de: Object.fromEntries(Object.entries(uranusI18nStandardTranslations).map(([key, value]) => [key, value.de])),
        },
      })],
      stubs: {
        UranusTextEditor: true,
        UranusCountrySelect: true,
        UranusStateSelect: true,
        UranusLegalFormSelect: true,
      },
    },
  })
  return { store, wrapper }
}

describe('organization website saving', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('blocks button and shortcut saves until a protocol is selected', async () => {
    const { wrapper, store } = mountEditor()
    await wrapper.get('#org-web-link').setValue('example.com')
    await wrapper.findAll('button').find((button) => button.text() === 'Speichern')!.trigger('click')
    await flushPromises()
    expect(apiFetch).not.toHaveBeenCalled()
    await wrapper.vm.commitTab()
    expect(apiFetch).not.toHaveBeenCalled()
    expect(store.saving).toBe(false)

    await wrapper.findAll('button').find((button) => button.text() === 'https:// voranstellen')!.trigger('click')
    await wrapper.vm.commitTab()
    expect(apiFetch).toHaveBeenCalledWith('/api/admin/org/org-1/fields', {
      method: 'PUT', body: JSON.stringify({ web_link: 'https://example.com' }),
    })
    expect(store.original!.webLink).toBe('https://example.com')
  })

  it('saves trimmed URLs and permits removing the website', async () => {
    const { wrapper, store } = mountEditor()
    await wrapper.get('#org-web-link').setValue('  http://example.com/path  ')
    await wrapper.vm.commitTab()
    expect(store.original!.webLink).toBe('http://example.com/path')
    await wrapper.get('#org-web-link').setValue('  ')
    await wrapper.vm.commitTab()
    expect(apiFetch).toHaveBeenLastCalledWith('/api/admin/org/org-1/fields', {
      method: 'PUT', body: JSON.stringify({ web_link: null }),
    })
  })

  it('discards invalid input and its validation message', async () => {
    const { wrapper, store } = mountEditor()
    await wrapper.get('#org-web-link').setValue('https://bad host')
    await wrapper.vm.commitTab()
    expect(apiFetch).not.toHaveBeenCalled()
    await wrapper.findAll('button').find((button) => button.text() === 'Verwerfen')!.trigger('click')
    expect(wrapper.get('#org-web-link').element.value).toBe('')
    expect(wrapper.find('#org-web-link-message').exists()).toBe(false)
    expect(store.draft!.webLink).toBeNull()
  })
})
