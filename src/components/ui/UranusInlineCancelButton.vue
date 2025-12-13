<template>
  <button
      type="button"
      class="uranus-cancel-button"
      :disabled="disabled"
      @click="onClick"
      :aria-label="label"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

defineProps({
  label: { type: String, default: 'Cancel' },
  disabled: { type: Boolean, default: false },
  onClick: {
    type: Function as PropType<(e: MouseEvent) => void>,
    required: true
  }
})
</script>

<style scoped lang="scss">

/* Keyboard focus */
.uranus-cancel-button:focus {
  outline: none; /* remove default outline */
  border-color: var(--uranus-focus-border-color);
  box-shadow: 0 0 0 1px var(--uranus-focus-border-color);
}

/* Disabled */
.uranus-cancel-button:disabled,
.uranus-cancel-button[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>