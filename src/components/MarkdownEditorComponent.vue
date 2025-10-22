<template>
    <div class="markdown-editor">
        <div class="markdown-editor__toolbar" role="toolbar">
            <button
                type="button"
                @click="applySyntax('**', '**')"
                :title="t('markdown_toolbar_bold')"
                :aria-label="t('markdown_toolbar_bold')"
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                @click="applySyntax('*', '*')"
                :title="t('markdown_toolbar_italic')"
                :aria-label="t('markdown_toolbar_italic')"
            >
                <em>I</em>
            </button>
            <button
                type="button"
                @click="applySyntax('`', '`')"
                :title="t('markdown_toolbar_code')"
                :aria-label="t('markdown_toolbar_code')"
            >
                { }
            </button>
            <button
                type="button"
                @click="applyPrefix('- ')"
                :title="t('markdown_toolbar_bullet')"
                :aria-label="t('markdown_toolbar_bullet')"
            >
                •
            </button>
            <button
                type="button"
                @click="applyPrefix('1. ')"
                :title="t('markdown_toolbar_number')"
                :aria-label="t('markdown_toolbar_number')"
            >
                1.
            </button>
            <button
                type="button"
                @click="insertTable"
                :title="t('markdown_insert_table')"
                :aria-label="t('markdown_insert_table')"
            >
                {{ t('markdown_toolbar_table_label') }}
            </button>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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

const renderedMarkdown = computed(() => renderMarkdown(draft.value))

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
    requestAnimationFrame(() => autoResize())
}

const splitTableCells = (line: string) =>
    line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim())

const getAlignment = (cell: string) => {
    const trimmed = cell.trim()
    if (/^:-+:$/.test(trimmed)) return 'center'
    if (/^-+:$/.test(trimmed)) return 'right'
    if (/^:-+$/.test(trimmed)) return 'left'
    return null
}

const isDividerRow = (line: string) => {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|')) return false
    return splitTableCells(trimmed).every((cell) => /^:?-{3,}:?$/.test(cell))
}

const isTableRow = (line: string) => {
    const trimmed = line.trim()
    return trimmed.startsWith('|') && trimmed.includes('|')
}

const processTables = (input: string) => {
    const lines = input.split('\n')
    const result: string[] = []

    let index = 0
    while (index < lines.length) {
        const line = lines[index]

        if (isTableRow(line) && index + 1 < lines.length && isDividerRow(lines[index + 1])) {
            const headerCells = splitTableCells(line)
            const alignmentCells = splitTableCells(lines[index + 1])
            const alignments = headerCells.map((_, i) => getAlignment(alignmentCells[i] ?? ''))
            index += 2

            const bodyRows: string[][] = []
            while (index < lines.length && isTableRow(lines[index])) {
                bodyRows.push(splitTableCells(lines[index]))
                index += 1
            }

            const columnCount = headerCells.length

            const tableParts: string[] = []
            tableParts.push('<table class="markdown-table">')
            tableParts.push('<thead><tr>')
            for (let col = 0; col < columnCount; col += 1) {
                const content = headerCells[col] ?? ''
                const align = alignments[col]
                const alignAttribute = align ? ` style="text-align: ${align};"` : ''
                tableParts.push(`<th${alignAttribute}>${content || '&nbsp;'}</th>`)
            }
            tableParts.push('</tr></thead>')

            if (bodyRows.length) {
                tableParts.push('<tbody>')
                bodyRows.forEach((row) => {
                    tableParts.push('<tr>')
                    for (let col = 0; col < columnCount; col += 1) {
                        const content = row[col] ?? ''
                        const align = alignments[col]
                        const alignAttribute = align ? ` style="text-align: ${align};"` : ''
                        tableParts.push(`<td${alignAttribute}>${content || '&nbsp;'}</td>`)
                    }
                    tableParts.push('</tr>')
                })
                tableParts.push('</tbody>')
            }

            tableParts.push('</table>')
            result.push(tableParts.join(''))
            continue
        }

        result.push(line)
        index += 1
    }

    return result.join('\n')
}

const processLists = (input: string) => {
    const lines = input.split('\n')
    const result: string[] = []

    let index = 0
    while (index < lines.length) {
        const line = lines[index]
        const unorderedMatch = line.match(/^(\s*)[-*]\s+(.*)$/)
        const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/)

        if (unorderedMatch) {
            const items: string[] = []
            while (index < lines.length) {
                const current = lines[index]
                const match = current.match(/^(\s*)[-*]\s+(.*)$/)
                if (!match) break
                items.push(match[2] || '&nbsp;')
                index += 1
            }
            result.push(`<ul>${items.map((content) => `<li>${content || '&nbsp;'}</li>`).join('')}</ul>`)
            continue
        }

        if (orderedMatch) {
            const items: string[] = []
            while (index < lines.length) {
                const current = lines[index]
                const match = current.match(/^(\s*)(\d+)\.\s+(.*)$/)
                if (!match) break
                items.push(match[3] || '&nbsp;')
                index += 1
            }
            result.push(`<ol>${items.map((content) => `<li>${content || '&nbsp;'}</li>`).join('')}</ol>`)
            continue
        }

        result.push(line)
        index += 1
    }

    return result.join('\n')
}

const renderMarkdown = (source: string) => {
    if (!source) return '<p class="empty">' + t('markdown_empty') + '</p>'

    const escaped = source
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    const withTables = processTables(escaped)
    const withLists = processLists(withTables)

    return withLists
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`{1}([^`]+)`{1}/gim, '<code>$1</code>')
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, '<br />')
        .replace(/^<p>/, '<p>')
}

onMounted(() => {
    if (props.modelValue) {
        draft.value = props.modelValue
    }
    nextTick(() => autoResize())
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

:deep(.markdown-editor__preview h1),
:deep(.markdown-editor__preview h2),
:deep(.markdown-editor__preview h3) {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}

:deep(.markdown-editor__preview p) {
    margin: 0.5rem 0;
}

:deep(.markdown-editor__preview ul),
:deep(.markdown-editor__preview ol) {
    margin: 0.5rem 0;
    padding-left: 0;
    list-style-position: inside;
}

:deep(.markdown-editor__preview table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0.75rem 0;
}

:deep(.markdown-editor__preview th),
:deep(.markdown-editor__preview td) {
    border: 1px solid rgba(148, 163, 184, 0.45);
    padding: 0.5rem 0.75rem;
    text-align: left;
}

:deep(.markdown-editor__preview thead th) {
    background: rgba(99, 102, 241, 0.12);
    font-weight: 600;
}

:deep(.markdown-editor__preview tbody tr:nth-child(odd)) {
    background: rgba(255, 255, 255, 0.9);
}

:deep(.markdown-editor__preview tbody tr:nth-child(even)) {
    background: rgba(248, 250, 252, 0.6);
}

:deep(.markdown-editor__preview code) {
    background: rgba(99, 102, 241, 0.15);
    border-radius: 4px;
    padding: 0 0.25rem;
}

:deep(.markdown-editor__preview .empty) {
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
