<template>
  <Teleport to="body">
    <div class="event-info-backdrop" @click.self="emit('close')">
      <section ref="dialog" class="event-info-dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId" @keydown.tab="trapFocus">
        <div class="event-info-dialog-heading"><h2 :id="titleId">{{ t('event_table_info') }}</h2><button type="button" :aria-label="t('event_table_close')" @click="emit('close')"><X :size="20" /></button></div>
        <UranusAdminEventCard :event="event" :grouped="grouped" :can-post-social="canPostSocial" @deleted="emit('deleted', $event)" />
        <p>{{ t('event_table_no_details') }}</p>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { X } from 'lucide-vue-next'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem'
import UranusAdminEventCard from '@/component/event/card/UranusAdminEventCard.vue'
defineProps<{ event: AdminEventListItem; grouped: boolean; canPostSocial: boolean }>()
const emit = defineEmits<{ close: []; deleted: [payload: { eventUuid: string; dateUuid: string | null; deleteSeries: boolean }] }>()
const { t } = useI18n({ useScope: 'global' })
const dialog = ref<HTMLElement | null>(null)
const titleId = useId()
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
function focusable() { return [...(dialog.value?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]') ?? [])] }
function trapFocus(event: KeyboardEvent) {
  const controls = focusable()
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
function onEscape(event: KeyboardEvent) {
  // The reused password confirmation opens above this dialog and owns Escape.
  if (event.key === 'Escape' && !document.querySelector('.uranus-modal__overlay')) emit('close')
}
onMounted(() => {
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  focusable()[0]?.focus()
  window.addEventListener('keydown', onEscape)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEscape)
  document.body.style.overflow = previousOverflow
  previousFocus?.focus()
})
</script>

<style scoped>
.event-info-backdrop { position: fixed; inset: 0; z-index: 900; display: grid; place-items: center; background: #16102588; padding: 16px; }
.event-info-dialog { width: min(560px, 100%); max-height: calc(100dvh - 32px); box-sizing: border-box; overflow: auto; padding: 20px; border: 1px solid var(--uranus-color-6); border-radius: 12px; background: var(--uranus-bg); color: var(--uranus-color); }
.event-info-dialog-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
h2 { font-size: 1rem; margin: 0; }
button { display: grid; place-items: center; width: 36px; height: 36px; cursor: pointer; border: 0; border-radius: 4px; color: inherit; background: var(--uranus-color-8); }
button:focus-visible { outline: 2px solid var(--uranus-focus-color); }
p { font-size: 0.8rem; }
</style>
