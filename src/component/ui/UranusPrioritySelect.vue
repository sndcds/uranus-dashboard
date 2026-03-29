<!--
  src/component/ui/UranusPioritySelect.vue
  2026-03-27
  A standalone 3-step chip-style selector for marking importance with colors.
-->

<template>
  <div class="priority-chip-select" role="radiogroup">
    <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="selected === option.value"
        :class="['priority-chip-select__button', { 'is-active': selected === option.value } ]"
        :style="selected === option.value ? { backgroundColor: option.color, color: '#fff' } : {}"
        @click="select(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'

interface Option {
  label: string
  value: string
  color: string
}

// Props for v-model
const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': (value: string) => void
}>()

// Internal selected state
const selected = ref(props.modelValue ?? 'medium')

// Watch prop changes to update internal state
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) selected.value = newVal
})

// Options
const options: Option[] = [
  { label: 'Low', value: 'low', color: '#34d399' },
  { label: 'Medium', value: 'medium', color: '#facc15' },
  { label: 'High', value: 'high', color: '#f87171' }
]

// Select function
const select = (value: string) => {
  selected.value = value
  emit('update:modelValue', value) // emit to parent
}
</script>

<style scoped lang="scss">
.priority-chip-select {
  display: inline-flex;
  flex: 0 0 auto;
  width: max-content;
  align-self: flex-start;
  gap: 0.4rem;
  margin-left: auto;
  padding: 0.4rem;

  &__button {
    border: none;
    border-radius: 9999px;
    padding: 0.3rem 0.6rem;
    background: #f0f0f0;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #e0e0e0;
    }

    &.is-active {
      /* background color is set inline from option.color */
    }
  }
}
</style>
