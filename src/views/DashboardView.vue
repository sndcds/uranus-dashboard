<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent :title="t('dashboard')" :subtitle="t('dashboard_description')" cta-label="Go to Inbox"
      cta-to="/messages" />

    <div style="padding: 16px;">
      <router-link :to="'/'" class="uranus-button">
        {{ t('event_portal') }}
      </router-link>
    </div>

    <DashboardTodoListComponent />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import DashboardTodoListComponent from '@/components/dashboard/DashboardTodoListComponent.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue"
import UranusBlob from "@/components/uranus/UranusBlob.vue";

const { t } = useI18n()
</script>

<style scoped lang="scss">
.events-page {
  display: flex;
  justify-content: center;
  background: #ed5c5c;
}

.dashboard-hero {
  @include form-hero(560px);
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.dashboard-cta {
  align-self: flex-start;
  padding: 0.85rem 2rem;
  border-radius: 999px;
  background: var(--accent-primary);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.dashboard-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.25);
  filter: brightness(1.05);
}

.dashboard-cta:focus-visible {
  outline: 2px solid var(--accent-secondary);
  outline-offset: 4px;
}
</style>
