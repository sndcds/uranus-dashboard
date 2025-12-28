<!-- UranusButton.vue -->
<template>
  <button
      :type="type"
      :class="['uranus-button', `uranus-button--${variant}`]"
      :disabled="disabled || loading"
      @click="$emit('click', $event)"
  >
    <span v-if="loading">{{ loadingText }}</span>
    <span v-else><slot /></span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary'
  loading?: boolean
  loadingText?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: (event: MouseEvent) => void
}>()

const defaultProps = {
  type: 'button',
  variant: 'primary',
  loading: false,
  loadingText: 'Loading...',
  disabled: false,
}
</script>

<style scoped lang="scss">
.uranus-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease, opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.uranus-button--primary {
  background-color: #2563eb;
  color: #fff;
}

.uranus-button--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.uranus-button--secondary {
  background-color: #f3f4f6;
  color: #111827;
}

.uranus-button--secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>