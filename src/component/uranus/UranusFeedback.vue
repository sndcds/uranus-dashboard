<!--
  src/component/ui/UranusFeedback.vue

  Usage:
    <UranusFeedback v-if="displayErrorFeedback" type="error">
      {{ displayErrorFeedback }}
    </UranusFeedback>
-->

<template>
  <transition name="fade">
    <div :class="feedbackClass" role="status">
      <slot />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'notice' | 'success' | 'warning' | 'error'
}

const props = defineProps<Props>()

const feedbackClass = computed(() => [
  'feedback',
  props.type ? `feedback--${props.type}` : 'feedback--notice'
])
</script>

<style scoped>
.feedback {
  font-weight: 500;
  line-height: 1.4;
  padding: 1rem;
  border-radius: var(--uranus-tiny-border-radius);
}

/* Variants */
.feedback--notice {
  background: rgba(var(--uranus-notice-color-rgb), 0.08);
  color: rgb(var(--uranus-notice-color-rgb));
}

.feedback--success {
  background: rgba(var(--uranus-feedback-success-rgb), 0.08);
  color: rgb(var(--uranus-feedback-success-rgb));
}

.feedback--warning {
  background: rgba(var(--uranus-feedback-warning-rgb), 0.08);
  color: rgb(var(--uranus-feedback-warning-rgb));
}

.feedback--error {
  background: rgba(var(--uranus-error-color-rgb), 0.08);
  color: rgb(var(--uranus-error-color-rgb));
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>