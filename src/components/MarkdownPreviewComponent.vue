<template>
    <div class="markdown-preview" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    value: string
}>()

const { t } = useI18n({ useScope: 'global' })

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
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`{1}([^`]+)`{1}/gim, '<code>$1</code>')
        .replace(/\n\n+/g, '</p><p>')
        .replace(/(<\/h[1-6]>)[ \t]*\n/g, '$1')
        .replace(/\n/g, '<br />')
        .replace(/^<p>/, '<p>')
}

const renderedContent = computed(() => renderMarkdown(props.value))
</script>

<style scoped>
.markdown-preview {
    min-height: 180px;
    padding: 1rem 0;
    border-radius: 2px;
    border: 1px solid var(--border-soft);
    background: var(--card-bg);
    color: var(--color-text);
    line-height: 1.6;
}

:deep(.markdown-preview h1),
:deep(.markdown-preview h2),
:deep(.markdown-preview h3) {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}

:deep(.markdown-preview p) {
    margin: 0.5rem 0;
}

:deep(.markdown-preview ul),
:deep(.markdown-preview ol) {
    margin: 0.5rem 0;
    padding-left: 0;
    list-style-position: inside;
}

:deep(.markdown-preview table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0.75rem 0;
}

:deep(.markdown-preview th),
:deep(.markdown-preview td) {
    border: 1px solid var(--border-soft);
    padding: 0.5rem 0.75rem;
    text-align: left;
}

:deep(.markdown-preview thead th) {
    background: var(--accent-muted);
    font-weight: 600;
}

:deep(.markdown-preview tbody tr:nth-child(odd)) {
    background: var(--card-bg);
}

:deep(.markdown-preview tbody tr:nth-child(even)) {
    background: var(--input-bg);
}

:deep(.markdown-preview code) {
    background: rgba(99, 102, 241, 0.15);
    border-radius: 4px;
    padding: 0 0.25rem;
}

:deep(.markdown-preview .empty) {
    color: var(--muted-text);
    font-style: italic;
}
</style>
