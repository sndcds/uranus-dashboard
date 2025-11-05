<template>
    <div class="markdown-preview" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'

const props = defineProps<{
    value: string
}>()

const { t } = useI18n({ useScope: 'global' })

// Configure marked options for GitHub Flavored Markdown
marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: false, // Don't convert single line breaks to <br>
})

const renderedContent = computed(() => {
    if (!props.value) {
        return '<p class="empty">' + t('markdown_empty') + '</p>'
    }
    
    try {
        return marked.parse(props.value) as string
    } catch (error) {
        console.error('Markdown parsing error:', error)
        return '<p class="empty">' + t('markdown_error', 'Error rendering markdown') + '</p>'
    }
})
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
