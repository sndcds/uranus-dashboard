<template>
  <label
      :for="id"
      class="uranus-label"
      :style="{ flex: props.flex ?? 1 }"
  >
    <span class="uranus-label-row">
      {{ label }}
      <span
          v-if="required"
          class="uranus-input-required"
          aria-hidden="true"
      >*</span>
    </span>

    <slot />

    <span
        v-if="error"
        class="uranus-field-error"
    >
      {{ error }}
    </span>
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

<style lang="scss">
.label-text2 {
  padding-left: 10px;
  margin: 0;
  font-weight: 400;
  font-size: 0.9rem;
  color: var(--uranus-color-dimmed);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}




.uranus-field-error {
  margin: 0;
  color: var(--uranus-required-color);
}

.uranus-input-required {
  color: var(--uranus-required-color);
  font-weight: 700;
}
</style>