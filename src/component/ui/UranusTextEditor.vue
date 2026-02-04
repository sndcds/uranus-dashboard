<template>
  <div v-if="editor" class="container tiptap">
    <!-- Toolbar -->
    <div class="control-group button-group">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">Bold</button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">Italic</button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">Strike</button>
      <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }">Code</button>
      <button @click="editor.chain().focus().unsetAllMarks().run()">Clear marks</button>
      <button @click="editor.chain().focus().clearNodes().run()">Clear nodes</button>
      <button @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">Paragraph</button>
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">H1</button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">H2</button>
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">Bullet list</button>
      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">Ordered list</button>
      <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'is-active': editor.isActive('codeBlock') }">Code block</button>
      <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">Blockquote</button>
    </div>

    <!-- Editor -->
    <editor-content class="editor" :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { ListItem } from '@tiptap/extension-list'
import TurndownService from 'turndown'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const turndown = new TurndownService({
  headingStyle: 'atx',       // # H1 style
  hr: '---',
  codeBlockStyle: 'fenced',  // ``` code blocks
  fence: '```',
  bulletListMarker: '-',     // unordered lists
  emDelimiter: '_',          // _italic_
  strongDelimiter: '**',     // **bold**
})

export default {
  components: { EditorContent },
  props: { modelValue: String },
  emits: ['update:modelValue'],

  data() {
    return {
      editor: null,
      lastEmittedMarkdown: this.modelValue || ''
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit, TextStyle, Color],
      content: this.modelValue ? md.render(this.modelValue) : '',
      onUpdate: ({ editor }) => {
        // internal HTML changes, do NOT emit modelValue yet
        const html = editor.getHTML()
        const markdown = turndown.turndown(html)
        this.$emit('update:modelValue', markdown)
      }
    })
  },

  beforeUnmount() {
    this.editor?.destroy()
  }
}
</script>

<style lang="scss">
.ProseMirror {
  border: 0 solid #ccc;
  border-radius: 5px;
  padding: 1rem;
  min-height: 150px;
  background: #fff;
  outline: none;

  &:focus {
    border-color: var(--uranus-input-border-color);
    box-shadow: 0 0 0 2px red;
  }

  &:focus-within {
    border-color: var(--uranus-input-border-color);      // your highlight color
    box-shadow: 0 0 0 2px blue;
  }
}
</style>

<style scoped>
.container {
  min-height: 200px;
  border-radius: 6px;
  color: #333;
}
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}
button {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
}
button.is-active {
  background: #958DF1;
  color: #fff;
}
</style>