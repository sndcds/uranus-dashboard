<template>
  <UranusForm>
    <UranusLocationForm
        v-model:modelValueLat="latModel"
        v-model:modelValueLon="lonModel"
    />

    <UranusFormActions>
      <UranusButton @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </UranusButton>
      <UranusButton @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </UranusButton>
    </UranusFormActions>
  </UranusForm>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { apiFetch } from '@/api'
import { useUranusOrganizationStore } from '@/store/organizationStore.ts'
import UranusLocationForm from '@/component/uranus/UranusLocationForm.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { useI18n } from 'vue-i18n'

type MapLocation = { lat: number; lng: number } | null

const store = useUranusOrganizationStore()
const { t } = useI18n({ useScope: 'global' })

const location = ref<MapLocation>(null)

// Sync store → map
watch(
    () => store.draft,
    (draft) => {
      if (!draft) return
      location.value = draft.lat != null && draft.lon != null
          ? { lat: draft.lat, lng: draft.lon }
          : null
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

const latModel = computed<number | null>({
  get: () => store.draft?.lat ?? null,
  set: (val: number | null) => { if (store.draft) store.draft.lat = val }
})

const lonModel = computed<number | null>({
  get: () => store.draft?.lon ?? null,
  set: (val: number | null) => { if (store.draft) store.draft.lon = val }
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

    await apiFetch(`/api/admin/organization/${draft.uuid}/fields`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

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

  location.value = original.lat != null && original.lon != null
      ? { lat: original.lat, lng: original.lon }
      : null
}
</script>

<style scoped lang="scss">
.location-map {
  height: 600px;
}
</style>