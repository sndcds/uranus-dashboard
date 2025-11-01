<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent
        :title="t('settings')"
        :subtitle="heroSubtitle"
    />
    <section class="settings-card">
      <div class="settings-notice">
        <p>{{ preferencesNotice }}</p>
        <RouterLink class="settings-notice__link" :to="{ name: 'user-profile' }">
          {{ openProfileLabel }}
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue";

const { t, te } = useI18n({ useScope: 'global' })

const heroSubtitle = computed(() => (te('settings_subtitle') ? t('settings_subtitle') : 'Adjust how your workspace looks and feels.'))
const preferencesNotice = computed(() => (te('settings_preferences_notice') ? t('settings_preferences_notice') : 'Language and theme now live inside your profile preferences.'))
const openProfileLabel = computed(() => (te('settings_open_profile') ? t('settings_open_profile') : 'Open profile preferences'))
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

.settings-notice {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1.25rem);
  color: var(--muted-text);
  font-size: 0.95rem;
  line-height: 1.6;
}

.settings-notice__link {
  align-self: flex-start;
  @include form-secondary-button($padding-y: 0.65rem, $padding-x: 1.4rem);
}

@media (max-width: 540px) {
  .settings-card {
    padding: clamp(1.25rem, 6vw, 1.8rem);
  }
}
</style>
