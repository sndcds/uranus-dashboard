import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createI18n } from 'vue-i18n'

import UranusVenueCreateView from './UranusVenueCreateView.vue'
import { apiFetch } from '@/api.ts'

vi.mock('@/api.ts', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('@/router/index.ts', () => ({
  default: {
    push: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      orgUuid: 'org-123',
    },
  }),
}))

describe('UranusVenueCreateView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '<p>help</p>',
    }))
  })

  it('renders a record kind select with the expected options', () => {
    const wrapper = mount(UranusVenueCreateView, {
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'de',
            messages: {
              de: {
                create_venue: 'Veranstaltungsort erstellen',
                create_venue_description: 'Beschreibung',
                venue_name: 'Name',
                venue_record_kind: 'Art des Ortes',
                venue_record_kind_standard: 'Eigener Ort',
                venue_record_kind_provisional: 'Provisorischer Ort',
                venue_name_required: 'Name erforderlich',
                venue_creation_failed: 'Erstellung fehlgeschlagen',
              },
            },
          }),
        ],
      },
    })

    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThanOrEqual(1)

    const options = selects[0].findAll('option').map(option => option.text())
    expect(options).toContain('Eigener Ort')
    expect(options).toContain('Provisorischer Ort')
  })

  it('sends record_kind with the selected venue mode when creating a venue', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      metadata: { venue_uuid: 'venue-789' },
    } as any)

    const wrapper = mount(UranusVenueCreateView, {
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'de',
            messages: {
              de: {
                create_venue: 'Veranstaltungsort erstellen',
                create_venue_description: 'Beschreibung',
                venue_name: 'Name',
                venue_record_kind: 'Art des Ortes',
                venue_record_kind_standard: 'Eigener Ort',
                venue_record_kind_provisional: 'Provisorischer Ort',
                venue_name_required: 'Name erforderlich',
                venue_creation_failed: 'Erstellung fehlgeschlagen',
              },
            },
          }),
        ],
      },
    })

    const nameInput = wrapper.find('#venue_name')
    const recordSelect = wrapper.find('#venue_record_kind')
    const createButton = wrapper.findAll('button').find(button => button.text() === 'Jetzt erstellen')

    expect(createButton).toBeTruthy()

    await nameInput.setValue('Neue Location')
    await recordSelect.setValue('provisional')
    await createButton!.trigger('click')

    expect(apiFetch).toHaveBeenCalledWith(
      '/api/admin/venue/create',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          org_uuid: 'org-123',
          venue_name: 'Neue Location',
          record_kind: 'provisional',
        }),
      }),
    )
  })
})
