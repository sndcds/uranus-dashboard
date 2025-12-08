<template>
  <section class="uranus-card-hero">
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="subtitle">{{ subtitle }}</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped lang="scss">
</style>