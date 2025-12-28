<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('settings')"
        :subtitle="heroSubtitle"
    />
    <section class="settings-card">
      <div class="settings-notice">
        <p>{{ preferencesNotice }}</p>
        <router-link class="settings-notice__link" :to="{ name: 'admin-user-profile' }">
          {{ openProfileLabel }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import UranusDashboardHero from "@/components/dashboard/UranusDashboardHero.vue";

const { t, te } = useI18n({ useScope: 'global' })

const heroSubtitle = computed(() => (te('settings_subtitle') ? t('settings_subtitle') : 'Adjust how your workspace looks and feels.'))
const preferencesNotice = computed(() => (te('settings_preferences_notice') ? t('settings_preferences_notice') : 'Language and theme now live inside your profile preferences.'))
const openProfileLabel = computed(() => (te('settings_open_profile') ? t('settings_open_profile') : 'Open profile preferences'))
</script>

<style scoped lang="scss">
.settings-card {
}

.settings-notice {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1.25rem);
  color: var(--uranus-muted-text);
  font-size: 0.95rem;
  line-height: 1.6;
}

.settings-notice__link {
  align-self: flex-start;
}

@media (max-width: 540px) {
  .settings-card {
    padding: clamp(1.25rem, 6vw, 1.8rem);
  }
}
</style>
