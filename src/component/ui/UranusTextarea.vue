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

const props = defineProps<{
  id: string
  label: string
  modelValue?: string | undefined
  required?: boolean
  size?: string
  flex?: number | string
  error?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  name?: string
}>()


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
