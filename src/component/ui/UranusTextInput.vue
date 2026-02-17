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
          :type="type"
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
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // tiny / normal / big
  flex: { type: [Number, String], default: 1 },
  error: { type: String, default: undefined },
  placeholder: { type: String, default: '' },       // added
  autocomplete: { type: String, default: 'off' },  // added
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

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

</script>