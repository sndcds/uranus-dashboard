<template>
  <label :for="id" class="uranus-label">
    <span class="uranus-label-text">
      {{ label }}
      <span v-if="required" class="uranus-form-required" aria-hidden="true">*</span>
    </span>

    <!-- slot for the actual field (input, select, textarea, etc.) -->
    <slot />

    <p v-if="error" class="uranus-field-error">{{ error }}</p>
  </label>
</template>

<script setup>
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
</script>

<style scoped>
.uranus-label {
  display: flex;
  flex-direction: column;
}

.uranus-label-text {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.uranus-field-error {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.uranus-form-required {
  color: #dc2626;
  font-weight: 700;
}
</style>