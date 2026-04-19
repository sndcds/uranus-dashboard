<template>
  <div v-if="htmlContent" class="uranus-html-page" v-html="htmlContent"></div>
  <div v-else class="uranus-html-page-loading">Loading…</div>
</template>

<script setup lang="ts">
import { ref, watchEffect, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ pageName: string }>()
const pageName = toRef(props, 'pageName')

const htmlContent = ref('')

const { locale } = useI18n({ useScope: 'global' })

const pages = import.meta.glob('/src/page/**/*.html', { as: 'raw' })

console.log(Object.keys(pages))

watchEffect(async () => {
  // Build key using folder + locale
  const key = `/src/page/${pageName.value}/${locale.value}.html`

  if (pages[key]) {
    htmlContent.value = await pages[key]() // ✅ Works in dev & production
  } else {
    htmlContent.value = `<p>Content not available for "${pageName.value}" in "${locale.value}"</p>`
    console.error('HTML page not found:', key)
  }
})
</script>
