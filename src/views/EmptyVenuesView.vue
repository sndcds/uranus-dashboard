<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
      :title="t('venues')"
      :subtitle="t('organizations_overview_subtitle')"
    />

    <div class="empty-state">
      <div class="uranus-card">
        <div class="empty-state-content">
          <h3>{{ t('no_organization_selected') }}</h3>
          <p>{{ t('no_organization_selected_description') }}</p>
          <router-link to="/admin/organizations" class="uranus-button">
            {{ t('go_to_organizations') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import UranusDashboardHero from '@/components/dashboard/UranusDashboardHero.vue'

const { t } = useI18n()
</script>

<style scoped lang="scss">
.empty-state {
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.empty-state-content {
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
  }

  p {
    margin: 0;
    color: var(--uranus-muted-text);
    line-height: 1.6;
  }
}
</style>
