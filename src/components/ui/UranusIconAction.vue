<!-- UranusIconAction.vue -->
<template>
  <component
      :is="to ? 'router-link' : 'span'"
      :to="to"
      class="uranus-action-icon-wrapper"
      :class="modeClass"
      :title="title"
      @click="handleClick"
  >
    <component
        v-if="IconComponent"
        :is="IconComponent"
        class="icon-svg"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Import SVGs as Vue components
import EditIcon from '@/assets/icons/edit.svg'
import DeleteIcon from '@/assets/icons/delete.svg'
import AddIcon from '@/assets/icons/add.svg'
import OrganizationIcon from '@/assets/icons/organization.svg'

const props = defineProps<{
  title?: string
  to?: string
  onClick?: () => void
  mode?: 'edit' | 'delete' | 'add' | 'organization'
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

// Map modes to imported SVG components
const IconComponent = computed(() => {
  switch (props.mode) {
    case 'delete': return DeleteIcon
    case 'add': return AddIcon
    case 'organization': return OrganizationIcon
    case 'edit':
    default: return EditIcon
  }
})

const modeClass = computed(() => ({
  delete: props.mode === 'delete',
  add: props.mode === 'add',
  edit: props.mode === 'edit',
  organization: props.mode === 'organization',
  clickable: !!props.onClick
}))
</script>

<style scoped lang="scss">
.uranus-action-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
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

  &.organization {
    color: var(--uranus-card-color);
    &:hover {
      color: var(--accent-secondary, #10b981);
      background-color: rgba(16, 185, 129, 0.1);
    }
  }

  .icon-svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
}
</style>