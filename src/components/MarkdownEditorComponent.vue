<template>
    <div class="uranus-markdown-editor">
        <div class="uranus-markdown-editor-toolbar" role="toolbar">
            <button type="button" @click="applySyntax('**', '**')" @keydown="handleToolbarShortcut($event, 'bold')"
                :title="t('markdown_toolbar_bold')" :aria-label="t('markdown_toolbar_bold')">
                <strong>B</strong>
            </button>
            <button type="button" @click="applySyntax('*', '*')" @keydown="handleToolbarShortcut($event, 'italic')"
                :title="t('markdown_toolbar_italic')" :aria-label="t('markdown_toolbar_italic')">
                <em>I</em>
            </button>
            <button type="button" @click="applySyntax('`', '`')" @keydown="handleToolbarShortcut($event, 'code')"
                :title="t('markdown_toolbar_code')" :aria-label="t('markdown_toolbar_code')">
                { }
            </button>
            <button type="button" @click="applyPrefix('- ')" @keydown="handleToolbarShortcut($event, 'bullet')"
                :title="t('markdown_toolbar_bullet')" :aria-label="t('markdown_toolbar_bullet')">
                •
            </button>
            <button type="button" @click="applyPrefix('1. ')" @keydown="handleToolbarShortcut($event, 'number')"
                :title="t('markdown_toolbar_number')" :aria-label="t('markdown_toolbar_number')">
                1.
            </button>
            <button type="button"
                    @click="insertTable"
                    @keydown="handleToolbarShortcut($event, 'table')"
                    :title="t('markdown_insert_table')" :aria-label="t('markdown_insert_table')"
            >
                {{ t('markdown_toolbar_table_label') }}
            </button>
            <button
                type="button" class="markdown-editor-toggle"
                @click="togglePreview">
                {{ previewMode ? t('markdown_write') : t('markdown_preview') }}
            </button>
        </div>

        <textarea v-if="!previewMode" ref="textareaRef" v-model="draft" :placeholder="placeholder" @input="emitValue"
            @keydown="handleKeydown"></textarea>

        <MarkdownPreviewComponent v-else :value="draft" />
    </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownPreviewComponent from '@/components/MarkdownPreviewComponent.vue'

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
const MIN_TEXTAREA_HEIGHT = 180

watch(
    () => props.modelValue,
    (value) => {
        if (value !== draft.value) {
            draft.value = value || ''
            nextTick(() => autoResize())
        }
    },
    { immediate: true }
)

const emitValue = () => {
    emit('update:modelValue', draft.value)
    nextTick(() => autoResize())
}

const togglePreview = () => {
    previewMode.value = !previewMode.value
    if (!previewMode.value) {
        nextTick(() => autoResize())
    }
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

    const value = draft.value
    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd

    let rangeStart = selectionStart
    let rangeEnd = selectionEnd
    let selection = value.slice(rangeStart, rangeEnd)

    if (!selection) {
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
        const lineEndRaw = value.indexOf('\n', selectionStart)
        const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw
        rangeStart = lineStart
        rangeEnd = lineEnd
        selection = value.slice(rangeStart, rangeEnd)
    }

    const lines = selection.split('\n')
    const isNumberedList = /^\d+\.\s$/.test(prefix)
    let baseNumber = Number(prefix.replace(/\D/g, '')) || 1

    if (isNumberedList) {
        const firstContentLine = lines.find((line) => line.trim().length > 0)
        const existingNumber = firstContentLine
            ?.trim()
            .match(/^(\d+)\.\s/)
        if (existingNumber) {
            baseNumber = Number(existingNumber[1])
        } else {
            const beforeSelection = value.slice(0, rangeStart)
            const previousNumberMatch = beforeSelection.match(/(\d+)\.\s[^\n]*$/)
            if (previousNumberMatch) {
                baseNumber = Number(previousNumberMatch[1]) + 1
            }
        }
    }

    let numberOffset = 0

    const transformedLines = lines.map((line, index) => {
        const leadingWhitespace = line.match(/^\s*/)?.[0] ?? ''
        const trimmedLine = line.slice(leadingWhitespace.length)

        if (isNumberedList) {
            if (!trimmedLine.length) {
                return line
            }
            const listNumber = baseNumber + numberOffset
            numberOffset += 1
            const content = trimmedLine.replace(/^\d+\.\s*/, '')
            return `${leadingWhitespace}${listNumber}. ${content}`
        }

        if (trimmedLine.startsWith(prefix.trim())) {
            return line
        }

        return `${leadingWhitespace}${prefix}${trimmedLine}`
    })

    const transformedText = transformedLines.join('\n')
    const updatedValue = `${value.slice(0, rangeStart)}${transformedText}${value.slice(rangeEnd)}`

    draft.value = updatedValue
    emitValue()

    requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(rangeStart, rangeStart + transformedText.length)
    })
}

