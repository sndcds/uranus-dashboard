<!--
  src/component/ui/UranusAccordion.vue
-->

<template>
  <div class="accordion">
    <div class="accordion-header" @click="isOpen = !isOpen">
      <span class="accordion-icon">
        <span class="vertical" :class="{ hidden: isOpen }"></span>
        <span class="horizontal" :class="{ shifted: isOpen }"></span>
      </span>
      <span class="accordion-title">
        <slot name="title" />
      </span>
    </div>

    <transition name="accordion-body">
      <div v-if="isOpen" class="accordion-body">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue'

const props = defineProps<{ modelValue?: boolean }>()
const isOpen = ref(props.modelValue ?? false)

// Sync with v-model if needed
watch(isOpen, val => {
  if (props.modelValue !== undefined) props.modelValue = val
})
</script>

<style scoped lang="scss">
.accordion {
  border: 0 solid #ccc;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  cursor: pointer;
  font-size: 1rem;
}

.accordion-icon {
  display: inline-flex;
  width: 12px;
  height: 12px;
  position: relative;
  margin-right: 8px;
}

.accordion-icon .horizontal,
.accordion-icon .vertical {
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: var(--uranus-color-2);
  transition: all 0.3s ease;
}

.accordion-icon .horizontal {
  width: 100%;
  height: 2px;
  transform: translate(-50%, -50%);
}

.accordion-icon .vertical {
  width: 2px;
  height: 100%;
  transform: translate(-50%, -50%);
}

/* Vertical fades out */
.accordion-icon .vertical.hidden {
  opacity: 0;
  transform: translate(-50%, -50%) scaleY(0);
}

/* Horizontal shifts slightly down when open to mimic minus */
.accordion-icon .horizontal.shifted {
  transform: translate(-50%, -25%);
}

.accordion-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
}

.accordion-body {
  padding-left: 1.4rem;
  border-bottom: 0 solid var(--uranus-input-border-color);
  transition: all 0.3s ease;
}

/* Accordion body smooth fold */
.accordion-body-enter-from,
.accordion-body-leave-to {
  max-height: 0;
  opacity: 0;
}

.accordion-body-enter-to,
.accordion-body-leave-from {
  max-height: 500px; /* sufficiently large for content */
  opacity: 1;
}

.accordion-body-enter-active,
.accordion-body-leave-active {
  transition: max-height 0.6s ease, opacity 0.4s ease, padding 0.4s ease;
}

</style>