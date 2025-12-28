<!--
  UranusDashboardView.vue
-->
<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('dashboard_hero')"
        :subtitle="t('dashboard_hero_description')"
    />

    <UranusDashboardActionBar>
    </UranusDashboardActionBar>

    <UranusDashboardNotifications />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import UranusDashboardTodoList from '@/components/dashboard/UranusDashboardTodoList.vue'
import UranusDashboardHero from "@/components/dashboard/UranusDashboardHero.vue"
import UranusDashboardNotifications from '@/components/dashboard/UranusDashboardNotifications.vue'
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue";
import JSONAdminFetch from "@/components/JSONAdminFetch.vue";
import UranusBlob from "@/components/uranus/UranusBlob.vue";

const { t } = useI18n()

</script>