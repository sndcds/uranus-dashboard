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
        :class="['uranus-text-input', inputClasses]"
    />

    <p v-if="error" class="uranus-field-error">{{ error }}</p>
  </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  id: { type: String, required: true },
  error: { type: String, default: '' },
  requiredA11yLabel: { type: String, default: '(required)' },
  size: { type: String, default: 'normal', validator: (val) => ['tiny', 'normal', 'big'].includes(val) }
})

const emit = defineEmits(['update:modelValue'])

// Compute the input class based on the size prop
const inputClasses = computed(() => {
  switch (props.size) {
    case 'tiny':
      return 'uranus-tiny-text'
    case 'big':
      return 'uranus-big-text'
    default:
      return '' // normal size uses default styling
  }
})
</script>