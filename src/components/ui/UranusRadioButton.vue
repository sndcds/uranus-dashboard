<template>
  <label class="uranus-radio" :class="{ disabled }">
    <input
        type="radio"
        :name="name"
        :value="value"
        :checked="modelValue === value"
        @change="updateValue"
        :disabled="disabled"
    />
    <span class="radio-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  value: string | number
  name?: string
  label?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
