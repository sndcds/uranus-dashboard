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

<style scoped lang="scss">

.markdown-preview {
  min-height: 180px;
  border-radius: 2px;
  background: var(--card-bg);
  line-height: 1.6;

  :deep(hr) {
    opacity: 0;
    height: 32px;
  }
}
</style>
