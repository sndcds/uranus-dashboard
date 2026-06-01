<!--
  src/component/ui/UranusFeedback.vue

  Usage:
    <UranusFeedback
      v-if="displayErrorFeedback"
      type="error"
      :deleteSeconds="2"
      :autoHideSeconds="5"
    >
      {{ displayErrorFeedback }}
    </UranusFeedback>
-->

<template>
  <transition name="fade">
    <div v-if="isVisible" :class="feedbackClass" role="status">
      <slot />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  type?: 'notice' | 'success' | 'warning' | 'error'

  /**
   * Delay before the feedback becomes visible (in seconds)
   */
  deleteSeconds?: number

  /**
   * Optional auto-hide after showing (in seconds)
   */
  autoHideSeconds?: number
}

const props = defineProps<Props>()

const isVisible = ref(false)

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

const feedbackClass = computed(() => [
  'feedback',
  props.type ? `feedback--${props.type}` : 'feedback--notice'
])

onMounted(() => {
  const delay = props.deleteSeconds ?? 0

  showTimer = setTimeout(() => {
    isVisible.value = true

    if (props.autoHideSeconds) {
      hideTimer = setTimeout(() => {
        isVisible.value = false
      }, props.autoHideSeconds * 1000)
    }
  }, delay * 1000)
})

onBeforeUnmount(() => {
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
})
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