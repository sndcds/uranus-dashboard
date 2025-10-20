<template>
    <div class="markdown-editor">
        <div class="markdown-editor__toolbar" role="toolbar">
            <button type="button" @click="applySyntax('**', '**')" title="Bold (Ctrl+B)"><strong>B</strong></button>
            <button type="button" @click="applySyntax('*', '*')" title="Italic (Ctrl+I)"><em>I</em></button>
            <button type="button" @click="applySyntax('`', '`')" title="Inline code">{ }</button>
            <button type="button" @click="applyPrefix('- ')" title="Bullet list">•</button>
            <button type="button" @click="applyPrefix('1. ')" title="Numbered list">1.</button>
            <button type="button" class="markdown-editor__toggle" @click="togglePreview">
                {{ previewMode ? t('markdown_write') : t('markdown_preview') }}
            </button>
        </div>

        <textarea
            v-if="!previewMode"
            ref="textareaRef"
            v-model="draft"
            :placeholder="placeholder"
            @input="emitValue"
            @keydown="handleKeydown"
        ></textarea>

        <div v-else class="markdown-editor__preview" v-html="renderedMarkdown"></div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    modelValue: string
    placeholder?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const { t } = useI18n({ useScope: 'global' })

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const draft = ref('')
const previewMode = ref(false)

watch(
    () => props.modelValue,
    (value) => {
        if (value !== draft.value) {
            draft.value = value || ''
        }
    },
    { immediate: true }
)

const renderedMarkdown = computed(() => renderMarkdown(draft.value))

const emitValue = () => {
    emit('update:modelValue', draft.value)
}

const togglePreview = () => {
    previewMode.value = !previewMode.value
}

const wrapSelection = (before: string, after: string = before) => {
    const textarea = textareaRef.value
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = draft.value
    const selected = value.slice(start, end)
    const nextValue = value.slice(0, start) + before + selected + after + value.slice(end)
    draft.value = nextValue
    emitValue()

    const cursor = start + before.length + selected.length + after.length
    requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(cursor, cursor)
    })
}

const applySyntax = (prefix: string, suffix: string) => {
    wrapSelection(prefix, suffix)
}

const applyPrefix = (prefix: string) => {
    const textarea = textareaRef.value
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = draft.value
    const before = value.slice(0, start)
    const selected = value.slice(start, end)
    const after = value.slice(end)

    const lines = selected || value
    const transformed = lines
        .split('\n')
        .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
        .join('\n')

    const result = selected
        ? `${before}${transformed}${after}`
        : `${transformed}`

    draft.value = result
    emitValue()
}

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Tab' && textareaRef.value) {
        event.preventDefault()
        const textarea = textareaRef.value
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = draft.value
        draft.value = value.substring(0, start) + '\t' + value.substring(end)
        emitValue()
        requestAnimationFrame(() => {
            textarea.setSelectionRange(start + 1, start + 1)
        })
    }
}

const renderMarkdown = (source: string) => {
    if (!source) return '<p class="empty">' + t('markdown_empty') + '</p>'

    const escaped = source
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    return escaped
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`{1}([^`]+)`{1}/gim, '<code>$1</code>')
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, '<br />')
        .replace(/^\d+\.\s(.*)$/gim, '<ol><li>$1</li></ol>')
        .replace(/^[-*]\s(.*)$/gim, '<ul><li>$1</li></ul>')
        .replace(/<ul>(.*?)<\/ul>/gims, (match) => match.replace(/<br \/>/g, ''))
        .replace(/<ol>(.*?)<\/ol>/gims, (match) => match.replace(/<br \/>/g, ''))
        .replace(/^<p>/, '<p>')
}

onMounted(() => {
    if (props.modelValue) {
        draft.value = props.modelValue
    }
})
</script>

<style scoped>
.markdown-editor {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.markdown-editor__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.markdown-editor__toolbar button {
    border: 1px solid rgba(79, 70, 229, 0.3);
    background: rgba(99, 102, 241, 0.08);
    color: #4338ca;
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.markdown-editor__toolbar button:hover {
    background: rgba(79, 70, 229, 0.12);
}

.markdown-editor__toolbar button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
}

.markdown-editor__toolbar button.markdown-editor__toggle {
    margin-left: auto;
}

textarea {
    min-height: 180px;
    padding: 0.9rem;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(248, 250, 252, 0.6);
    font-size: 1rem;
    color: #0f172a;
    resize: vertical;
}

textarea:focus {
    outline: none;
    border-color: rgba(79, 70, 229, 0.75);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
    background: #fff;
}

.markdown-editor__preview {
    min-height: 180px;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: #fff;
    color: #111827;
    line-height: 1.6;
}

.markdown-editor__preview h1,
.markdown-editor__preview h2,
.markdown-editor__preview h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}

.markdown-editor__preview p {
    margin: 0.5rem 0;
}

.markdown-editor__preview ul,
.markdown-editor__preview ol {
    margin: 0.5rem 0 0.5rem 1.2rem;
    padding: 0;
}

.markdown-editor__preview code {
    background: rgba(99, 102, 241, 0.15);
    border-radius: 4px;
    padding: 0 0.25rem;
}

.markdown-editor__preview .empty {
    color: rgba(107, 114, 128, 0.85);
    font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
