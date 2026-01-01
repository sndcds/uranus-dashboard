<template>
  <component
      :is="to ? 'router-link' : 'span'"
      :to="to"
      class="uranus-inline-icon"
      :class="modeClass"
      :title="title"
      @click="handleClick"
  >
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        :class="`${mode}-icon`"
    >
      <path :d="iconPath" />
    </svg>
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Props:
 * - title: optional tooltip
 * - to: optional router link
 * - mode: 'edit' | 'delete' | 'add'
 */
const props = defineProps<{
  title?: string
  to?: string
  mode?: 'edit' | 'delete' | 'add'
}>()

/**
 * Emits:
 * - 'click' with the native MouseEvent
 */
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

/**
 * Click handler
 * - Stops propagation
 * - Emits native MouseEvent
 */
function handleClick(event: MouseEvent) {
  event.stopPropagation()
  emit('click', event)
}

/**
 * Determine which SVG path to use
 */
const iconPath = computed(() => {
  switch (props.mode) {
    case 'delete':
      return 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'
    case 'add':
      return 'M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z'
    case 'edit':
    default:
      return 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 0 0 0-1.42l-2.34-2.34a1.004 1.004 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z'
  }
})

/**
 * CSS classes for styling
 */
const modeClass = computed(() => ({
  delete: props.mode === 'delete',
  add: props.mode === 'add',
  edit: props.mode === 'edit',
  clickable: true
}))
</script>

<style scoped>
.uranus-inline-icon {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.uranus-inline-icon svg {
  width: 1em;
  height: 1em;
}
</style>