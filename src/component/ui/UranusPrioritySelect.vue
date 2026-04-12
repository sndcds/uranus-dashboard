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
      {{ t(option.label) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
const selected = ref(props.modelValue ?? 'mid')

// Watch prop changes to update internal state
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) selected.value = newVal
})

// Options
const options: Option[] = [
  { label: 'low', value: 'low', color: 'var(--uranus-low-priority_color)' },
  { label: 'mid', value: 'mid', color: 'var(--uranus-medium-priority_color)' },
  { label: 'high', value: 'high', color: 'var(--uranus-high-priority_color)' }
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
  width: max-content;
  align-self: flex-start;
  padding: 0;
  margin-left: auto;
}

/* base button */
.priority-chip-select__button {
  border: 1px solid var(--uranus-color-6);
  background: var(--uranus-color-9);
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin: 0;
}

/* remove double borders between buttons */
.priority-chip-select__button:not(:first-child) {
  margin-left: -1px;
}

/* rounded group */
.priority-chip-select__button:first-child {
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
}

.priority-chip-select__button:last-child {
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}

/* hover */
.priority-chip-select__button:hover {
  background: var(--uranus-color-8);
}

/* active state = colored border */
.priority-chip-select__button.is-active {
  z-index: 1;
  background: #fff;
  border-width: 1px;
}
</style>
