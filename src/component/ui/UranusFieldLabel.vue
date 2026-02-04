<template>
  <label
      :for="id"
      class="uranus-label"
      :style="{ flex: props.flex ?? 1 }">
    <div class="uranus-label-text">
      {{ label }}
      <span v-if="required" class="uranus-input-required" aria-hidden="true">*</span>
      <span v-if="error" class="uranus-field-error">{{ error }}</span>
    </div>
    <slot />
  </label>
</template>

<script setup>
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  flex: { type: [String, Number], default: 1 }
})
</script>

<style scoped>
.uranus-field-error {
  margin: 0;
  color: var(--uranus-required-color);
}

.uranus-input-required {
  color: var(--uranus-required-color);
  font-weight: 700;
}
</style>