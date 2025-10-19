<template>
  <div class="settings-page">
    <section class="settings-hero">
      <h1>{{ t('settings') }}</h1>
      <p>{{ heroSubtitle }}</p>
    </section>

    <section class="settings-card">
      <form class="settings-form">
        <div class="form-group">
          <label for="language-select">{{ t('selectLanguage') }}</label>
          <select id="language-select" v-model="selectedLocale">
            <option v-for="option in localeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
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

const { t, te, locale } = useI18n({ useScope: 'global' })

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
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  padding: clamp(1.5rem, 4vw, 3rem);
  background: linear-gradient(135deg, rgba(72, 93, 255, 0.1), rgba(141, 233, 255, 0.15));
  backdrop-filter: blur(6px);
}

.settings-hero {
  text-align: center;
  max-width: 540px;
  color: #1f2937;

  h1 {
    font-size: clamp(1.9rem, 3vw, 2.5rem);
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0;
    font-size: clamp(1rem, 2.3vw, 1.15rem);
    color: rgba(31, 41, 55, 0.75);
    line-height: 1.6;
  }
}

.settings-card {
  width: min(720px, 100%);
  background: #ffffff;
  border-radius: 24px;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  box-shadow: 0 24px 50px rgba(31, 41, 55, 0.16);
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 3vw, 1.75rem);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    color: #111827;
    letter-spacing: 0.01em;
  }

  select {
    padding: 0.75rem 0.9rem;
    border: 1px solid rgba(17, 24, 39, 0.1);
    border-radius: 12px;
    background-color: rgba(243, 244, 246, 0.6);
    color: #111827;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: rgba(91, 103, 255, 0.65);
      box-shadow: 0 0 0 4px rgba(91, 103, 255, 0.15);
      background-color: #fff;
    }
  }
}

@media (max-width: 540px) {
  .settings-card {
    padding: clamp(1.25rem, 6vw, 1.8rem);
  }
}
</style>
