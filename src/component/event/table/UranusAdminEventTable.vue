<template>
  <section class="admin-event-table" :aria-label="t('event_table_list')" :aria-busy="loading">
    <div class="admin-event-table-toolbar">
      <slot name="actions" />
      <label class="admin-event-search"><Search :size="17" aria-hidden="true" /><input v-model="search" type="search" :aria-label="t('event_table_search')" :placeholder="t('event_table_search')" /></label>
      <select v-model="status" :aria-label="t('event_table_status_filter')">
        <option value="">{{ t('event_table_all_statuses') }}</option>
        <option v-for="key in statusOptions" :key="key" :value="key">{{ isEventReleaseStatus(key) ? t(`event_release_${key}`) : key }}</option>
      </select>
      <select v-model="sort" :aria-label="t('event_table_sort')"><option value="ascending">{{ t('event_table_ascending') }}</option><option value="descending">{{ t('event_table_descending') }}</option></select>
    </div>
    <div class="admin-event-table-controls">
    <details class="admin-event-missing-filter"><summary><Filter :size="15" aria-hidden="true" />{{ t('event_table_missing_filter') }}<span v-if="missing.length"> ({{ missing.length }})</span></summary>
      <fieldset><legend>{{ t('event_table_missing_filter') }}</legend><label v-for="field in missingEventFields" :key="field"><input v-model="missing" type="checkbox" :value="field" />{{ t(`event_table_${field}`) }}</label></fieldset>
      <p>{{ t('event_table_filter_help') }}</p>
    </details>
    <UranusEventColumnLegend />
    </div>
    <div v-if="!loading" class="admin-event-table-scroll" tabindex="0" :aria-label="t('event_table_list')">
      <ul v-if="pageEvents.length" class="admin-event-table-rows"><UranusAdminEventTableRow v-for="event in pageEvents" :key="`${event.uuid}-${event.dateUuid ?? 'undated'}`" :event="event" @info="selected = $event" /></ul>
      <p v-else class="admin-event-table-empty" role="status">{{ t('event_table_empty') }}</p>
    </div>
    <nav v-if="!loading && filtered.length" class="admin-event-pagination" :aria-label="t('event_table_pagination')">
      <button type="button" :disabled="page === 1" :aria-label="t('event_table_previous')" @click="page--"><ChevronLeft :size="18" /></button>
      <span aria-live="polite">{{ t('event_table_page', { page, total: pageCount, count: filtered.length }) }}</span>
      <button type="button" :disabled="page === pageCount" :aria-label="t('event_table_next')" @click="page++"><ChevronRight :size="18" /></button>
    </nav>
    <UranusEventInfoDialog v-if="selected" :event="selected" :grouped="grouped" :can-post-social="canPostSocialOrgs.includes(selected.orgUuid)" @close="selected = null" @deleted="onDeleted" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem'
import { filterAdminEvents, missingEventFields, type MissingEventField } from '@/domain/event/adminEventTable'
import { eventReleaseStatuses, isEventReleaseStatus } from '@/domain/event/eventReleaseStatus'
import UranusAdminEventTableRow from './UranusAdminEventTableRow.vue'
import UranusEventColumnLegend from './UranusEventColumnLegend.vue'
import UranusEventInfoDialog from './UranusEventInfoDialog.vue'
const props = withDefaults(defineProps<{ events: AdminEventListItem[]; grouped: boolean; loading?: boolean; canPostSocialOrgs?: string[]; pageSize?: number }>(), { loading: false, canPostSocialOrgs: () => [], pageSize: 50 })
const emit = defineEmits<{ deleted: [payload: { eventUuid: string; dateUuid: string | null; deleteSeries: boolean }] }>()
const { t } = useI18n({ useScope: 'global' })
const search = ref('')
const status = ref('')
const sort = ref('ascending')
const missing = ref<MissingEventField[]>([])
const page = ref(1)
const selected = ref<AdminEventListItem | null>(null)
const statusOptions = computed(() => [...new Set([...eventReleaseStatuses, ...props.events.map(event => event.releaseStatus).filter((value): value is string => !!value)])])
const filtered = computed(() => filterAdminEvents(props.events, { search: search.value, status: status.value, missing: missing.value, grouped: props.grouped, descending: sort.value === 'descending' }))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.pageSize)))
const pageEvents = computed(() => filtered.value.slice((page.value - 1) * props.pageSize, page.value * props.pageSize))
watch([search, status, sort, missing, () => props.grouped], () => { page.value = 1 }, { deep: true })
watch(pageCount, count => { page.value = Math.min(page.value, count) })
function onDeleted(payload: { eventUuid: string; dateUuid: string | null; deleteSeries: boolean }) {
  selected.value = null
  emit('deleted', payload)
}
</script>

