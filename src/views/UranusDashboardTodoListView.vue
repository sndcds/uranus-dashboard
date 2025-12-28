<!--
  UranusDashboardTodoListView.vue
-->
<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('dashboard_todo_hero')"
        :subtitle="t('dashboard_todo_hero_description')"
    />

    <UranusDashboardActionBar>
    </UranusDashboardActionBar>

    <DashboardTodoListComponent />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import DashboardTodoListComponent from '@/components/dashboard/DashboardTodoListComponent.vue'
import UranusDashboardHero from "@/components/dashboard/UranusDashboardHero.vue"
import UranusDashboardNotifications from '@/components/dashboard/UranusDashboardNotifications.vue'
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue";
import JSONAdminFetch from "@/components/JSONAdminFetch.vue";
import UranusBlob from "@/components/uranus/UranusBlob.vue";

const { t } = useI18n()

</script>
