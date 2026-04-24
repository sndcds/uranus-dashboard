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
      <textarea
          :id="id"
          :value="modelValue"
          :class="['uranus-textarea']"
          :style="textareaStyle"
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
    </UranusLabel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusLabel from './UranusLabel.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id: string
  label: string
  modelValue?: string | undefined
  required?: boolean
  flex?: number | string
  error?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  name?: string
  height?: string | number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}>()

const emit = defineEmits(['update:modelValue'])

const textareaStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.height) {
    style.height =
        typeof props.height === 'number'
            ? `${props.height}px`
            : props.height
  }
  if (props.resize) {
    style.resize = props.resize
  }
  return style
})

const inputName = computed(() => props.name || undefined)

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement | null
  emit('update:modelValue', target?.value ?? '')
}
</script>
