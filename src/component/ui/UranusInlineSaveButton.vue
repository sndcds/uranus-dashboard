<!--
  UranusInlineSaveButton.view
-->
<template>
  <button
      type="button"
      class="uranus-ok-button"
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

