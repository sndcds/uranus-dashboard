<template>
  <select v-model="selectedLanguage">
    <option
        v-for="(label, code) in languageOptions"
        :key="code"
        :value="code"
    >
      {{ label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { languages, type LanguagesLocale } from '@/i18n/languages.ts'

const { locale } = useI18n()

// The language currently selected in this dropdown
const selectedLanguage = ref<string>('be') // default value

// Build options using current i18n locale
const languageOptions = computed(() => {
  const currentLocale = locale.value as LanguagesLocale
  return Object.entries(languages[currentLocale]).reduce(
      (acc, [code, label]) => {
        acc[code] = label
        return acc
      },
      {} as Record<string, string>
  )
})
</script>