<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent
      :title="t('venues')"
      :subtitle="t('organizers_overview_subtitle')"
    />

    <div class="empty-state">
      <div class="uranus-card">
        <div class="empty-state-content">
          <h3>{{ t('no_organizer_selected') }}</h3>
          <p>{{ t('no_organizer_selected_description') }}</p>
          <router-link to="/admin/organizers" class="uranus-button">
            {{ t('go_to_organizers') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import DashboardHeroComponent from '@/components/DashboardHeroComponent.vue'

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
