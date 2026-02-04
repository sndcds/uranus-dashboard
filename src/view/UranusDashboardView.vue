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

import UranusDashboardTodoList from '@/component/dashboard/UranusDashboardTodoList.vue'
import UranusDashboardHero from "@/component/dashboard/UranusDashboardHero.vue"
import UranusDashboardNotifications from '@/component/dashboard/UranusDashboardNotifications.vue'
import UranusDashboardActionBar from "@/component/uranus/UranusDashboardActionBar.vue";
import UranusBlob from "@/component/uranus/UranusBlob.vue";

const { t } = useI18n()

</script>