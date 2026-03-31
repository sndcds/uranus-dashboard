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

    <div v-if="$slots.actions || actionLabel" class="notification-actions">
      <!-- Custom slot wins -->
      <slot name="actions">
        <!-- Fallback: built-in button -->
        <UranusButton
            v-if="actionLabel && actionTo"
            :to="actionTo"
            size="small"
        >
          {{ actionLabel }}
        </UranusButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusButton from "@/component/ui/UranusButton.vue";

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (v: string) => ['info', 'warning', 'error'].includes(v),
  },

  actionLabel: String,
  actionTo: String,
})

const notificationTypeClass = computed(() => {
  return `notification-type-${props.type}`
})
</script>