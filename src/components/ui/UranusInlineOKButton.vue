<template>
  <button
      type="button"
      class="uranus-inline-save-button"
      :disabled="disabled"
      @click="onClick"
      :aria-label="loading ? busyLabel : label"
  >
    <span v-if="!loading">{{ label }}</span>
    <span v-else>{{ busyLabel }}</span>
  </button>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
  label: { type: String, default: 'Save' },
  busyLabel: { type: String, default: 'Saving...' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  onClick: {
    type: Function as PropType<(e: MouseEvent) => void>,
    required: true
  },
})
</script>

<style scoped lang="scss">

/* Keyboard focus */
.uranus-inline-save-button:focus {
  outline: none; /* remove default outline */
  border-color: var(--uranus-focus-border-color);
  box-shadow: 0 0 0 1px var(--uranus-focus-border-color);
}

/* Disabled */
.uranus-inline-save-button:disabled,
.uranus-inline-save-button[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>