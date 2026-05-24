<template>
  <div class="uranus-form-row" :style="gridStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  cols: {
    type: Number,
    default: 1
  },
  minColWidth: {
    type: String,
    default: ''
  },
  gap: {
    type: String,
    default: '10px'
  }
})

const gridStyle = computed(() => {
  const hasMaxColWidth = props.minColWidth && props.minColWidth.length > 0
  return {
    display: 'grid',
    gridTemplateColumns: hasMaxColWidth
        ? `repeat(auto-fit, minmax(${props.minColWidth}, 1fr))`
        : `repeat(${props.cols}, minmax(0, 1fr))`,
    gap: props.gap,
    width: '100%'
  }
})
</script>

<style>
.uranus-form-row {
  align-items: start;
}
</style>