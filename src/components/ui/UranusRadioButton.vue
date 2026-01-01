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

<style scoped lang="scss">
.uranus-radio {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  font-size: 0.95rem;
  color: var(--color-text);
  gap: 0.5rem;

  input[type='radio'] {
    opacity: 0;
    position: absolute;
    width: 0;
    height: 0;
  }

  .radio-label {
    position: relative;
    padding-left: 1.8rem;
    user-select: none;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 1.2rem;
      height: 1.2rem;
      border: 2px solid var(--border-soft);
      border-radius: 50%;
      background: var(--surface-primary, #fff);
      transition: border-color 0.2s ease;
    }
  }

  input[type='radio']:checked + .radio-label::after {
    content: '';
    position: absolute;
    left: 0.35rem;
    top: 50%;
    transform: translateY(-50%);
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--accent-primary, #3182ce);
  }

  &:hover .radio-label::before {
    border-color: var(--accent-primary, #3182ce);
  }

  &.disabled {
    cursor: not-allowed;
    color: #888;

    .radio-label::before {
      border-color: #ccc;
      background: #f5f5f5;
    }

    input[type='radio']:checked + .radio-label::after {
      background: #aaa;
    }
  }
}
</style>