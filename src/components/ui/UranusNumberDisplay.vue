<template>
  <div class="stat-card">
    <div class="stat-number">{{ number }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: number | string
  label: string
}>()
</script>

<style scoped lang="scss">
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--uranus-default-text-padding);
  min-width: 140px;
  max-width: 200px;
  overflow: hidden;
  border-right: 1px solid var(--uranus-card-border-color);
  border-radius: var(--uranus-tiny-border-radius);
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 600;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--uranus-muted-text, #666);
}
</style>