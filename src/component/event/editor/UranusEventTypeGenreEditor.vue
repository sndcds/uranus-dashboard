<!--
  src/component/event/editor/UranusEventTypeGenreEditor.vue
-->

<template>
  <UranusCard class="event-types-card">
    <h2>{{ t('event_types_and_genre') }}</h2>

    <div class="event-types-list">
      <div v-for="(pair, index) in store.draft!.eventTypes ?? []" :key="index" class="uranus-chip">
        {{ getTypeGenreLabel(pair) }}
        <button @click="removePair(index)">×</button>
      </div>
    </div>

    <UranusFormRow>
      <select v-model="selectedTypeId" @change="onTypeChange">
        <option :value="null" disabled>{{ t('select_event_type') }}</option>
        <option v-for="typeObj in sortedTypes" :key="typeObj.id" :value="typeObj.id">
          {{ typeObj.name }}
        </option>
      </select>

      <select v-if="sortedGenresForSelectedType.length" v-model="selectedGenreId">
        <option :value="null" disabled>{{ t('select_event_genre') }}</option>
        <option v-for="genre in sortedGenresForSelectedType" :key="genre.id" :value="genre.id">
          {{ genre.name }}
        </option>
      </select>

      <UranusFormActions>
        <UranusButton size="small" variant="tertiary" :disabled="!selectedTypeId" @click="addPair">
          {{ t('add') }}
        </UranusButton>
      </UranusFormActions>
    </UranusFormRow>
  </UranusCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventTypeLookupStore } from '@/store/uranusEventTypeGenreLookup.ts'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import {createEventTypePair, type EventTypePairModel} from '@/domain/event/eventTypePair.model.ts'
import UranusFormActions from "@/component/ui/UranusFormActions.vue";


const store = useAdminEventStore()

const { t, locale } = useI18n({ useScope: 'global' })
const lookupStore = useEventTypeLookupStore()

const selectedTypeId = ref<number | null>(null)
const selectedGenreId = ref<number | null>(null)

// Lookup map
const typeLookup = computed(() => lookupStore.data[locale.value]?.types ?? {})

// Sorted types
const sortedTypes = computed(() => {
  return Object.entries(typeLookup.value)
      .map(([id, obj]) => ({ id: Number(id), name: obj.name, genres: obj.genres }))
      .sort((a, b) => a.name.localeCompare(b.name))
})

// Sorted genres for selected type
const sortedGenresForSelectedType = computed(() => {
  if (!selectedTypeId.value) return []
  const genres = typeLookup.value[selectedTypeId.value]?.genres ?? {}
  return Object.entries(genres)
      .map(([id, name]) => ({ id: Number(id), name }))
      .sort((a, b) => a.name.localeCompare(b.name))
})

function onTypeChange() {
  selectedGenreId.value = null
}

function addPair() {
  if (!selectedTypeId.value|| !store.draft) return
  const pair = createEventTypePair(
      selectedTypeId.value ?? null,
      selectedGenreId.value ?? null
  )


  const exists = store.draft.eventTypes?.some(
      e => e.typeId === pair.typeId && e.genreId === pair.genreId
  )
  if (!exists) store.draft.eventTypes!.push(pair)
  selectedTypeId.value = null
  selectedGenreId.value = null
}

function removePair(index: number) {
  store.draft!.eventTypes!.splice(index, 1)
}

function getTypeGenreLabel(pair: EventTypePairModel) {
  if (!pair) return ''

  const typeId = pair.typeId
  if (typeId == null) return ''

  const typeObj = typeLookup.value[typeId]
  if (!typeObj) return ''

  const genreId = pair.genreId
  if (genreId == null || !typeObj.genres) return typeObj.name

  return `${typeObj.name} / ${typeObj.genres[genreId] ?? ''}`
}
</script>

<style scoped lang="scss">
.event-types-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-types-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>