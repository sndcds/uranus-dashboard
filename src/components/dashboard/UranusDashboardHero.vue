<!--
  UranusDashboardHero.vue
-->
<template>
  <section class="uranus-dashboard-hero">
    <h1>{{ title }}</h1>
    <p v-if="subtitle">{{ subtitle }}</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
}>()
</script>
