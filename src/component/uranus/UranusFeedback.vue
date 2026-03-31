<!-- src/component/ui/UranusFeedback.vue -->
<template>
  <transition name="fade">
    <!-- Render only if there is content -->
    <div v-if="hasContent" :class="feedbackClass" role="status">
      <slot />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  type?: 'error' | 'success' | 'warning'
  show?: boolean // optional prop to control visibility
}

const props = defineProps<Props>()
const slots = useSlots()  // <-- must call this!

const feedbackClass = computed(() => [
  'feedback',
  props.type ? `feedback--${props.type}` : 'feedback--error'
])

// Decide whether to render
const hasContent = computed(() => props.show ?? !!(slots.default && slots.default().length))
</script>

<style scoped>
.feedback {
  font-weight: 500;
  line-height: 1.4;
  padding: 1rem;
  border-radius: var(--uranus-tiny-border-radius);
}

.feedback--error {
  background: rgba(var(--uranus-feedback-error-rgb), 0.08);
  color: rgb(var(--uranus-feedback-error-rgb));
}

.feedback--warning {
  background: rgba(var(--uranus-feedback-warning-rgb), 0.08);
  color: rgb(var(--uranus-feedback-warning-rgb));
}

.feedback--success {
  background: rgba(var(--uranus-feedback-success-rgb), 0.08);
  color: rgb(var(--uranus-feedback-success-rgb));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>