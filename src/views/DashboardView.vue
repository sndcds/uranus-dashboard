<template>
  <div class="dashboard-container">
    <h1>{{ t('dashboard') }}</h1>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
const { t } = useI18n()
</script>

<style scoped lang="scss">
.dashboard-container {
}
</style>