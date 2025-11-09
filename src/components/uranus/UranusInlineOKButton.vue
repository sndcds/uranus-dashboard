<template>
  <button
      type="button"
      class="uranus-inline-save-button"
      :disabled="disabled"
      @click="onClick">
    <span v-if="!loading">{{ label }}</span>
    <span v-else>{{ busyLabel }}</span>
  </button>
</template>

<script setup>
defineProps({
  label: { type: String, default: 'Save' },
  busyLabel: { type: String, default: 'Saving...' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  onClick: { type: Function, required: true }
})
</script>