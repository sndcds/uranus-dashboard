<!--
  src/component/event/editor/UranusAdminEventTypeGenreEditor.vue

  2026-02-05, Roald
-->

<template>
  <h2>Types and Genres</h2>

  <section class="event-types-tab">
    <div class="event-types-list">
      <div v-for="(pair, index) in store.draft?.eventTypes ?? []"
          :key="index"
          class="event-type-chip"
      >
        {{ getTypeGenreLabel(pair) }}
        <button @click="removePair(index)">×</button>
      </div>
    </div>

    <div class="event-types-form">
      <select v-model="selectedTypeId" @change="onTypeChange">
        <option :value="null" disabled>Select type</option>
        <option
            v-for="typeObj in sortedTypes"
            :key="typeObj.id"
            :value="typeObj.id"
        >
          {{ typeObj.name }}
        </option>
      </select>

      <select v-if="genresForSelectedType" v-model="selectedGenreId">
        <option :value="null" disabled>Select genre</option>
        <option
            v-for="genre in sortedGenresForSelectedType"
            :key="genre.id"
            :value="genre.id"
        >
          {{ genre.name }}
        </option>
      </select>

      <button @click="addPair" :disabled="!selectedTypeId">
        Add
      </button>
    </div>

    <div class="dirty-indicator" v-if="isDirty">
      ⚠ You have unsaved changes
    </div>

    <div class="tab-actions">
      <button @click="resetEventTypesTab" :disabled="store.saving || !isDirty">
        Discard
      </button>
      <button @click="commitEventTypesTab" :disabled="store.saving || !isDirty">
        Save
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { useEventTypeLookupStore } from '@/store/uranusEventTypeGenreLookup.ts'
import { UranusAdminEventTypePair } from "@/domain/event/UranusAdminEventTypePair.ts"

const { t, locale } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const lookupStore = useEventTypeLookupStore()

const selectedTypeId = ref<number | null>(null)
const selectedGenreId = ref<number | null>(null)

onMounted(async () => {
  // await lookupStore.load([locale.value])

  if (store.draft) {
    store.draft.eventTypes =
        store.original?.eventTypes?.map(
            e => new UranusAdminEventTypePair(e.typeId, e.genreId)
        ) ?? []
  }
})

// Available types
const typeLookup = computed(() => lookupStore.data[locale.value]?.types ?? {})

// Genres for selected type
const genresForSelectedType = computed(() => {
  if (!selectedTypeId.value) return null
  return typeLookup.value[selectedTypeId.value]?.genres ?? null
})

const sortedTypes = computed(() => {
  const types = Object.entries(typeLookup.value).map(([id, obj]) => ({
    id: Number(id),
    name: obj.name,
    genres: obj.genres
  }))
  return types.sort((a, b) => a.name.localeCompare(b.name))
})

const sortedGenresForSelectedType = computed(() => {
  if (!genresForSelectedType.value) return []
  return Object.entries(genresForSelectedType.value)
      .map(([id, name]) => ({ id: Number(id), name }))
      .sort((a, b) => a.name.localeCompare(b.name))
})

function onTypeChange() {
  selectedGenreId.value = null
}

function addPair() {
  if (!selectedTypeId.value || !store.draft) return
  const pair = {
    typeId: selectedTypeId.value,
    genreId: selectedGenreId.value ?? null
  }

  if (!store.draft?.eventTypes) store.draft.eventTypes = []

  const exists = store.draft.eventTypes.some(
      e => (e.typeId ?? null) === pair.typeId &&
          (e.genreId ?? null) === pair.genreId
  )

  if (!exists) {
    store.draft.eventTypes.push(pair)
  }

  selectedTypeId.value = null
  selectedGenreId.value = null
}

function removePair(index: number) {
  store.draft!.eventTypes!.splice(index, 1)
}

function getTypeGenreLabel(pair: UranusAdminEventTypePair) {
  return lookupStore.getTypeGenreName(pair.typeId, pair.genreId, locale.value)
}

const isDirty = computed(() => {
  const current = store.draft?.eventTypes ?? []
  const original = store.original?.eventTypes ?? []

  if (current.length !== original.length) return true

  // Helper: compare two type/genre objects
  const isEqual = (a: { typeId: number | null; genreId: number | null },
                   b: { typeId: number | null; genreId: number | null }) =>
      (a.typeId ?? null) === (b.typeId ?? null) &&
      (a.genreId ?? null) === (b.genreId ?? null)

  // Check that every item in current exists in original
  const allMatch = current.every(c =>
      original.some(o => isEqual(c, o))
  )

  // If any current item is missing in original → dirty
  if (!allMatch) return true

  // Optionally, check the reverse as well (should be same length anyway)
  const allOriginalMatch = original.every(o =>
      current.some(c => isEqual(c, o))
  )

  return !allOriginalMatch
})

async function commitEventTypesTab() {
  if (!store.draft) return

  store.saving = true
  store.error = null

  try {
    const payload = {
      event_types: store.draft.eventTypes?.map(e => ({
        type_id: e.typeId,
        genre_id: e.genreId,
      })),
    }

    const apiPath = `/api/admin/event/${store.draft.id}/types`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    // Commit locally
    if (store.original && store.draft && store.draft.eventTypes) {
      store.original.eventTypes = store.draft.eventTypes.map(
          e => new UranusAdminEventTypePair(e.typeId, e.genreId)
      )
    }
  } catch (err) {
    store.error = 'Failed to save event types'
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetEventTypesTab() {
  if (!store.draft) return

  if (store.original?.eventTypes) {
    store.draft.eventTypes = store.original.eventTypes.map(
        e => new UranusAdminEventTypePair(e.typeId, e.genreId)
    )
  }

  // Reset selected type/genre
  selectedTypeId.value = null
  selectedGenreId.value = null
}
</script>

<style scoped lang="scss">
.event-types-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .event-types-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .event-type-chip {
      background: #a2c1ef;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 0.3rem;

      button {
        background: transparent;
        border: none;
        cursor: pointer;
        font-weight: bold;
      }
    }
  }

  .event-types-form {
    display: flex;
    gap: 0.5rem;

    select {
      padding: 0.4rem;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    button {
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      cursor: pointer;
    }
  }

  .dirty-indicator {
    color: #b00;
    font-weight: bold;
  }
}
</style>