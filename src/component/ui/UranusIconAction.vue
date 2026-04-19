<template>
  <component
      :is="componentType"
      v-bind="componentProps"
      class="uranus-action-icon-wrapper"
      :class="{ clickable: isClickable }"
      :title="title"
      :aria-label="title"
      :role="componentType === 'span' ? 'button' : undefined"
      :tabindex="componentType === 'span' ? 0 : undefined"
      @click="handleClick"
      @keydown="handleKeydown"
  >
    <component
        v-if="icon"
        :is="icon"
        class="icon-svg"
        :size="resolvedIconSize"
    />

    <span v-if="label" class="action-label">
      {{ label }}
    </span>

    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  title?: string
  to?: RouteLocationRaw | string
  onClick?: () => void
  icon?: any
  iconSize?: number | string
  label?: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

// --- helpers ---
const isExternal = computed(() => {
  return typeof props.to === 'string' && /^https?:\/\//.test(props.to)
})

const componentType = computed(() => {
  if (!props.to) return 'span'
  return isExternal.value ? 'a' : 'router-link'
})

const componentProps = computed(() => {
  if (!props.to) return {}

  if (isExternal.value) {
    return {
      href: props.to,
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  }

  return {
    to: props.to,
  }
})

// --- UI logic ---
const resolvedIconSize = computed(() => props.iconSize ?? 22)
const isClickable = computed(() => !!props.onClick || !!props.to)

// --- events ---
const handleClick = (event: Event) => {
  if (props.onClick) {
    props.onClick()
    emit('click')

    // prevent router navigation if click is manually handled
    if (props.to && !isExternal.value) {
      event.preventDefault()
    }
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (componentType.value !== 'span') return

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick(event as any)
  }
}
</script>

<style scoped lang="scss">
.uranus-action-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;

  width: auto;
  height: 36px;

  border-color: transparent;
  transition: background 0.2s ease, color 0.2s ease;
  color: var(--uranus-card-color);

  &.clickable {
    cursor: pointer;

    &:hover {
      color: var(--uranus-link-color-hover);
    }
  }

  .icon-svg {
    stroke: currentColor;
    pointer-events: none;
    flex-shrink: 0;
  }

  .action-label {
    font-size: 0.9rem;
    white-space: nowrap;
  }
}
</style>