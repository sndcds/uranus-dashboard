<template>
  <label :for="id">
    <span class="uranus-label-text">
      {{ label }}
      <span v-if="required" class="uranus-form-required" aria-hidden="true">*</span>
      <span v-if="required" class="uranus-sr-only">{{ requiredA11yLabel }}</span>
    </span>

    <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="big"
    />

    <p v-if="error" class="uranus-field-error">{{ error }}</p>
  </label>
</template>

<script setup>

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  id: { type: String, required: true },
  error: { type: String, default: '' },
  requiredA11yLabel: { type: String, default: '(required)' }
})

const emit = defineEmits(['update:modelValue'])
</script>