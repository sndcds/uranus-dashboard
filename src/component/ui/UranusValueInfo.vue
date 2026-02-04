<template>
  <div class="uranus-value-info">
    <span class="uranus-value-info-label">
      {{ label }}
    </span>
    <span class="uranus-value-info-value">
      {{ value }}
    </span>
  </div>
</template>

<script setup>

defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
})
</script>
