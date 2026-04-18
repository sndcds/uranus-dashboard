<!--
  src/component/ui/UranusIconAction.vue
-->

<template>
  <component
      :is="to ? 'router-link' : 'span'"
      v-bind="to ? { to } : {}"
      class="uranus-action-icon-wrapper"
      :class="{ clickable: isClickable }"
      :title="title"
      :aria-label="title"
      :role="to ? undefined : 'button'"
      :tabindex="to ? undefined : 0"
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
  to?: RouteLocationRaw
  onClick?: () => void
  icon?: any
  iconSize?: number | string
  label?: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const resolvedIconSize = computed(() => props.iconSize ?? 22)
const isClickable = computed(() => !!props.onClick || !!props.to)

const handleClick = (event: Event) => {
  if (props.onClick) {
    props.onClick()
    emit('click')

    if (props.to) {
      event.preventDefault()
    }
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.to) return

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