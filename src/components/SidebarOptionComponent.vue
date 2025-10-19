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
    border-radius: 14px;
    cursor: pointer;
    color: rgba(15, 23, 42, 0.78);
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: color 0.2s ease, background 0.2s ease, transform 0.15s ease;

    &:hover {
        background: rgba(79, 70, 229, 0.06);
        color: #111827;
        transform: translateX(2px);

    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
        background: rgba(79, 70, 229, 0.08);
    }

    &.active {
        color: #1f2937;
        background: linear-gradient(135deg, rgba(79, 70, 229, 0.14), rgba(14, 165, 233, 0.16));
        box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.12);

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
    background: rgba(79, 70, 229, 0.09);
    color: #4338ca;
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
