<template>
  <Teleport to="body">
    <transition name="uranus-modal-fade">
      <div
        v-if="show"
        class="uranus-modal__overlay"
        @click="handleBackdropClick"
      >
        <div
          class="uranus-modal__content"
          :style="{ maxWidth }"
          @click.stop
        >
          <header class="uranus-modal__header" :class="{ 'uranus-modal__header--plain': !hasHeaderContent }">
            <slot name="header">
              <template v-if="hasHeaderContent">
                <h3 v-if="title" class="uranus-modal__title">{{ title }}</h3>
                <p v-if="description" class="uranus-modal__description">
                  {{ description }}
                </p>
              </template>
            </slot>
            <button
              type="button"
              class="uranus-modal__close"
              aria-label="Close dialog"
              @click="$emit('close')"
            >
              ×
            </button>
          </header>

          <section class="uranus-modal__body">
            <slot />
          </section>

          <footer v-if="$slots.actions" class="uranus-modal__actions">
            <slot name="actions" />
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    title?: string
    description?: string
    maxWidth?: string
    closeOnBackdrop?: boolean
  }>(),
  {
    title: '',
    description: '',
    maxWidth: '500px',
    closeOnBackdrop: true,
  }
)

const emit = defineEmits<{ close: [] }>()

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

const slots = useSlots()

const hasHeaderContent = computed(
  () => !!props.title || !!props.description
)
</script>

<style scoped lang="scss">
.uranus-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.uranus-modal__content {
  width: 100%;
  background: var(--surface-primary, #fff);
  border-radius: 1rem;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
}

.uranus-modal__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border-bottom: 1px solid var(--border-soft);
  position: relative;
}

.uranus-modal__header--plain {
  padding-bottom: 0.75rem;
}

.uranus-modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.uranus-modal__description {
  margin: 0;
  color: var(--muted-text);
  font-size: 0.95rem;
  line-height: 1.4;
}

.uranus-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--muted-text);

  &:hover {
    color: var(--color-text);
  }
}

.uranus-modal__body {
  padding: clamp(1.25rem, 3vw, 1.75rem);
}

.uranus-modal__actions {
  padding: clamp(1rem, 2.5vw, 1.5rem);
  border-top: 1px solid var(--border-soft);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.uranus-modal-fade-enter-active,
.uranus-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.uranus-modal-fade-enter-from,
.uranus-modal-fade-leave-to {
  opacity: 0;
}
</style>
