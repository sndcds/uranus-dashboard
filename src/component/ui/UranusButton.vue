<template>
  <!-- Use router-link if `to` is provided -->
  <component
      :is="to ? 'router-link' : 'button'"
      v-bind="componentProps"
      :class="['uranus-button', `uranus-button--${variant}`, `uranus-button--${size}`]"
      @click="handleClick"
  >
    <span class="content">
      <!-- Loading spinner -->
      <template v-if="loading">
        <span class="spinner"></span>
        <span class="loading-text">{{ loadingText }}</span>
      </template>

      <!-- Icon + slot -->
      <template v-else>
        <span v-if="$slots.icon && iconPosition === 'left'" class="icon">
          <slot name="icon" />
        </span>
        <span class="text"><slot /></span>
        <span v-if="$slots.icon && iconPosition === 'right'" class="icon">
          <slot name="icon" />
        </span>
      </template>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  type: { type: String as () => 'button' | 'submit' | 'reset', default: 'button' },
  variant: { type: String as () => 'primary' | 'secondary' | 'tertiary' | 'cta' | 'danger', default: 'primary' },
  size: { type: String as () => 'small' | 'medium' | 'large', default: 'medium' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Loading...' },
  iconPosition: { type: String as () => 'left' | 'right', default: 'left' }
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

// Props to pass to the inner element
const componentProps = computed(() => {
  if (props.to) return { to: props.to } // router-link
  return { type: props.type, disabled: props.disabled || props.loading } // native button
})

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) emit('click', event)
}
</script>

<style scoped>
.content {
  display: inline-flex;
  align-items: center;   /* vertically centers children */
  justify-content: center;
  gap: 0.25rem;
  line-height: 1;        /* ensures icon aligns with text */
}

.icon {
  display: inline-flex;
  align-items: center;   /* vertical centering inside icon container */
  justify-content: center;
  width: 1em;
  height: 1em;
  flex-shrink: 0;        /* prevent icon from shrinking if text wraps */
}

.spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

.loading-text {
  margin-left: 0.25rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>