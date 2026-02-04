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
      <textarea
          :id="id"
          :value="modelValue"
          :class="['uranus-textarea', sizeClass]"
          :aria-required="required ? 'true' : 'false'"
          :aria-invalid="error ? 'true' : 'false'"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          :name="inputName"
          v-bind="$attrs"
          @input="onInput"
      ></textarea>
    </UranusFieldLabel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusFieldLabel from './UranusFieldLabel.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },

  modelValue: { type: String, default: '' },

  required: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // tiny / normal / big
  flex: { type: [Number, String], default: 1 },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },

  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  name: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'tiny': return 'uranus-textarea-tiny'
    case 'big': return 'uranus-textarea-big'
    default: return ''
  }
})

const inputName = computed(() => props.name || undefined)

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement | null
  emit('update:modelValue', target?.value ?? '')
}
</script>
