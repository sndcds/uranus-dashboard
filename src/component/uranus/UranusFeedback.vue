<!--
  src/component/ui/UranusFeedback.vue

  Usage:
    <UranusFeedback
      v-if="displayErrorFeedback"
      type="error"
      :delaySeconds="2"
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
  delaySeconds?: number

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
  const delay = props.delaySeconds ?? 0

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
  background: var(--uranus-feedback-info-bg);
  border: 1px solid var(--uranus-feedback-info-border-color);
}

.feedback--success {
  background: var(--uranus-feedback-success-bg);
  border: 1px solid var(--uranus-feedback-success-border-color);
}

.feedback--warning {
  background: var(--uranus-feedback-warning-bg);
  border: 1px solid var(--uranus-feedback-warning-border-color);
}

.feedback--error {
  background: var(--uranus-feedback-error-bg);
  border: 1px solid var(--uranus-feedback-error-border-color);
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