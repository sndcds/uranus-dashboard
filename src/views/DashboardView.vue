<template>
  <div class="events-page">
    <div class="dashboard-hero">
      <h1>{{ t('dashboard') }}</h1>
      <p>{{ t('dashboard_description') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
const { t } = useI18n()
</script>

<style scoped lang="scss">
.events-page {
  @include form-page();
}

.dashboard-hero {
  @include form-hero(560px);
}
</style>