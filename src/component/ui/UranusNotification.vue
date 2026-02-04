<!--
  src/component/ui/UranusNotification.vue
-->

<template>
  <div class="uranus-notification" :class="notificationTypeClass">
    <div class="notification-header">
      <div v-if="$slots.icon" class="notification-icon">
        <slot name="icon" />
      </div>
      <div class="notification-title">
        <slot name="title" />
      </div>
    </div>

    <div class="notification-content">
      <slot />
    </div>

    <div v-if="$slots.actions" class="notification-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (v: string) => ['info', 'warning', 'error'].includes(v),
  },
})

const notificationTypeClass = computed(() => {
  return `notification-type-${props.type}`
})
</script>