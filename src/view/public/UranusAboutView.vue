<template>
  <div class="about-page" v-html="htmlContent"></div>
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
    const module = await import(`../page/about/${locale.value}.html?raw`)
    htmlContent.value = module.default
  } catch (err) {
    htmlContent.value = `../page/about/${locale.value}.html?raw`

    // htmlContent.value = `<p>Content not available for this language (${locale.value}).</p>`
    console.error('Failed to load about page HTML:', err)
  }
})
</script>

<style scoped lang="scss">
/* Keep your previous styling for about-page */
.about-page {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 4vw, 1.5rem);
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 1024px;
}

/* You can keep all other style from your previous AboutUs.vue here */
</style>