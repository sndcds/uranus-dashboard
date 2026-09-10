import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { EditorContent, type Editor } from '@tiptap/vue-3'
import UranusTextEditor from '@/component/ui/UranusTextEditor.vue'

describe('text editor synchronization', () => {
  it('accepts an empty nullable value and applies external Markdown without emitting it back', async () => {
    const wrapper = mount(UranusTextEditor, { props: { modelValue: null } })
    try {
      await flushPromises()
      await wrapper.setProps({ modelValue: '**Hello**' })
      const editor = wrapper
        .findComponent(EditorContent)
        .props('editor') as Editor
      expect(editor.getHTML()).toContain('<strong>Hello</strong>')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  it('restores the last valid content when an edit exceeds the limit', async () => {
    const wrapper = mount(UranusTextEditor, {
      props: { modelValue: 'Hi', maxLength: 5 },
    })
    try {
      await flushPromises()
      const editor = wrapper
        .findComponent(EditorContent)
        .props('editor') as Editor
      editor.commands.setContent('<p>This text exceeds the limit</p>')
      await flushPromises()
      expect(editor.getText()).toBe('Hi')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })
})
