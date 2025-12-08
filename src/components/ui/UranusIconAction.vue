<template>
  <component
      :is="to ? 'router-link' : 'span'"
      :to="to"
      class="uranus-action-icon-wrapper"
      :class="modeClass"
      :title="title"
      @click="handleClick"
  >
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        :class="`${mode}-icon`"
    >
      <path :d="iconPath" />
    </svg>
    <slot />
  </component>
</template>

<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
  title?: string
  to?: string
  onClick?: () => void
  mode?: 'edit' | 'delete' | 'add'
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const handleClick = () => {
  if (props.onClick) {
    props.onClick()
    emit('click')
  }
}

const iconPath = computed(() => {
  switch (props.mode) {
    case 'delete':
      return 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'
    case 'add':
      return 'M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z'
    case 'edit':
    default:
      return 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 0 0 0-1.42l-2.34-2.34a1.004 1.004 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z'
  }
})

const modeClass = computed(() => {
  return {
    delete: props.mode === 'delete',
    add: props.mode === 'add',
    edit: props.mode === 'edit',
    clickable: !!props.onClick
  }
})
</script>

<style scoped lang="scss">
.uranus-action-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 4px;
  transition: background 0.2s ease;

  &.clickable {
    cursor: pointer;
  }

  &.edit {
    color: var(--uranus-card-color);
    &:hover {
      color: var(--accent-primary, #2563eb);
      background-color: rgba(37, 99, 235, 0.1);
    }
  }

  &.delete {
    color: var(--uranus-card-color);
    &:hover {
      color: var(--danger, #b91c1c);
      background-color: rgba(185, 28, 28, 0.1);
    }
  }

  &.add {
    color: var(--uranus-card-color);
    &:hover {
      color: var(--warning, #f59e0b);
      background-color: rgba(245, 158, 11, 0.1);
    }
  }

  svg {
    display: block;
    width: 16px;
    height: 16px;
  }
}
</style>