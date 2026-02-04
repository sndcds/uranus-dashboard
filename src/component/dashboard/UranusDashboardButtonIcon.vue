<template>
  <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
  >
    <path :d="path" />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps({
  path: { type: String, required: true }
})
</script>