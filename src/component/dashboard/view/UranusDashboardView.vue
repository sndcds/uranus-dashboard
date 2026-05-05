<!--
  src/component/dashboard/view/UranusDashboardView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('dashboard_hero')"
        :subtitle="t('dashboard_hero_description')"
    />

    <UranusDashboardEventNotifications />

  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusDashboardEventNotifications from '@/component/dashboard/UranusDashboardEventNotifications.vue'
import UranusOrgTitle from '@/component/layout/UranusOrgTitle.vue'

const { t } = useI18n()

</script>