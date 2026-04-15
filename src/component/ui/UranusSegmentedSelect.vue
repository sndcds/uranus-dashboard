<!--
  src/component/ui/UranusSegmentedSelect.vue
  2026-03-27
  Updated: Added `variant` prop for default or chip style
-->

<template>
  <div
      class="segmented-select"
      :class="[
        `segmented-select--${size}`,
        { 'segmented-select--full': fullWidth },
        `segmented-select--${variant}`
      ]"
      role="radiogroup"
      tabindex="0"
      @keydown="onKeydown"
  >
    <button
        v-for="(option, index) in options"
        :key="String(option.value)"
        type="button"
        role="radio"
        :aria-checked="modelValue === option.value"
        :disabled="option.disabled"
        class="segmented-select__button"
        :class="[
          option.class,
          {
            'is-active': modelValue === option.value,
            'is-disabled': option.disabled
          }
        ]"
        @click="select(option.value, option.disabled)"
        @focus="focusedIndex = index"
    >
      <span v-if="option.icon" class="segmented-select__icon">
        <component :is="option.icon" />
      </span>
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Option {
  label: string
  value: string | number | boolean
  class?: string
  disabled?: boolean
  icon?: any
}

const props = withDefaults(defineProps<{
  modelValue: string | number | boolean
  options: Option[]
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  variant?: 'default' | 'chip'
}>(), {
  size: 'medium',
  fullWidth: false,
  variant: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
}>()

const focusedIndex = ref(0)

const select = (value: string | number | boolean, disabled?: boolean) => {
  if (disabled) return
  emit('update:modelValue', value)
}

const onKeydown = (e: KeyboardEvent) => {
  if (!props.options.length) return

  if (e.key === 'ArrowRight') {
    focusedIndex.value = (focusedIndex.value + 1) % props.options.length
  } else if (e.key === 'ArrowLeft') {
    focusedIndex.value =
        (focusedIndex.value - 1 + props.options.length) % props.options.length
  } else if (e.key === 'Enter' || e.key === ' ') {
    const option = props.options[focusedIndex.value]
    if (option && !option.disabled) {
      select(option.value)
    }
  }
}
</script>

<style scoped lang="scss">
.segmented-select {
  display: inline-flex;
  align-self: flex-start;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;

  &--full {
    display: flex;
    width: 100%;

    .segmented-select__button {
      flex: 1;
    }
  }

  &--small .segmented-select__button {
    padding: 0.25rem 0.5rem;
    font-size: 0.85rem;
  }

  &--medium .segmented-select__button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  &--large .segmented-select__button {
    padding: 0.75rem 1.25rem;
    font-size: 1.1rem;
  }

  /* Default segmented style */
  &--default .segmented-select__button {
    border-radius: 10px;
    background: #fff;
    border: 1px solid #ccc;

    &:not(:last-child) {
      border-right: 1px solid #ccc;
    }
  }

  /* Chip style */
  &--chip .segmented-select__button {
    border-radius: 9999px;
    background: #f0f0f0;
    border: none;
    padding: 0.25rem 0.75rem;
  }

  &--chip .segmented-select__button.is-active {
    background: #007bff;
    color: #fff;
  }
}

.segmented-select__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(.is-disabled) {
    background: #e0e0e0;
  }

  &.is-active {
    background: #007bff;
    color: #fff;

    &:hover {
      background: #0565cf;
    }
  }

  &.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.segmented-select--default .segmented-select__button {
  background: #fff;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;

  /* Middle buttons have no extra radius */
  border-radius: 0;

  &:not(:last-child) {
    border-right: 1px solid #ccc;
  }

  /* First button */
  &:first-child {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }

  /* Last button */
  &:last-child {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  &:hover:not(.is-disabled) {
    background: #f5f5f5;
  }

  &.is-active {
    background: #007bff;
    color: #fff;

    &:hover {
      background: #0565cf;
    }
  }

  &.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.segmented-select--chip {
  display: inline-flex;
  gap: 0.5rem;

  .segmented-select__button {
    border-radius: 9999px;
    background: #f0f0f0;
    border: none;
    padding: 0.25rem 0.75rem;

    &:hover:not(.is-disabled) {
      background: #e0e0e0;
    }

    &.is-active {
      background: #007bff;
      color: #fff;

      &:hover {
        background: #0565cf;
      }
    }

    &.is-disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

.segmented-select__icon {
  display: inline-flex;
  align-items: center;
  width: 1em;
  height: 1em;
  font-size: 1em;
}
</style>
