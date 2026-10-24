<template>
  <UranusEventTableHint :text="label" class="event-metadata" :class="[`event-metadata--${field.state}`, `event-metadata--${field.key}`]">
    <component :is="field.key === 'info' ? 'button' : editable ? RouterLink : 'span'"
      class="event-metadata-control" :class="{ 'event-metadata-control--interactive': editable || field.key === 'info' }"
      :to="editable ? eventEditLocation(event, field.tab!, field.field) : undefined"
      :type="field.key === 'info' ? 'button' : undefined"
      :role="!editable && field.key !== 'info' ? 'group' : undefined"
      :tabindex="!editable && field.key !== 'info' ? 0 : undefined"
      :aria-label="label" @click.capture="editable && confirmPastEventEdit(event, $event)" @click="field.key === 'info' && emit('info')">
      <component :is="eventTableIcons[field.key]" v-if="field.key !== 'date' && field.key !== 'categories'" :size="15" aria-hidden="true" />
      <UranusEventCategoryIndicators v-if="field.key === 'categories'" :categories="event.categories" />
      <span v-else-if="field.value" class="event-metadata-value">{{ field.value }}</span>
      <TriangleAlert v-if="field.state === 'missing' || field.state === 'incomplete'" :size="11" aria-hidden="true" class="event-metadata-warning" />
      <span class="event-metadata-mobile-label" aria-hidden="true">{{ t(`event_table_${field.key}`) }}</span>
    </component>
  </UranusEventTableHint>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { TriangleAlert } from 'lucide-vue-next'
import { eventEditLocation, type EventTableField } from '@/domain/event/adminEventTable'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem'
import { eventCategoryLabelKey } from '@/domain/event/eventCategory'
import UranusEventTableHint from './UranusEventTableHint.vue'
import UranusEventCategoryIndicators from './UranusEventCategoryIndicators.vue'
import { eventTableIcons } from './UranusEventTableIcons'
import { useConfirmPastEventEdit } from '@/composable/useConfirmPastEventEdit'
const props = defineProps<{ field: EventTableField; event: AdminEventListItem }>()
const emit = defineEmits<{ info: [] }>()
const { t } = useI18n({ useScope: 'global' })
const confirmPastEventEdit = useConfirmPastEventEdit()
const editable = computed(() => props.event.canEditEvent && props.field.tab !== null)
const label = computed(() => [t(`event_table_${props.field.key}`), props.field.value,
  props.field.key === 'categories' ? props.event.categories?.map(id => { const key = eventCategoryLabelKey(id); return key ? t(key) : t('event_table_category_unknown', { id }) }).join(', ') : null,
  t(`event_table_${props.field.state}`), props.field.detail, editable.value ? t('event_table_edit_hint') : null].filter(Boolean).join(' · '))
</script>

<style scoped>
.event-metadata { border-radius: 4px; min-width: 0; }
.event-metadata-control {
  display: flex; position: relative; align-items: center; justify-content: center;
  gap: 4px; min-height: 34px; width: 100%; padding: 3px; border: 0; border-radius: 4px;
  background: transparent; color: inherit; font: inherit; text-decoration: none; white-space: nowrap;
}
.event-metadata-control--interactive { cursor: pointer; }
.event-metadata-control--interactive:hover { background: var(--uranus-color-8); }
.event-metadata-control:focus-visible { outline: 2px solid var(--uranus-focus-color); outline-offset: -2px; }
.event-metadata--date .event-metadata-control { justify-content: flex-start; font-variant-numeric: tabular-nums; }
.event-metadata--not_applicable { color: var(--uranus-color-3); }
.event-metadata--missing { background: color-mix(in srgb, var(--uranus-error-color, #b91c3c) 13%, var(--uranus-bg)); color: var(--event-field-warning-color); }
.event-metadata--incomplete { background: color-mix(in srgb, #d07816 16%, var(--uranus-bg)); }
.event-metadata-warning { flex: none; }
.event-metadata-mobile-label { display: none; }
.event-metadata-value { overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 600px) {
  .event-metadata-control { flex-wrap: wrap; min-height: 44px; padding: 7px 4px; }
  .event-metadata-mobile-label { display: block; width: 100%; min-width: 0; max-width: 100%; font-size: 0.65rem; white-space: normal; overflow-wrap: anywhere; hyphens: auto; line-height: 1.25; }
  .event-metadata--date .event-metadata-mobile-label { display: none; }
}
</style>
