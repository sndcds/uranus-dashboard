<!--
  src/component/event/editor/UranusVenueMapTab.vue

  2026-02-08, Roald
-->

<template>
  <section class="uranus-admin-edit-section venue-map-tab">

    <div class="map-label">
      {{ t('geo_location') }}
    </div>

    <UranusMapLocationPicker
        class="location-map"
        v-model="location"
        :zoom="12"
        :selectable="true"
    />

    <div class="location-summary">
      {{ locationSummary }}
    </div>

    <div class="tab-actions">
      <button @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </button>
      <button @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </button>
    </div>

  </section>
</template>


<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useUranusVenueStore } from '@/store/UranusVenueStore.ts'
import UranusMapLocationPicker from '@/component/UranusMapLocationPicker.vue'

type MapLocation = { lat: number; lng: number } | null

const { t } = useI18n({ useScope: 'global' })
const store = useUranusVenueStore()

const location = ref<MapLocation>(null)

// Sync store → map
watch(
    () => store.draft,
    (draft) => {
      if (!draft) return

      if (draft.lat != null && draft.lon != null) {
        location.value = { lat: draft.lat, lng: draft.lon }
      } else {
        location.value = null
      }
    },
    { immediate: true }
)

// Sync map → store
watch(location, (loc) => {
  if (!store.draft) return

  store.draft.lat = loc?.lat ?? null
  store.draft.lon = loc?.lng ?? null
})

const isDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return draft.lat !== original.lat || draft.lon !== original.lon
})

const locationSummary = computed(() => {
  if (!location.value) return t('venue_map_no_selection')
  return `${location.value.lat.toFixed(5)}, ${location.value.lng.toFixed(5)}`
})

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  store.saving = true
  store.error = null

  try {
    const payload: Record<string, any> = {}

    if (draft.lat !== original.lat) payload.lat = draft.lat
    if (draft.lon !== original.lon) payload.lon = draft.lon

    if (Object.keys(payload).length === 0) return

    await apiFetch(`/api/admin/venue/${draft.id}/fields`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    // commit locally
    original.lat = draft.lat
    original.lon = draft.lon
  } catch (err) {
    store.error = 'Failed to save location'
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  draft.lat = original.lat
  draft.lon = original.lon

  if (original.lat != null && original.lon != null) {
    location.value = { lat: original.lat, lng: original.lon }
  } else {
    location.value = null
  }
}
</script>


<style scoped lang="scss">
.venue-map-tab {
  width: 100%;
  max-width: 1024px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.location-map {
  height: 600px;
}

.map-label {
  font-weight: 500;
  color: #999;
}

.location-summary {
  font-size: 0.9rem;
  color: #aaa;
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>