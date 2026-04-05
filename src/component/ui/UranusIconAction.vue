<template>
  <component
      :is="to ? 'router-link' : 'span'"
      :to="to"
      class="uranus-action-icon-wrapper"
      :class="{ clickable: isClickable }"
      :title="title"
      @click="handleClick"
  >
    <component
        v-if="icon"
        :is="icon"
        class="icon-svg"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps<{
  title?: string
  to?: string
  onClick?: () => void
  icon?: any
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

// Hover/click styles for both `to` and `onClick`
const isClickable = computed(() => !!props.onClick || !!props.to)

const handleClick = (event: Event) => {
  if (props.onClick) {
    props.onClick()
    emit('click')
    // Only prevent navigation if both to + onClick
    if (props.to) event.preventDefault()
  }
}
</script>

<style scoped lang="scss">
.uranus-action-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-color: transparent;
  padding: 2px;
  transition: background 0.2s ease, color 0.2s ease;
  color: var(--uranus-card-color);

  &.clickable {
    cursor: pointer;

    &:hover {
      color: var(--uranus-link-color-hover);
    }
  }

  .icon-svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    pointer-events: none;
  }
}
</style>