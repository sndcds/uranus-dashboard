<!--
  src/component/ui/UranusCheckbox.vue

  2026-03-21, Roald
-->

<template>
  <div class="uranus-checkbox-outlined" @click="toggle">
    <input
        type="checkbox"
        :id="id"
        :value="value"
        :checked="isChecked"
        @change="onChange"
    />

    <span class="checkmark">
      <svg
          v-if="isChecked"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>

    <span class="label-text">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  modelValue: boolean | string[]
  value?: string
  required?: boolean
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean | string[]): void
}>()

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.value ? props.modelValue.includes(props.value) : false
  }
  return props.modelValue
})

function updateArray(checked: boolean) {
  if (!Array.isArray(props.modelValue) || !props.value) return

  let newValue = [...props.modelValue]

  if (checked) {
    if (!newValue.includes(props.value)) {
      newValue.push(props.value)
    }
  } else {
    newValue = newValue.filter(v => v !== props.value)
  }

  emit('update:modelValue', newValue)
}

const toggle = (e: MouseEvent) => {
  if ((e.target as HTMLElement).tagName === 'INPUT') return

  if (Array.isArray(props.modelValue)) {
    updateArray(!isChecked.value)
  } else {
    emit('update:modelValue', !props.modelValue)
  }
}

const onChange = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked

  if (Array.isArray(props.modelValue)) {
    updateArray(checked)
  } else {
    emit('update:modelValue', checked)
  }
}
</script>

<style lang="scss">
.uranus-checkbox-outlined {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem 0.4rem;
  transition: all 0.2s ease;

  input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    clip: rect(0 0 0 0);
    overflow: hidden;
  }

  input:focus-visible + .checkmark {
    outline: 2px solid var(--uranus-focus-color);
    outline-offset: 2px;
  }

  .checkmark {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--uranus-input-border-color);
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  input:checked + .checkmark,
  &:has(input:checked) .checkmark {
    background: var(--uranus-select-color);
    border-color: var(--uranus-select-color);

    svg {
      width: 18px;
      height: 18px;
      stroke: white;
    }
  }

  .label-text {
    font-size: 1rem;
    font-weight: 400;
  }
}
</style>