const insertTextAtCursor = (text: string, selectionOffset?: { start: number; end: number }) => {
    const textarea = textareaRef.value
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = draft.value
    draft.value = value.slice(0, start) + text + value.slice(end)
    emitValue()

    const selectionStart = selectionOffset ? start + selectionOffset.start : start + text.length
    const selectionEnd = selectionOffset ? start + selectionOffset.end : start + text.length

    requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(selectionStart, selectionEnd)
    })
}

const autoResize = () => {
    const textarea = textareaRef.value
    if (!textarea || previewMode.value) return
    textarea.style.height = 'auto'
    const nextHeight = Math.max(MIN_TEXTAREA_HEIGHT, textarea.scrollHeight)
    textarea.style.height = `${nextHeight}px`
}

const insertTable = () => {
    const column1 = t('markdown_table_column', { index: 1 })
    const column2 = t('markdown_table_column', { index: 2 })
    const value1 = t('markdown_table_value', { index: 1 })
    const value2 = t('markdown_table_value', { index: 2 })
    const template = `| ${column1} | ${column2} |\n| --- | --- |\n| ${value1} | ${value2} |\n`
    const firstValueIndex = template.indexOf(value1)
    insertTextAtCursor(template, {
        start: firstValueIndex,
        end: firstValueIndex + value1.length,
    })
}

const toolbarActions = {
    bold: () => applySyntax('**', '**'),
    italic: () => applySyntax('*', '*'),
    code: () => applySyntax('`', '`'),
    bullet: () => applyPrefix('- '),
    number: () => applyPrefix('1. '),
    table: () => insertTable(),
} as const

type ToolbarActionKey = keyof typeof toolbarActions

type ShortcutConfig = {
    key: string
    ctrlKey?: boolean
    altKey?: boolean
    shiftKey?: boolean
    metaKey?: boolean
}

const shortcutMap: Record<ToolbarActionKey, ShortcutConfig> = {
    bold: { key: 'b', ctrlKey: true, altKey: true },
    italic: { key: 'i', ctrlKey: true, altKey: true },
    code: { key: 'e', ctrlKey: true, altKey: true },
    bullet: { key: 'u', ctrlKey: true, altKey: true },
    number: { key: 'o', ctrlKey: true, altKey: true },
    table: { key: 't', ctrlKey: true, altKey: true },
}

const matchesShortcut = (event: KeyboardEvent, config: ShortcutConfig) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase()
    if (key !== config.key) return false
    const ctrlActive = event.ctrlKey || event.metaKey
    if ((config.ctrlKey ?? false) !== ctrlActive) return false
    if ((config.altKey ?? false) !== event.altKey) return false
    if ((config.shiftKey ?? false) !== event.shiftKey) return false
    if (config.metaKey !== undefined && config.metaKey !== event.metaKey) return false
    return true
}

const runToolbarAction = (action: ToolbarActionKey) => {
    toolbarActions[action]()
}

const maybeHandleShortcut = (event: KeyboardEvent) => {
    if (previewMode.value) return false

    const action = (Object.keys(shortcutMap) as ToolbarActionKey[]).find((key) =>
        matchesShortcut(event, shortcutMap[key])
    )

    if (!action) return false

    event.preventDefault()
    runToolbarAction(action)
    return true
}

const handleKeydown = (event: KeyboardEvent) => {
    if (maybeHandleShortcut(event)) {
        return
    }

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
    requestAnimationFrame(() => autoResize())
}

const handleToolbarShortcut = (event: KeyboardEvent, action: ToolbarActionKey) => {
    if (maybeHandleShortcut(event)) return
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        runToolbarAction(action)
    }
}

onMounted(() => {
    if (props.modelValue) {
        draft.value = props.modelValue
    }
    nextTick(() => autoResize())
})
</script>

<style scoped lang="scss">
.markdown-editor {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.markdown-editor-toggle {
    margin-left: auto;
}

textarea {
    min-height: 180px;
    resize: vertical;
}

</style>
