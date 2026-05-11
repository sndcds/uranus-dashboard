import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UranusAdminPortalPrefilterTab from '@/component/portal/editor/UranusAdminPortalPrefilterTab.vue'
import { useUranusPortalStore } from '@/store/portalStore.ts'
import { apiFetch } from '@/api.ts'
import { uranusI18n } from '@/i18n/uranus-i18n-index.ts'

vi.mock('@/api.ts', () => ({
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

function installPortalStore(prefilter: Record<string, unknown> | null = null) {
  const store = useUranusPortalStore()
  store.original = {
    uuid: 'portal-1',
    orgUuid: 'org-1',
    name: 'Portal',
    description: null,
    spatialFilterMode: 'polygon',
    prefilter,
    geometry: null,
    style: null,
  }
  store.draft = JSON.parse(JSON.stringify(store.original))
  return store
}

function mountFilterTab() {
  return mount(UranusAdminPortalPrefilterTab, {
    global: {
      plugins: [uranusI18n],
      stubs: {
        UranusForm: { template: '<form><slot /></form>' },
        UranusFormRow: {
          props: ['cols'],
          template: '<div class="form-row" :data-cols="cols"><slot /></div>',
        },
        UranusFormActions: { template: '<div><slot /></div>' },
        UranusTextfield: {
          props: ['id', 'modelValue', 'label', 'type', 'nullableNumber', 'placeholder'],
          emits: ['update:modelValue'],
          template: `
            <label :for="id">
              <span>{{ label }}</span>
              <input
                :id="id"
                :type="type || 'text'"
                :value="modelValue"
                :placeholder="placeholder"
                @input="$emit('update:modelValue', type === 'number' ? ($event.target.value === '' ? null : Number($event.target.value)) : $event.target.value)"
              />
            </label>
          `,
        },
        UranusButton: {
          props: ['disabled'],
          emits: ['click'],
          template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
        },
      },
    },
  })
}

describe('UranusAdminPortalPrefilterTab', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiFetchMock.mockReset()
    apiFetchMock.mockResolvedValue({ data: null } as any)
  })

  it('renders configured prefilter values from the loaded portal', () => {
    installPortalStore({
      categories: '1,3,6',
      city: 'Berlin',
      radius: 10,
    })

    const wrapper = mountFilterTab()

    expect(apiFetchMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Taxonomy')
    expect(wrapper.get('#portal-filter-categories').element).toHaveProperty('value', '1,3,6')
    expect(wrapper.get('#portal-filter-city').element).toHaveProperty('value', 'Berlin')
    expect(wrapper.get('#portal-filter-radius').element).toHaveProperty('value', '10')
  })

  it('saves non-empty filter fields through the dedicated filter endpoint', async () => {
    const store = installPortalStore()
    const wrapper = mountFilterTab()

    await wrapper.get('#portal-filter-categories').setValue('1,3')
    await wrapper.get('#portal-filter-city').setValue('Berlin')
    await wrapper.get('#portal-filter-radius').setValue('10')
    await wrapper.findAll('button')[1]!.trigger('click')

    expect(apiFetchMock).toHaveBeenCalledWith('/api/admin/portal/portal-1/filter', {
      method: 'PUT',
      body: expect.any(String),
    })
    expect(JSON.parse(apiFetchMock.mock.calls[0]?.[1]?.body as string)).toEqual({
      categories: '1,3',
      city: 'Berlin',
      radius: 10,
    })
    expect(store.original?.prefilter).toEqual({
      categories: '1,3',
      city: 'Berlin',
      radius: 10,
    })
  })
})
