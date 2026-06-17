<!--
  src/component/ui/UranusTextEditor.vue
-->

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

    <p v-if="showRemainingCounter" class="editor-counter" :class="{ 'is-limit': remainingCharacters <= 0 }">
      {{ remainingCharacters }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TurndownService from 'turndown'
import MarkdownIt from 'markdown-it'

import {
  Bold, Italic, Strikethrough, Code, SquareCode, Trash2, XCircle, Type,
  Heading1, Heading2, List, ListOrdered, Quote
} from 'lucide-vue-next'

const iconSize = 16
const md = new MarkdownIt()
const turndown = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  codeBlockStyle: 'fenced',
  fence: '```',
  bulletListMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**'
})

// Props and emit
const props = withDefaults(defineProps<{
  modelValue?: string
  maxLength?: number
  showRemaining?: boolean
}>(), {
  maxLength: undefined,
  showRemaining: true,
})
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const editor = ref<Editor | null>(null)
const lastValidHtml = ref('')

const hasMaxLength = computed(() =>
  Number.isFinite(props.maxLength) && Number(props.maxLength) > 0
)

const currentLength = computed(() => getCharacterCount(props.modelValue ?? ''))
const remainingCharacters = computed(() => {
  if (!hasMaxLength.value) return 0
  return Math.max(0, Number(props.maxLength) - currentLength.value)
})

const showRemainingCounter = computed(() => hasMaxLength.value && props.showRemaining)

function getCharacterCount(value: string) {
  return Array.from(value).length
}

function trimToMaxLength(value: string) {
  if (!hasMaxLength.value) return value
  const maxLength = Number(props.maxLength)
  return Array.from(value).slice(0, maxLength).join('')
}

// Initialize editor
onMounted(() => {
  const initialMarkdown = trimToMaxLength((props.modelValue ?? '') || '')

  editor.value = new Editor({
    extensions: [StarterKit, TextStyle, Color],
    content: md.render(initialMarkdown),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = turndown.turndown(html)

      if (hasMaxLength.value && getCharacterCount(markdown) > Number(props.maxLength)) {
        editor.commands.setContent(lastValidHtml.value || md.render(trimToMaxLength(props.modelValue ?? '')), false)
        return
      }

      lastValidHtml.value = html
      emit('update:modelValue', markdown)
    }
  })

  lastValidHtml.value = editor.value.getHTML()

  if (initialMarkdown !== (props.modelValue ?? '')) {
    emit('update:modelValue', initialMarkdown)
  }
})

// Watch for external changes to update editor
watch(
    () => props.modelValue,
    (newVal) => {
      if (!editor.value) return

      const normalizedValue = trimToMaxLength(newVal ?? '')

      if (normalizedValue !== (newVal ?? '')) {
        emit('update:modelValue', normalizedValue)
        return
      }

      const currentMarkdown = turndown.turndown(editor.value.getHTML())
      if (normalizedValue !== currentMarkdown) {
        const html = normalizedValue ? md.render(normalizedValue) : ''
        editor.value.commands.setContent(html, false) // false = do not add to undo history
        lastValidHtml.value = editor.value.getHTML()
      }
    }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style lang="scss">
.ProseMirror {
  border: 0 solid #ccc;
  border-radius: 5px;
  padding: 0.1rem 0.7rem;
  min-height: 150px;
  background: var(--uranus-input-bg);
  outline: none;

  &:focus, &:focus-within {
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
  background: var(--uranus-select-bg);
  color: var(--uranus-select-color);
}

.editor-counter {
  margin: 0.5rem 0 0;
  text-align: right;
  font-size: 0.85rem;
  color: var(--uranus-medium-contrast-color);
}

.editor-counter.is-limit {
  color: var(--uranus-error-color);
}
</style>