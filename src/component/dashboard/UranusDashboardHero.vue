<!--
  src/component/dashboard/UranusDashboardHero.vue
-->

<template>
  <section class="uranus-dashboard-hero">
    <h1 class="uranus-admin-page-title">{{ props.title }}</h1>
    <p v-if="subtitle">{{ props.subtitle }}</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
}>()
</script>
