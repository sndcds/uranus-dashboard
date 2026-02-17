<!--
  src/component/ui/UranusCheckboxButton.vue
-->
<template>
  <UranusFieldLabel
      :id="id"
      label="&nbsp;"
      :required="required"
  >
    <label class="button-checkbox-outlined">
      <input
          :id="id"
          type="checkbox"
          :checked="modelValue"
          @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
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
import UranusFieldLabel from "@/component/ui/UranusFieldLabel.vue";

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
  height: var(--uranus-input-height);
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 0px solid var(--uranus-input-border-color);
  border-radius: 0;
  cursor: pointer;
  user-select: none;
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
    outline: 2px solid var(--uranus-focus-color, #2684ff);
    outline-offset: 0px;
  }

  .checkmark {
    box-sizing: content-box;
    flex-shrink: 0;
    flex-grow: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--uranus-input-border-color);
    border-radius: 0;
    transition: all 0.2s ease;
  }

  input:checked + .checkmark,
  &:has(input:checked) .checkmark {
    background: var(--uranus-ia-inline-color);
    border-color: var(--uranus-ia-inline-color);
    svg {
      width: 18px;
      height: 18px;
      stroke: white;
    }
  }

  .label-text {
    font-size: 0.95rem;
    font-weight: 500;
  }
}
</style>