import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UranusAdminPortalStyleTab from '@/component/portal/editor/UranusAdminPortalStyleTab.vue'
import { useUranusPortalStore } from '@/store/portalStore.ts'
import { apiFetch } from '@/api.ts'
import { uranusI18n } from '@/i18n/uranus-i18n-index.ts'

vi.mock('@/api.ts', () => ({
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

function installPortalStore(style: Record<string, unknown> | null = null) {
  const store = useUranusPortalStore()
  store.original = {
    uuid: 'portal-1',
    orgUuid: 'org-1',
    name: 'Portal',
    description: null,
    spatialFilterMode: 'polygon',
    prefilter: null,
    geometry: null,
    style,
  }
  store.draft = JSON.parse(JSON.stringify(store.original))
  return store
}

function mountStyleTab() {
  return mount(UranusAdminPortalStyleTab, {
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
          props: ['id', 'modelValue', 'label', 'type', 'nullableNumber'],
          emits: ['update:modelValue'],
          template: `
            <label :for="id">
              <span>{{ label }}</span>
              <input
                :id="id"
                :type="type || 'text'"
                :value="modelValue"
                @input="$emit('update:modelValue', type === 'number' ? Number($event.target.value) : $event.target.value)"
              />
            </label>
          `,
        },
        UranusTextarea: {
          props: ['id', 'modelValue', 'label'],
          emits: ['update:modelValue'],
          template: `
            <label :for="id">
              <span>{{ label }}</span>
              <textarea
                :id="id"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
              ></textarea>
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

describe('UranusAdminPortalStyleTab', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiFetchMock.mockReset()
    apiFetchMock.mockResolvedValue({ data: null } as any)
  })

  it('renders grouped fields from the configured portal style schema', () => {
    installPortalStore({
      'custom-css': '.uranus-portal-event-card { opacity: 0.9; }',
      portal: {
        background: '#111111',
        padding: '3rem',
        color: '#ffffff',
        'font-family': 'Inter',
      },
      'event-card': {
        background: '#eeeeee',
        border: '1px solid red',
        radius: '12px',
        shadow: 'none',
        hover: {
          shadow: '0 4px 12px rgba(0,0,0,0.2)',
          scale: 1.1,
        },
      },
    })

    const wrapper = mountStyleTab()

    expect(wrapper.text()).toContain('Portal')
    expect(wrapper.text()).toContain('Event card hover')
    expect(wrapper.get('#portal-style-custom-css').element).toHaveProperty(
        'value',
        '.uranus-portal-event-card { opacity: 0.9; }'
    )
    expect(wrapper.get('#portal-style-portal\\.background').element).toHaveProperty('value', '#111111')
    expect(wrapper.get('#portal-style-eventCard\\.hover\\.scale').element).toHaveProperty('value', '1.1')
  })

  it('maps legacy grid/card style keys into the new form fields', () => {
    installPortalStore({
      grid: {
        gap: '24px',
      },
      card: {
        border: '1px solid #ccff00',
        'border-radius': '8px',
      },
    })

    const wrapper = mountStyleTab()

    expect(wrapper.get('#portal-style-eventGrid\\.gap').element).toHaveProperty('value', '24px')
    expect(wrapper.get('#portal-style-eventCard\\.border').element).toHaveProperty('value', '1px solid #ccff00')
    expect(wrapper.get('#portal-style-eventCard\\.radius').element).toHaveProperty('value', '8px')
  })

  it('builds the style JSON payload from form fields and uses the dedicated style endpoint', async () => {
    const store = installPortalStore()
    const wrapper = mountStyleTab()

    await wrapper.get('#portal-style-portal\\.background').setValue('#00ffcc')
    await wrapper.get('#portal-style-custom-css').setValue('.uranus-portal-events { background: red; }')
    await wrapper.get('#portal-style-header\\.title\\.fontWeight').setValue('800')
    await wrapper.get('#portal-style-eventCard\\.hover\\.scale').setValue('1.2')
    await wrapper.findAll('button')[1]!.trigger('click')

    expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/admin/portal/portal-1/style',
        expect.objectContaining({ method: 'PUT' })
    )
    const payload = JSON.parse(apiFetchMock.mock.calls[0]?.[1]?.body as string)
    expect(payload).toMatchObject({
      'custom-css': '.uranus-portal-events { background: red; }',
      portal: {
        background: '#00ffcc',
        padding: '2rem',
        color: '#333',
        'font-family': 'Helvetica Neue, Arial',
      },
      header: {
        title: {
          'font-weight': 800,
        },
      },
      'event-card': {
        hover: {
          scale: 1.2,
        },
      },
    })
    expect(store.original?.style?.portal).toEqual({
      background: '#00ffcc',
      padding: '2rem',
      color: '#333',
      'font-family': 'Helvetica Neue, Arial',
    })
  })

  it('resets dirty form changes back to the original style', async () => {
    installPortalStore({
      portal: {
        background: '#123456',
      },
    })
    const wrapper = mountStyleTab()

    await wrapper.get('#portal-style-portal\\.background').setValue('#abcdef')
    expect(wrapper.emitted('dirty-change')?.at(-1)).toEqual([true])

    await wrapper.findAll('button')[0]!.trigger('click')

    expect(wrapper.get('#portal-style-portal\\.background').element).toHaveProperty('value', '#123456')
    expect(wrapper.emitted('dirty-change')?.at(-1)).toEqual([false])
  })
})
