<template>
  <div v-if="show" class="uranus-notification" :class="typeClass">
    <div class="uranus-notification__content">
      <slot />
    </div>

    <div v-if="actionLabel && actionTo" class="uranus-notification__action">
      <RouterLink :to="actionTo" class="uranus-notification__button">
        {{ actionLabel }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type NotificationType = 'info' | 'warning' | 'error' | 'success'

const props = defineProps<{
  show?: boolean
  type?: NotificationType
  actionLabel?: string
  actionTo?: string
}>()

const typeClass = computed(() => {
  return `uranus-notification--${props.type ?? 'info'}`
})
</script>

<style scoped>
.uranus-notification {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  margin-bottom: 16px;
}

.uranus-notification__content {
  font-size: 1.15rem;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
}

.uranus-notification__action {
  flex-shrink: 0;
  padding: 1rem;
  margin-left: auto; /* optional safety */
}


.uranus-notification--info {
  background: var(--uranus-feedback-info-bg);
  border-color: var(--uranus-feedback-info-border-color);
}

.uranus-notification--success {
  background: var(--uranus-feedback-success-bg);
  border-color: var(--uranus-feedback-success-border-color);
}

.uranus-notification--warning {
  background: var(--uranus-feedback-warning-bg);
  border-color: var(--uranus-feedback-warning-border-color);
}

.uranus-notification--error {
  background: var(--uranus-feedback-error-bg);
  border-color: var(--uranus-feedback-error-border-color);
}


.uranus-notification__button {
  text-decoration: none;
  font-weight: 500;
  padding: 6px 10px;
  color: var(--uranus-color);
  border: 2px solid var(--uranus-color);
  border-radius: 999px;
}
</style>