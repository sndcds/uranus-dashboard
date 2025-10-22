<template>
  <div class="settings-page">
    <section class="settings-hero">
      <h1>{{ t('settings') }}</h1>
      <p>{{ heroSubtitle }}</p>
    </section>

    <section class="settings-card">
      <form class="settings-form">
        <div class="form-group">
          <label for="language-select">{{ t('select_language') }}</label>
          <select id="language-select" v-model="selectedLocale">
            <option v-for="option in localeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="theme-select">{{ t('settings_theme') }}</label>
          <select id="theme-select" v-model="selectedTheme">
            <option v-for="option in themeOptions" :key="option.value" :value="option.value">
              {{ t(option.label) }}
            </option>
          </select>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/themeStore'

const { t, te, locale } = useI18n({ useScope: 'global' })
const themeStore = useThemeStore()

const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    locale.value = value
  },
})

const localeOptions = [
  { value: 'en', label: 'English' },
  { value: 'da', label: 'Dansk' },
  { value: 'de', label: 'Deutsch' },
]

const heroSubtitle = computed(() => (te('settings_subtitle') ? t('settings_subtitle') : 'Adjust how your workspace looks and feels.'))

const selectedTheme = computed({
  get: () => themeStore.theme,
  set: (value) => themeStore.setTheme(value),
})

const themeOptions = [
  { value: 'light', label: 'settings_theme_light' },
  { value: 'dark', label: 'settings_theme_dark' },
]
</script>

<style scoped lang="scss">
.settings-page {
  @include form-page();
}

.settings-hero {
  @include form-hero(540px);
}

.settings-card {
  @include form-card(720px, clamp(1.75rem, 4vw, 2.5rem), clamp(1.25rem, 3vw, 1.75rem));
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.form-group {
  @include form-group();
}

@media (max-width: 540px) {
  .settings-card {
    padding: clamp(1.25rem, 6vw, 1.8rem);
  }
}
</style>
