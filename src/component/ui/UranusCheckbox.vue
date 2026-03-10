<!-- src/component/ui/UranusCheckbox.vue -->
<template>
    <div class="uranus-checkbox-outlined" @click="toggle">
      <!-- Hidden checkbox for accessibility -->
      <input
          type="checkbox"
          :id="id"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
      />

      <!-- Visible checkmark -->
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

      <!-- Label text -->
      <span class="label-text">{{ label }}</span>
    </div>

</template>

<script setup lang="ts">

const props = defineProps<{
  id: string
  modelValue: boolean
  required?: boolean
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggle = (e: MouseEvent) => {
  // Avoid double toggle if input already fired change
  if ((e.target as HTMLElement).tagName !== 'INPUT') {
    emit('update:modelValue', !props.modelValue)
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
    outline: 2px solid var(--uranus-focus-color, #2684ff);
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
    font-size: 0.95rem;
    font-weight: 500;
  }
}
</style>