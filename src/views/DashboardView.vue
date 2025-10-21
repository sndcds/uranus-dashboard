<template>
  <div class="dashboard-container">
    <h1>{{ t('dashboard') }}</h1>
    <TwoStageTagListComponent />
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import TwoStageTagListComponent from "@/components/TwoStageTagListComponent.vue";
const { t } = useI18n()
</script>

<style scoped>
.dashboard-container {
}
</style>