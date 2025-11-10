<template>
  <div class="uranus-notification" :class="notificationTypeClass">
    <div class="notification-title">
      <h3>{{ title }}</h3>
    </div>
    <div class="notification-content">
      <p class="notification-text" v-html="text"></p>
    </div>
    <div class="notification-actions">
      <a
          v-if="buttonText && buttonLink"
          :href="buttonLink"
          class="notification-button"
      >
        {{ buttonText }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info', // info | warning | error
    validator: (value: string) => ['info', 'warning', 'error'].includes(value),
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    default: null,
  },
  buttonLink: {
    type: String,
    default: null,
  },
})

const notificationTypeClass = computed(() => {
  switch (props.type) {
    case 'warning':
      return 'notification-type-warning'
    case 'error':
      return 'notification-type-error'
    default:
      return 'notification-type-info'
  }
})
</script>

<style scoped lang="scss">
.uranus-notification {
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: var(--uranus-card-border-radius);
  margin-bottom: 1rem;
  align-items: flex-start;
  gap: 1rem;
  font-family: sans-serif;
  border: 2px solid transparent; /* default border */
  color: var(--uranus-card-color);
  background: var(--uranus-card-background-color);
  max-width: var(--uranus-dashboard-content-width);
  overflow: hidden;

  .notification-title {
    width: 100%;
    padding: var(--uranus-default-text-padding);
  }

  .notification-content {
    padding: var(--uranus-default-text-padding);
    p {
      font-size: 1em;
    }
  }

  .notification-actions {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    padding: var(--uranus-default-text-padding);
  }

  /* Border colors */
  &.notification-type-info {
    border-color: var(--uranus-notify-info-color);
    .notification-title {
      background: var(--uranus-notify-info-color);
    }
  }
  &.notification-type-warning {
    border-color: var(--uranus-notify-warning-color);
    .notification-title {
      background: var(--uranus-notify-warning-color);
    }
  }
  &.notification-type-error {
    border-color: var(--uranus-notify-error-color);
    .notification-title {
      background: var(--uranus-notify-error-color);
    }
  }

  .notification-title {
    margin: 0 0 0.25rem;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .notification-text {
    margin: 0 0 0.5rem;
    font-size: 0.95rem;
  }

  .notification-button {
    display: inline-block;
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    background-color: #f0f0f0; /* neutral button */
    color: #333;
    text-decoration: none;
    font-size: 0.9rem;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #e0e0e0;
    }
  }
}
</style>