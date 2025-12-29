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
