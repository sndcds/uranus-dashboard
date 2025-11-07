<template>
  <button
      type="button"
      class="uranus-inline-cancel-button"
      :disabled="disabled"
      @click="onClick">
    {{ label }}
  </button>
</template>

<script setup>
defineProps({
  label: { type: String, default: 'Cancel' },
  disabled: { type: Boolean, default: false },
  onClick: { type: Function, required: true }
})
</script>