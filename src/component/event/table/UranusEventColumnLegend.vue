<template>
  <details class="event-column-legend">
    <summary><Info :size="16" aria-hidden="true" /> {{ t('event_table_legend') }}</summary>
    <div class="event-column-legend-body">
      <p>{{ t('event_table_legend_columns') }}</p>
      <ol class="event-column-legend-columns">
        <li v-for="key in eventTableColumns" :key="key"><component :is="eventTableIcons[key]" :size="16" aria-hidden="true" /><span>{{ t(`event_table_${key}`) }}</span></li>
      </ol>
      <p>{{ t('event_table_date_index', { index: 2, total: 3 }) }}</p>
      <p>{{ t('event_table_release_legend') }}</p>
      <div class="event-column-legend-statuses"><span v-for="status in eventReleaseStatuses" :key="status"><UranusEventReleaseStatus :status="status" /> {{ t(`event_release_${status}`) }}</span></div>
      <p>{{ t('event_table_category_legend') }}</p>
      <p>{{ t('event_table_field_legend') }}</p>
      <div class="event-column-legend-states"><span v-for="state in states" :key="state" :class="`event-legend-state--${state}`">{{ t(`event_table_${state}`) }}</span></div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { eventTableColumns, type FieldState } from '@/domain/event/adminEventTable'
import { eventReleaseStatuses } from '@/domain/event/eventReleaseStatus'
import { eventTableIcons } from './UranusEventTableIcons'
import UranusEventReleaseStatus from './UranusEventReleaseStatus.vue'
const { t } = useI18n({ useScope: 'global' })
const states: FieldState[] = ['present', 'missing', 'incomplete', 'not_applicable', 'unknown']
</script>

<style scoped>
.event-column-legend { font-size: 0.8rem; margin-block: 0.75rem; }
summary { display: flex; align-items: center; gap: 6px; cursor: pointer; width: fit-content; padding: 6px 0; }
summary:focus-visible { outline: 2px solid var(--uranus-focus-color); outline-offset: 3px; }
.event-column-legend-body { border: 1px solid var(--uranus-color-7); border-radius: 8px; padding: 1rem; margin-top: 6px; background: var(--uranus-color-9); }
.event-column-legend-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); list-style: none; padding: 0; gap: 10px; }
li, .event-column-legend-statuses > span { display: flex; align-items: center; gap: 8px; }
.event-column-legend-statuses, .event-column-legend-states { display: flex; flex-wrap: wrap; gap: 12px; }
.event-column-legend-states > span { padding: 4px 8px; border-radius: 4px; }
.event-legend-state--missing { color: var(--event-field-warning-color); background: color-mix(in srgb, var(--uranus-error-color) 13%, var(--uranus-bg)); }
.event-legend-state--incomplete { background: color-mix(in srgb, #d07816 16%, var(--uranus-bg)); }
.event-legend-state--not_applicable { color: var(--uranus-color-3); }
</style>
