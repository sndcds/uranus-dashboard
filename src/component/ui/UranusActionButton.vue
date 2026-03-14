<template>
  <button
      :type="type"
      :class="['uranus-button', `uranus-button--${variant}`]"
      :disabled="disabled || loading"
      @click="handleClick"
  >
    <span class="content">
      <!-- Show loading text if loading -->
      <span v-if="loading" class="loading-text">{{ loadingText }}</span>

      <!-- Icon + slot text -->
      <span v-else class="inner" :class="{ 'with-icon': icon }">
        <component v-if="icon" :is="icon" class="icon" />
        <span><slot /></span>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'


const props = defineProps({
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  },
  variant: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Loading...' },
  icon: { type: Object, default: null }, // pass a Lucide component
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) emit('click', event)
}
</script>

<style scoped>
.uranus-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.uranus-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.inner.with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.icon {
  width: 1em;
  height: 1em;
}
</style>