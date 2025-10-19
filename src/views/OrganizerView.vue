<template>
<!-- Organizer View Template -->
  <div class="organizer-view">
    <h1>{{ t('organizer_details') }}</h1>
    <!-- Add organizer details here -->
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const organizerId = route.params.id
const { t } = useI18n()
</script>

<style scoped>

</style>