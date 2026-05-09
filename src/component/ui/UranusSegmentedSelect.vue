<!--
  src/component/ui/UranusSegmentedSelect.vue
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
  border-radius: 4px;
  overflow: hidden;

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
    background: var(--uranus-bg);
    border: 1px solid var(--uranus-input-border-color);

    &:not(:last-child) {
      border-right: 10px solid var(--uranus-input-border-color);
    }
  }

  /* Chip style */
  &--chip .segmented-select__button {
    border-radius: 9999px;
    background: var(--uranus-bg);
    border: none;
    padding: 0.25rem 0.75rem;
  }

  &--chip .segmented-select__button.is-active {
    background: var(--uranus-select-bg-active);
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
    background: var(--uranus-bg);
  }

  &.is-active {
    background: var(--uranus-select-bg-active);
    color: #fff;

    &:hover {
      background: var(--uranus-select-bg-hover);
    }
  }

  &.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.segmented-select--default
.segmented-select__button {
  background: var(--uranus-bg);
  border: 1px solid var(--uranus-color-6);
  padding: 0.5rem 1rem;

  /* Middle buttons have no extra radius */
  border-radius: 0;

  &:not(:last-child) {
    border-right: 0.1px solid var(--uranus-color-6);
  }

  /* First button */
  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  /* Last button */
  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &:hover:not(.is-disabled) {
    background: var(--uranus-bg);
  }

  &.is-active {
    background: var(--uranus-select-bg);
    color: var(--uranus-select-color);

    &:hover {
      background: var(--uranus-select-bg-hover);
    }
  }

  &.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.segmented-select__button:not(:first-child) {
  margin-left: -1px;
}

.segmented-select--chip {
  display: inline-flex;
  gap: 0.5rem;


  .segmented-select__button {
    border-radius: 9999px;
    border: 1px solid var(--uranus-color-6);
    padding: 0.25rem 0.75rem;
    color: var(--uranus-color);
    background:var(--uranus-bg);

    &:hover:not(.is-disabled) {
      background:var(--uranus-bg);
    }

    &.is-active {
      background: var(--uranus-select-bg);
      color: var(--uranus-select-color);

      &:hover {
        background: var(--uranus-select-bg-hover);
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
