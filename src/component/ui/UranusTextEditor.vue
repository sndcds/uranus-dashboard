<template>

  <div v-if="editor" class="container tiptap">
    <!-- Toolbar -->
    <div class="control-group button-group">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        <Bold :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        <Italic :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
        <Strikethrough :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }">
        <Code :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().unsetAllMarks().run()">
        <Trash2 :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().clearNodes().run()">
        <XCircle :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
        <Type :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        <Heading1 :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        <Heading2 :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
        <List :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
        <ListOrdered :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'is-active': editor.isActive('codeBlock') }">
        <SquareCode :size="iconSize" />
      </button>

      <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
        <Quote :size="iconSize" />
      </button>
    </div>

    <!-- Editor -->
    <editor-content class="uranus-md-editor" :editor="editor" />
  </div>
</template>

<script setup>
import {
  Bold, Italic, Strikethrough, Code, SquareCode, Trash2, XCircle, Type, Heading1, Heading2, List, ListOrdered, Quote
} from 'lucide-vue-next'
</script>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { ListItem } from '@tiptap/extension-list'
import TurndownService from 'turndown'
import MarkdownIt from 'markdown-it'


const iconSize = 16;

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
  background: var(--uranus-input-bg);
  outline: none;

  &:focus {
    outline: 2px solid var(--uranus-focus-color);
    outline-offset: -1px;
  }

  &:focus-within {
    outline: 2px solid var(--uranus-focus-color);
    outline-offset: -1px;
  }
}
</style>

<style scoped>
.container {
  min-height: 200px;
  border-radius: 6px;
  color: var(--uranus-color);
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  border: 1px solid var(--uranus-input-border-color);
  background: var(--uranus-bg);
  cursor: pointer;
}

button.is-active {
  background: var(--uranus-select-color);
  color: #fff;
}
</style>