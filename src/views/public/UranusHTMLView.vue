<template>
  <div class="uranus-html-page" v-html="htmlContent"></div>
</template>

<script setup lang="ts">
import { ref, watchEffect, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

// Props from router
const props = defineProps<{ pageName: string }>()
const pageName = toRef(props, 'pageName')

// HTML content ref
const htmlContent = ref('')

// i18n locale
const { locale } = useI18n({ useScope: 'global' })

// ✅ Import all HTML at build time
const pages = import.meta.glob('/src/pages/**/*.html', { as: 'raw' })

console.log(Object.keys(pages))

watchEffect(async () => {
  // Build key using folder + locale
  const key = `/src/pages/${pageName.value}/${locale.value}.html`

  if (pages[key]) {
    htmlContent.value = await pages[key]() // ✅ Works in dev & production
  } else {
    htmlContent.value = `<p>Content not available for "${pageName.value}" in "${locale.value}"</p>`
    console.error('HTML page not found:', key)
  }
})
</script>