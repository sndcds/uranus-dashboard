<!--
  UranusNumberInput
-->
<template>
  <div
      class="uranus-textfield-wrapper"
      :style="{ flex: props.flex ?? 1 }"
  >
    <UranusFieldLabel
        :id="id"
        :label="label"
        :required="required"
        :error="error"
    >
      <input
          :id="id"
          type="number"
          :value="modelValue"
          :class="['uranus-text-input', sizeClass]"
          :aria-required="required ? 'true' : 'false'"
          :aria-invalid="error ? 'true' : 'false'"
          :placeholder="placeholder"
          :autocomplete="autocomplete"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          :name="inputName"
          v-bind="$attrs"
          @input="onInput($event)"
      />
    </UranusFieldLabel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusFieldLabel from './UranusFieldLabel.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: Number, default: null }, // Number only, default can be null
  required: { type: Boolean, default: false },
  size: { type: String, default: 'normal' },
  flex: { type: [Number, String], default: 1 },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  name: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'tiny': return 'uranus-tiny-text'
    case 'big': return 'uranus-big-text'
    default: return ''
  }
})

const inputName = computed(() => props.name || undefined)

// Number-only input: empty string → null, otherwise convert to number
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('update:modelValue', value === '' ? null : Number(value))
}
</script>