<style scoped lang="scss">
.admin-event-table { --event-field-warning-color: color-mix(in srgb, var(--uranus-error-color) 65%, var(--uranus-color)); min-width: 0; width: 100%; --event-metadata-columns: minmax(145px, 1.8fr) minmax(48px, .8fr) minmax(42px, .7fr) repeat(3, minmax(30px, .5fr)) minmax(45px, .75fr) minmax(68px, 1fr) repeat(3, minmax(32px, .55fr)) repeat(2, minmax(42px, .7fr)) repeat(4, minmax(34px, .6fr)); }
.admin-event-table-toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.admin-event-search { display: flex; flex: 1; min-width: 180px; align-items: center; gap: 8px; border: 1px solid var(--uranus-input-border-color); background: var(--uranus-input-bg); padding: 0 10px; border-radius: 6px; }
input[type=search] { min-width: 0; width: 100%; padding: 9px 0; background: transparent; color: inherit; border: 0; font: inherit; font-size: 0.85rem; }
select { width: auto; min-width: 0; max-width: 100%; padding: 8px; color: inherit; background: var(--uranus-input-bg); border: 1px solid var(--uranus-input-border-color); border-radius: 6px; font: inherit; font-size: 0.8rem; }
.admin-event-table-controls { display: flex; flex-wrap: wrap; align-items: start; gap: 16px; margin-block: 8px; }
.admin-event-table-controls :deep(details[open]) { flex-basis: 100%; }
.admin-event-table-controls :deep(.event-column-legend) { margin-block: 0; }
.admin-event-missing-filter { display: inline-block; font-size: 0.8rem; }
summary { display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 5px 0; }
fieldset { display: flex; flex-wrap: wrap; gap: 12px; padding: 10px; border: 1px solid var(--uranus-color-7); border-radius: 6px; }
fieldset label { display: flex; align-items: center; gap: 6px; }
.admin-event-table-scroll { overflow-x: auto; max-width: 100%; border: 1px solid var(--uranus-color-7); border-radius: 8px; }
.admin-event-table-rows { min-width: 1060px; list-style: none; padding: 0; margin: 0; }
.admin-event-table-empty { padding: 24px; text-align: center; }
.admin-event-pagination { display: flex; justify-content: flex-end; align-items: center; gap: 10px; padding-block: 14px; font-size: 0.75rem; }
.admin-event-pagination button { display: grid; place-items: center; min-width: 36px; min-height: 36px; background: var(--uranus-color-8); color: inherit; border: 0; border-radius: 5px; cursor: pointer; }
.admin-event-pagination button:disabled { opacity: .4; cursor: default; }
:is(input, select, summary, button, .admin-event-table-scroll):focus-visible { outline: 2px solid var(--uranus-focus-color); outline-offset: 2px; }
@media (max-width: 600px) {
  .admin-event-table-scroll { border: 0; overflow: visible; }
  .admin-event-table-rows { display: grid; gap: 12px; min-width: 0; }
  .admin-event-table-toolbar { align-items: stretch; }
  .admin-event-search { flex-basis: 100%; }
  .admin-event-table-toolbar select { flex: 1; width: 45%; }
  .admin-event-pagination { justify-content: center; }
}
</style>
