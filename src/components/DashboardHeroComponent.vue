<template>
  <section class="uranus-dahboard-hero">
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

<style scoped lang="scss">
.dashboard-hero {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--surface);
  text-align: center;

  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0;
  }

  p {
    font-size: 1rem;
    color: var(--muted-text);
    margin: 0;
  }
}
</style>