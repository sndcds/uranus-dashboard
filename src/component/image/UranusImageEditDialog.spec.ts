import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import UranusImageEditDialog from './UranusImageEditDialog.vue'
import UranusButton from '@/component/ui/UranusButton.vue'

vi.mock('@/api.ts', () => ({
  apiFetch: vi.fn(async () => ({ data: null })),
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number) {
      super('ApiError')
      this.status = status
    }
  },
}))

describe('UranusImageEditDialog', () => {
  it('sets and removes a focus point from the image preview', async () => {
    const wrapper = mount(UranusImageEditDialog, {
      props: {
        context: 'event',
        contextUuid: 'org-1',
        identifier: 'image-1',
      },
      global: {
        components: { UranusButton },
        stubs: {
          UranusModal: {
            template: '<div><slot /><slot name="actions" /></div>',
          },
          UranusForm: {
            template: '<div><slot /></div>',
          },
          UranusFormRow: {
            template: '<div><slot /></div>',
          },
          UranusTextfield: {
            template: '<div />',
          },
          UranusLabel: {
            template: '<div><slot /></div>',
          },
          UranusLicenseSelect: {
            template: '<div />',
          },
          UranusTextarea: {
            template: '<div />',
          },
          UranusFeedback: {
            template: '<div><slot /></div>',
          },
          UranusFormActions: {
            template: '<div><slot /></div>',
          },
        },
        plugins: [
          createI18n({
            legacy: false,
            locale: 'de',
            messages: {
              de: {
                edit_image: 'Bild bearbeiten',
                click_to_upload: 'Zum Hochladen klicken',
                image_alt_text: 'Alt Text',
                image_creator_name: 'Creator',
                image_copyright: 'Copyright',
                license: 'Lizenz',
                image_description: 'Beschreibung',
                cancel: 'Abbrechen',
                save: 'Speichern',
                set_focus_point: 'Mittelpunk setzen',
                remove_focus_point: 'Fokuspunkt entfernen',
                image_ai_label: 'KI-Status',
                ai_label_none: 'Keine KI verwendet',
                ai_label_ai: 'Mit KI erstellt/bearbeitet',
                ai_label_ai_generated: 'KI-generiert',
                ai_label_ai_modified: 'Teilweise mit KI bearbeitet',
              },
            },
          }),
        ],
      },
    })

    await wrapper.vm.$nextTick()

    const setButton = wrapper.findAll('button').find((button) => button.text() === 'Mittelpunk setzen')
    expect(setButton).toBeTruthy()

    const preview = wrapper.find('.uranus-image-preview')
    Object.defineProperty(preview.element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 0, top: 0, width: 100, height: 100 }),
    })

    await setButton!.trigger('click')
    await preview.trigger('click', { clientX: 40, clientY: 60 })
    expect(wrapper.find('.focus-point').exists()).toBe(true)

    const removeButton = wrapper.findAll('button').find((button) => button.text() === 'Fokuspunkt entfernen')
    expect(removeButton).toBeTruthy()
    await removeButton!.trigger('click')
    expect(wrapper.find('.focus-point').exists()).toBe(false)
  })

  it('includes the artificial intelligence label in the save payload', async () => {
    const wrapper = mount(UranusImageEditDialog, {
      props: {
        context: 'event',
        contextUuid: 'org-1',
        identifier: 'image-1',
      },
      global: {
        components: { UranusButton },
        stubs: {
          UranusModal: { template: '<div><slot /><slot name="actions" /></div>' },
          UranusForm: { template: '<div><slot /></div>' },
          UranusFormRow: { template: '<div><slot /></div>' },
          UranusTextfield: { template: '<div />' },
          UranusLabel: { template: '<div><slot /></div>' },
          UranusLicenseSelect: { template: '<div />' },
          UranusTextarea: { template: '<div />' },
          UranusFeedback: { template: '<div><slot /></div>' },
          UranusFormActions: { template: '<div><slot /></div>' },
        },
        plugins: [
          createI18n({
            legacy: false,
            locale: 'de',
            messages: {
              de: {
                edit_image: 'Bild bearbeiten',
                click_to_upload: 'Zum Hochladen klicken',
                image_alt_text: 'Alt Text',
                image_creator_name: 'Creator',
                image_copyright: 'Copyright',
                license: 'Lizenz',
                image_description: 'Beschreibung',
                cancel: 'Abbrechen',
                save: 'Speichern',
                image_ai_label: 'KI-Status',
                ai_label_none: 'Keine KI verwendet',
                ai_label_ai: 'Mit KI erstellt/bearbeitet',
                ai_label_ai_generated: 'KI-generiert',
                ai_label_ai_modified: 'Teilweise mit KI bearbeitet',
                set_focus_point: 'Mittelpunk setzen',
                remove_focus_point: 'Fokuspunkt entfernen',
              },
            },
          }),
        ],
      },
    })

    await wrapper.vm.$nextTick()

    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)

    await select.setValue('ai_generated')

    const saveButton = wrapper.findAll('button').find((button) => button.text() === 'Speichern')
    await saveButton!.trigger('click')

    const emitted = wrapper.emitted('save')?.[0]
    expect(emitted?.[0]).toMatchObject({ ai_label: 'ai_generated' })
  })
})
