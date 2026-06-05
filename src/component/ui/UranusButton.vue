<!--
  src/component/ui/UranusButton.vue
-->

<template>
  <!-- Router link version -->
  <router-link
      v-if="to"
      :to="to"
      class="uranus-button"
      :class="buttonClasses"
  >
    <span class="content">
      <template v-if="loading">
        <span class="spinner"></span>
        <span class="loading-text">{{ loadingText }}</span>
      </template>

      <template v-else>
        <span v-if="$slots.icon && iconPosition === 'left'" class="icon">
          <slot name="icon" />
        </span>

        <span class="text">
          <slot />
        </span>

        <span v-if="$slots.icon && iconPosition === 'right'" class="icon">
          <slot name="icon" />
        </span>
      </template>
    </span>
  </router-link>

  <!-- Native button version -->
  <button
      v-else
      :type="type"
      :disabled="disabled || loading"
      class="uranus-button"
      :class="buttonClasses"
      @click="handleClick"
  >
    <span class="content">
      <template v-if="loading">
        <span class="spinner"></span>
        <span class="loading-text">{{ loadingText }}</span>
      </template>

      <template v-else>
        <span v-if="$slots.icon && iconPosition === 'left'" class="icon">
          <slot name="icon" />
        </span>

        <span class="text">
          <slot />
        </span>

        <span v-if="$slots.icon && iconPosition === 'right'" class="icon">
          <slot name="icon" />
        </span>
      </template>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  type: { type: String as () => 'button' | 'submit' | 'reset', default: 'button' },

  variant: {
    type: String as () => 'primary' | 'secondary' | 'tertiary' | 'cta' | 'danger',
    default: 'primary'
  },

  size: {
    type: String as () => 'small' | 'medium' | 'large',
    default: 'medium'
  },

  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Loading...' },

  iconPosition: {
    type: String as () => 'left' | 'right',
    default: 'left'
  }
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const buttonClasses = computed(() => [
  `uranus-button--${props.variant}`,
  `uranus-button--${props.size}`
])

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.uranus-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  text-decoration: none;
  cursor: pointer;
}

.content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  line-height: 1;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
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
  to {
    transform: rotate(360deg);
  }
}
</style>