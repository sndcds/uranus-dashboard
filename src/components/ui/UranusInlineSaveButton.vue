<!--
  UranusInlineSaveButton.view
-->
<template>
  <button
      type="button"
      class="uranus-save-button"
      :disabled="disabled"
      @click="handleClick"
      :aria-label="loading ? busyLabel : label"
  >
    <template v-if="!loading">{{ label }}</template>
    <template v-else>{{ busyLabel }}</template>
  </button>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Save' },
  busyLabel: { type: String, default: 'Saving...' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits<{
  (e: 'save', event?: MouseEvent): void
}>()

function handleClick(e: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('save', e)
  }
}
</script>

<style scoped lang="scss">

/* Keyboard focus */
.uranus-save-button:focus {
  outline: none; /* remove default outline */
  border-color: var(--uranus-focus-border-color);
  box-shadow: 0 0 0 1px var(--uranus-focus-border-color);
}

/* Disabled */
.uranus-save-button:disabled,
.uranus-save-button[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>