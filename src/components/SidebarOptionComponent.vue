<template>
    <div
        class="sidebar-option"
        :class="{ active, 'has-icon': !!option.icon }"
        role="button"
        tabindex="0"
        @click="handleClick"
        @keydown.enter.prevent="handleClick"
        @keydown.space.prevent="handleClick"
    >
        <span v-if="option.icon" class="icon">{{ option.icon }}</span>
        <span class="label">{{ option.label }}</span>
    </div>
</template>


<script setup lang="ts">
import type { SidebarOption } from '@/types/types'

const props = defineProps<{
  option: SidebarOption
  active?: boolean
}>()

const emit = defineEmits<{ (e: 'change', id: string): void }>()

function handleClick() {
  emit('change', props.option.id)
}
</script>


<style scoped lang="scss">
.sidebar-option {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.1rem 0.75rem 1.5rem;
    cursor: pointer;
    color: var(--muted-text);
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: all 0.2s ease;

    &:hover {
      background: var(--uranus-bg-color-d1);
      color: var(--color-text);
      // transform: translateX(2px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
    }

    &.active {
      // color: var(--uranus-menu-active-color);
      // background: var(--uranus-menu-active-bg);
      border-left: 8px solid var(--uranus-ia-color);
    }

    &.has-icon .label {
        padding-left: 0.1rem;
    }
}

.icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 12px;
    background: var(--accent-muted);
    color: var(--accent-primary);
    font-size: 0.95rem;
    box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.12);
}

.label {
    font-size: 0.98rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

</style>
