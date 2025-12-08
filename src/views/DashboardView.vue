<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent
        :title="t('dashboard')"
        :subtitle="t('dashboard_description')"
        cta-label="Go to Inbox"
        cta-to="/messages" />

    <UranusDashboardActionBar>
    </UranusDashboardActionBar>

    <DashboardTodoListComponent />
    <DashboardNotificationsComponent />
</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import DashboardTodoListComponent from '@/components/dashboard/DashboardTodoListComponent.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue"
import DashboardNotificationsComponent from '@/components/dashboard/DashboardNotificationsComponent.vue'
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue";
import JSONAdminFetch from "@/components/JSONAdminFetch.vue";
import UranusBlob from "@/components/uranus/UranusBlob.vue";

const { t } = useI18n()

</script>

<style scoped lang="scss">
</style>

