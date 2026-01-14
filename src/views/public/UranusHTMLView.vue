<template>
  <div class="uranus-html-page" v-html="htmlContent"></div>
</template>

<script setup lang="ts">
import { ref, watchEffect, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  pageName: string
}>()

const htmlContent = ref('')
const pageName = toRef(props, 'pageName')

// Current locale
const { locale } = useI18n({ useScope: 'global' })

watchEffect(async () => {
  try {
    // Load the raw HTML for the current locale and page
    const module = await import(
        `../pages/${pageName.value}/${locale.value}.html?raw`
        )
    htmlContent.value = module.default
  } catch (err) {
    htmlContent.value = `<p>Content not available for this language (${locale.value}) or page (${pageName.value}).</p>`
    console.error('Failed to load HTML page:', err)
  }
})
</script>
