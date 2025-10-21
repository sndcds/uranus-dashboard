<template>
  <div class="dashboard-container">
    <h1>{{ t('dashboard') }}</h1>
    <OrganizerChooser />
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import OrganizerChooser from "@/components/OrganizerChooser.vue";
const { t } = useI18n()
</script>

<style scoped>
.dashboard-container {
}
</style>