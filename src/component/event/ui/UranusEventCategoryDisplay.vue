<script setup lang="ts">
import { computed, defineProps } from 'vue'

interface Props {
  categories: number[] | null
}

const props = defineProps<Props>()

// Map category IDs to CSS variable names
// TODO: Build composable for event category functions, constants and interfaces
const CATEGORY_COLORS: Record<number, string> = {
  1: 'var(--uranus-event-category-culture-color)',
  2: 'var(--uranus-event-category-education-color)',
  3: 'var(--uranus-event-category-sports-color)',
  4: 'var(--uranus-event-category-leisure-color)',
  5: 'var(--uranus-event-category-family-color)',
  6: 'var(--uranus-event-category-society-color)',
}

const circles = computed(() => {
  if (!props.categories || props.categories.length === 0) return []
  return props.categories.map(cat => ({
    id: cat,
    color: CATEGORY_COLORS[cat] ?? '#999', // fallback grey
  }))
})
</script>

<template>
  <div class="event-category-circles">
    <span
        v-for="circle in circles"
        :key="circle.id"
        class="circle"
        :style="{ backgroundColor: circle.color }"
        :title="`Category ${circle.id}`"
    />
  </div>
</template>

<style scoped lang="scss">
.event-category-circles {
  display: flex;
  align-items: center;
  gap: 4px;

  .circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: block;
  }
}
</style>