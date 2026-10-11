<!--
  UranusNumberInput
-->
<template>
  <div
      class="uranus-textfield-wrapper"
      :style="{ flex: props.flex ?? 1 }"
  >
    <UranusLabel
        :id="id"
        :label="label"
        :required="required"
        :error="error"
    >
      <input
          :id="id"
          type="number"
          :value="modelValue"
          :class="['uranus-input', sizeClass]"
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
    </UranusLabel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusLabel from './UranusLabel.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  id: string
  label: string
  modelValue: number | null
  required?: boolean
  size?: string
  flex?: number | string
  error?: string
  placeholder?: string
  autocomplete?: string
  disabled?: boolean
  readonly?: boolean
  name?: string
}>()

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