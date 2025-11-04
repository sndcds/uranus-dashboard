<template>
  <div class="uranus-textfield-wrapper" :style="{ flex: flexValue }">
    <UranusFieldLabel
        :id="id"
        :label="label"
        :required="required"
        :error="error"
    >
      <input
          :id="id"
          :type="type"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :class="['uranus-text-input', sizeClass]"
          :aria-required="required ? 'true' : 'false'"
          :aria-invalid="error ? 'true' : 'false'"
      />
    </UranusFieldLabel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import UranusFieldLabel from './UranusFieldLabel.vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // tiny / normal / big
  flex: { type: [Number, String], default: 1 },
  error: { type: String, default: '' },
})

const flexValue = computed(() => {
  // Support both numeric and string values
  return typeof props.flex === 'number' ? `${props.flex}` : props.flex
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
</style>