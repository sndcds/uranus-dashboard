<template>
  <span class="event-hint" @pointerenter="open" @pointerleave="visible = false" @focusin="open" @focusout="visible = false" @keydown.esc="visible = false">
    <slot />
    <Teleport to="body">
      <span v-if="visible" role="tooltip" class="event-table-tooltip" :style="position">{{ text }}</span>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { activeEventTableHint } from './eventTableHint'
defineProps<{ text: string }>()
const hintId = Symbol()
const visible = computed({
  get: () => activeEventTableHint.value === hintId,
  set: value => {
    if (value) activeEventTableHint.value = hintId
    else if (activeEventTableHint.value === hintId) activeEventTableHint.value = null
  },
})
const position = ref<Record<string, string>>({})
function open(event: Event) {
  const target = event.currentTarget as HTMLElement
  if (event.type === 'focusin' && (event.target as HTMLElement).closest('.event-hint') !== target) return
  const box = target.getBoundingClientRect()
  const width = Math.min(320, window.innerWidth - 24)
  position.value = {
    width: `${width}px`,
    left: `${Math.max(12, Math.min(box.left + box.width / 2 - width / 2, window.innerWidth - width - 12))}px`,
    ...(box.top > 160 ? { bottom: `${window.innerHeight - box.top + 8}px` } : { top: `${box.bottom + 8}px` }),
  }
  visible.value = true
}
function close() { visible.value = false }
watch(visible, isOpen => {
  if (isOpen) {
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
  } else cleanup()
})
function cleanup() {
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
}
onBeforeUnmount(() => { close(); cleanup() })
</script>

<style scoped>
.event-hint { display: inline-flex; min-width: 0; }
.event-table-tooltip {
  position: fixed;
  z-index: 1500;
  box-sizing: border-box;
  pointer-events: none;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--uranus-color-6);
  border-radius: var(--uranus-tiny-border-radius, 6px);
  background: var(--uranus-color);
  color: var(--uranus-bg);
  box-shadow: 0 4px 16px #0002;
  font: 0.8rem/1.5 var(--uranus-font-ui);
  white-space: pre-line;
  overflow-wrap: anywhere;
}
</style>
