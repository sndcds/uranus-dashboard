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
          <div class="uranus-modal__header" :class="{ 'uranus-modal__header--plain': !hasHeaderContent }">
            <slot name="header">
              <template v-if="hasHeaderContent">
                <h1 v-if="title" class="uranus-modal__title">{{ title }}</h1>
              </template>
            </slot>
            <button
              type="button"
              class="uranus-modal__close"
              aria-label="Close dialog"
              @click="$emit('close')"
            >
              <X />
            </button>
          </div>

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
import { computed, useSlots, onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    show: boolean
    title?: string
    maxWidth?: string
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
  }>(),
  {
    title: '',
    maxWidth: '500px',
    closeOnBackdrop: false,
    closeOnEscape: true,
  }
)

const emit = defineEmits<{ close: [] }>()

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (props.closeOnEscape && e.key === 'Escape') {
    emit('close')
  }
}

const hasHeaderContent = computed(
  () => !!props.title
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.uranus-modal__overlay {
  position: fixed;
  inset: 0;
  background: var(--uranus-backdrop-color);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.uranus-modal__content {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  background: var(--uranus-bg);
  border-radius: var(--uranus-card-border-radius);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
}

.uranus-modal__header {
  display: flex;
  flex-direction: column;
  // gap: 0.5rem;
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border-bottom: 1px solid var(--uranus-color-7);
  position: relative;
}

.uranus-modal__header--plain {
  padding-bottom: 0.75rem;
}

.uranus-modal__title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.uranus-modal__body {
  padding: clamp(1.25rem, 3vw, 1.75rem);
}

.uranus-modal-fade-enter-active,
.uranus-modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.uranus-modal-fade-enter-from,
.uranus-modal-fade-leave-to {
  opacity: 0;
}

.uranus-modal__close {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 1.8rem;
  height: 1.8rem;
  top: 0.75rem;
  right: 0.75rem;
  border: none;
  padding: 6px;
  border-radius: 999px;

  background: transparent;
  line-height: 1;
  cursor: pointer;
  color: var(--uranus-color-3);
  transition: all 0.2s ease;

  &:hover {
    color: var(--uranus-color);
    background: var(--uranus-color-8);
  }
}

.uranus-modal__close:hover svg {
  transform: scale(1.2);
}
</style>
