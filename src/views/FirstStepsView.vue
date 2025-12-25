<template>
  <div class="first-steps-page" v-html="htmlContent"></div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

const htmlContent = ref('')

// Get current locale
const { locale } = useI18n({ useScope: 'global' })

watchEffect(async () => {
  try {
    // Load raw HTML dynamically for current locale
    const module = await import(`../pages/first-steps/${locale.value}.html?raw`)
    htmlContent.value = module.default
  } catch (err) {
    htmlContent.value = `../pages/first-steps/${locale.value}.html?raw`

    // htmlContent.value = `<p>Content not available for this language (${locale.value}).</p>`
    console.error('Failed to load first-steps page HTML:', err)
  }
})
</script>

<style scoped lang="scss">
.first-steps-page {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 4vw, 1.5rem);
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 1024px;
}
</style>