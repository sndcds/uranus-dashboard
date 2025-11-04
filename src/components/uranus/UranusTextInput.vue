<template>
  <div class="uranus-textfield-wrapper">
    <label :for="id" class="uranus-label">
      <span class="uranus-label-text">
        {{ label }}
        <span v-if="required" class="uranus-form-required" aria-hidden="true">*</span>
      </span>

      <input
          :id="id"
          :type="type"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :class="sizeClass"
          :aria-required="required ? 'true' : 'false'"
          :aria-invalid="error ? 'true' : 'false'"
      />

      <p v-if="error" class="uranus-field-error">{{ error }}</p>
    </label>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // tiny / normal / big
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'tiny': return 'uranus-tiny-text'
    case 'big': return 'uranus-big-text'
    default: return ''
  }
})
</script>

<style scoped>
.uranus-textfield-wrapper {
  width: 100%;
  padding: 0;
  margin: 0;
}

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

.uranus-text-input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.uranus-tiny-text {
  font-size: 0.85rem;
}

.uranus-big-text {
  font-size: 1.3rem;
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