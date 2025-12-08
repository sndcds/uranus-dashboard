<template>
  <span class="uranus-dashboard-chip-wrapper">
    <span
        class="uranus-dashboard-chip"
        v-for="item in items"
        :key="item.typeId + '-' + item.genreId"
    >
      {{ formatItem(item) }}
    </span>
  </span>
</template>

<script setup lang="ts">
import type { UranusEventType } from '@/models/UranusEventModel.ts'

const props = defineProps<{
  items: UranusEventType[] | null
}>()

function formatItem(item: UranusEventType): string {
  if (!item.genreName || item.genreName.trim() === '') {
    return item.typeName ?? ''
  }
  return `${item.typeName} / ${item.genreName}`
}

</script>
