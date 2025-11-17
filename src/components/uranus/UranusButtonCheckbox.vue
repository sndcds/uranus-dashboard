<template>
  <UranusFieldLabel
      :id="id"
      label="-"
      :required="required"
  >
    <label class="button-checkbox-outlined">
      <input
          :id="id"
          type="checkbox"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
      />
      <span class="checkmark">
        <svg
            v-if="modelValue"
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
    </label>
  </UranusFieldLabel>
</template>

<script setup lang="ts">
import UranusFieldLabel from "@/components/uranus/UranusFieldLabel.vue";

const props = defineProps<{
  id: string
  modelValue: boolean
  required?: boolean
  label: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<style lang="scss" scoped>
.button-checkbox-outlined {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--uranus-input-border-color);
  border-radius: var(--uranus-form-field-border-radius);
  cursor: pointer;
  user-select: none;
  background: white;
  transition: all 0.2s ease;

  input {
    display: none;
  }

  .checkmark {
    width: 1.2rem;
    height: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--uranus-input-border-color);
    border-radius: 0.25rem;
    background: #ffffff;
    transition: all 0.2s ease;
  }

  input:checked + .checkmark,
  &:has(input:checked) .checkmark {
    background: var(--uranus-input-border-color);
    border-color: var(--uranus-input-border-color);
    svg {
      stroke: white;
    }
  }

  .label-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: #111827;
  }
}
</style>