<!--
  UranusInlineCancelButton.view
-->
<template>
  <button
      type="button"
      class="uranus-cancel-button"
      :disabled="disabled"
      @click="handleClick"
      :aria-label="label"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Cancel' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits<{
  (e: 'cancel', event?: MouseEvent): void
}>()

function handleClick(e: MouseEvent) {
  if (!props.disabled) {
    emit('cancel', e)
  }
}
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