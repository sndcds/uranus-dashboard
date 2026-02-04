<!-- UranusButton.vue -->
<template>
  <button
      :type="type"
      :class="['uranus-button', `uranus-button--${variant}`]"
      :disabled="disabled || loading"
      @click="handleClick"
  >
    <span v-if="loading">{{ loadingText }}</span>
    <span v-else><slot /></span>
  </button>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  },
  variant: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Loading...' }
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>