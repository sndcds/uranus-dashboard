<!--
  src/component/event/ui/UranusEventCategoryDisplay.vue
-->

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  categories: number[] | null
}

const props = defineProps<Props>()

import { eventCategoryColor } from '@/domain/event/eventCategory'

const circles = computed(() => {
  const categories = props.categories ?? []
  return categories.map(category => ({
    id: category,
    color: eventCategoryColor(category),
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
