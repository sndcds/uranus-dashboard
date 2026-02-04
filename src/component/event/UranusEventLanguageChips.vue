<template>
  <span class="uranus-dashboard-chip-wrapper">
    <span
        class="uranus-dashboard-chip language"
        v-for="item in fullLanguageNames"
        :key="item.code"
    >
      {{ item.name }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { languages, type LanguagesLocale } from '@/i18n/languages.ts'

const props = defineProps<{
  items: string[] | null
}>()

const { locale } = useI18n()

// Map 2-letter codes to full names
const fullLanguageNames = computed(() => {
  const currentLocale = locale.value as LanguagesLocale
  if (!props.items) return []
  // cast the locale object to be indexable
  const currentLangs = languages[currentLocale] as Record<string, string>
  return props.items.map(code => ({
    code,
    name: currentLangs[code] ?? code
  }))
})
</script>