import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import MarkdownEditorComponent from '../../src/components/MarkdownEditorComponent.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      markdown_preview: 'Preview',
      markdown_write: 'Write',
      markdown_empty: 'Nothing here yet',
      markdown_toolbar_bold: 'Bold',
      markdown_toolbar_italic: 'Italic',
      markdown_toolbar_code: 'Code',
      markdown_toolbar_bullet: 'Bullet list',
      markdown_toolbar_number: 'Numbered list',
      markdown_toolbar_table_label: 'Table',
      markdown_insert_table: 'Insert table',
    },
  },
})

describe('MarkdownEditorComponent', () => {
  it('renders in write mode by default', () => {
    const wrapper = mount(MarkdownEditorComponent, {
      props: {
        modelValue: '',
        placeholder: 'Enter text',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('emits update:modelValue when content changes', async () => {
    const wrapper = mount(MarkdownEditorComponent, {
      props: {
        modelValue: '',
        placeholder: 'Enter text',
      },
      global: {
        plugins: [i18n],
      },
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('New content')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['New content'])
  })

  it('switches between write and preview modes', async () => {
    const wrapper = mount(MarkdownEditorComponent, {
      props: {
        modelValue: '# Test',
        placeholder: 'Enter text',
      },
      global: {
        plugins: [i18n],
      },
    })

    // Should start in write mode
    expect(wrapper.find('textarea').exists()).toBe(true)

    // Switch to preview mode
    const previewButton = wrapper.findAll('button').find(btn => btn.text().includes('Preview'))
    if (previewButton) {
      await previewButton.trigger('click')
      expect(wrapper.find('.markdown-preview').exists()).toBe(true)
    }
  })

  it('displays placeholder when empty', () => {
    const wrapper = mount(MarkdownEditorComponent, {
      props: {
        modelValue: '',
        placeholder: 'Custom placeholder',
      },
      global: {
        plugins: [i18n],
      },
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('placeholder')).toBe('Custom placeholder')
  })
})
