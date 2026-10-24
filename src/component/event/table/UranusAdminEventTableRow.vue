<template>
  <li class="admin-event-row">
    <component :is="event.canEditEvent ? RouterLink : 'span'" :to="event.canEditEvent ? eventEditLocation(event) : undefined" class="admin-event-thumbnail" :aria-label="title">
      <img v-if="thumbnail && !imageFailed" :src="thumbnail" alt="" width="112" height="72" loading="lazy" decoding="async" @error="imageFailed = true" />
      <span v-else class="admin-event-image-placeholder" role="img" :aria-label="t('event_table_no_image')"><ImageOff :size="22" aria-hidden="true" /></span>
    </component>
    <div class="admin-event-identification">
      <UranusEventReleaseStatus :status="event.releaseStatus" />
      <h2 :class="{ 'admin-event-title-missing': !event.title?.trim() }">
        <component :is="event.canEditEvent ? RouterLink : 'span'" :to="event.canEditEvent ? eventEditLocation(event, 'base', 'event-title') : undefined">{{ title }}</component>
      </h2>
      <UranusEventTableHint :text="venue" class="admin-event-venue"><span tabindex="0" :aria-label="venue">{{ venue }}</span></UranusEventTableHint>
    </div>
    <div class="admin-event-metadata" :class="{ 'admin-event-metadata--expanded': expanded }" role="group" :aria-label="t('event_table_more')">
      <UranusEventMetadataCell v-for="field in fields" :key="field.key" :field="field" :event="event" @info="emit('info', event)" />
    </div>
    <button type="button" class="admin-event-mobile-toggle" :aria-expanded="expanded" @click="expanded = !expanded">
      {{ t('event_table_more') }} <ChevronUp v-if="expanded" :size="16" aria-hidden="true" /><ChevronDown v-else :size="16" aria-hidden="true" />
    </button>
  </li>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ImageOff, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem'
import { eventEditLocation, mapAdminEventTableFields } from '@/domain/event/adminEventTable'
import { useLanguageLookupStore } from '@/store/languageLookupStore'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore'
import UranusEventReleaseStatus from './UranusEventReleaseStatus.vue'
import UranusEventMetadataCell from './UranusEventMetadataCell.vue'
import UranusEventTableHint from './UranusEventTableHint.vue'
const props = defineProps<{ event: AdminEventListItem }>()
const emit = defineEmits<{ info: [event: AdminEventListItem] }>()
const { t, locale } = useI18n({ useScope: 'global' })
const languageLookup = useLanguageLookupStore()
const typeLookup = useEventTypeLookupStore()
const expanded = ref(false)
const imageFailed = ref(false)
watch(() => props.event.imageUrl, () => { imageFailed.value = false })
const title = computed(() => props.event.title?.trim() || t('event_table_no_title'))
const venue = computed(() => [props.event.venueName, props.event.venueCity].filter(Boolean).join(' / ')
  || (props.event.isOnlineEvent || props.event.onlineLink?.trim() ? t('online_event') : t('event_table_location_unknown')))
const thumbnail = computed(() => {
  if (!props.event.imageUrl) return null
  // Keep existing signed/query parameters and request the API's thumbnail size.
  const [path, query = ''] = props.event.imageUrl.split('?')
  const params = new URLSearchParams(query)
  params.set('width', '224')
  params.set('ratio', '16:9')
  return `${path}?${params}`
})
const fields = computed(() => {
  const pairs = props.event.eventTypes ?? []
  const typeIds = [...new Set(pairs.map(pair => pair.typeId).filter((id): id is number => id != null))]
  // The backend stores genre_id=0 for a type without a genre.
  const genres = [...new Map(pairs.filter(pair => pair.genreId != null && pair.genreId !== 0).map(pair => [`${pair.typeId}/${pair.genreId}`, pair])).values()]
  return mapAdminEventTableFields(props.event, locale.value, (key, values) => values ? t(key, values) : t(key),
    code => languageLookup.data[locale.value]?.[code] ?? code,
    typeIds.map(id => typeLookup.getTypeName(id, locale.value)),
    genres.map(pair => typeLookup.getGenreName(pair.typeId, pair.genreId, locale.value) || `${pair.typeId}/${pair.genreId}`))
})
</script>

<style scoped lang="scss">
.admin-event-row { display: grid; grid-template-columns: 112px minmax(0, 1fr); grid-template-rows: minmax(34px, auto) minmax(38px, auto); column-gap: 12px; padding: 10px; border-bottom: 1px solid var(--uranus-color-7); background: var(--uranus-bg); }
.admin-event-row:last-child { border-bottom: 0; }
.admin-event-thumbnail { grid-row: 1 / 3; align-self: center; border-radius: 6px; overflow: hidden; width: 112px; height: 72px; background: var(--uranus-color-8); }
.admin-event-thumbnail img { display: block; width: 100%; height: 100%; object-fit: cover; }
.admin-event-image-placeholder { display: grid; place-items: center; width: 100%; height: 100%; color: var(--uranus-color-3); }
.admin-event-identification { display: flex; align-items: center; gap: 10px; min-width: 0; }
h2 { margin: 0; min-width: 0; overflow-wrap: anywhere; font-size: 0.95rem; font-weight: 700; line-height: 1.35; }
h2 a { color: inherit; text-decoration: none; }
h2 a:hover { text-decoration: underline; }
.admin-event-title-missing { color: var(--event-field-warning-color); }
.admin-event-venue { margin-left: auto; max-width: 32%; font-size: 0.78rem; color: var(--uranus-color-2); flex-shrink: 0; }
.admin-event-venue > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-event-metadata { display: grid; grid-template-columns: var(--event-metadata-columns); align-items: stretch; gap: 3px; font-size: 0.72rem; }
.admin-event-mobile-toggle { display: none; }
a:focus-visible, button:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--uranus-focus-color); outline-offset: 3px; }
@media (max-width: 600px) {
  .admin-event-row { grid-template-columns: 68px minmax(0, 1fr); grid-template-rows: auto auto auto; gap: 10px; border: 1px solid var(--uranus-color-7); border-radius: 8px; padding: 12px; }
  .admin-event-row:last-child { border-bottom: 1px solid var(--uranus-color-7); }
  .admin-event-thumbnail { width: 68px; height: 68px; grid-row: 1; align-self: start; }
  .admin-event-identification { flex-wrap: wrap; align-content: start; gap: 6px; }
  h2 { flex: 1; font-size: 0.9rem; }
  .admin-event-venue { margin-left: 0; width: 100%; max-width: 100%; flex-shrink: 1; }
  .admin-event-metadata { grid-column: 1 / -1; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 5px; }
  .admin-event-metadata :deep(.event-metadata--date) { grid-column: 1 / -1; }
  .admin-event-metadata:not(.admin-event-metadata--expanded) :deep(.event-metadata:not(.event-metadata--date):not(.event-metadata--language):not(.event-metadata--images):not(.event-metadata--categories):not(.event-metadata--tags)) { display: none; }
  .admin-event-metadata:not(.admin-event-metadata--expanded) :deep(.event-metadata-mobile-label) { display: none; }
  .admin-event-mobile-toggle { display: flex; grid-column: 1 / -1; align-items: center; justify-content: center; gap: 8px; padding: 8px; border: 0; border-top: 1px solid var(--uranus-color-8); background: transparent; color: var(--uranus-color-2); font: inherit; font-size: 0.75rem; cursor: pointer; }
}
</style>
