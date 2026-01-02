<!--
  UranusEventTypeSelect
-->
<template>
  <UranusFormRow>
    <select v-model="selectedEventTypeId" class="_type-select">
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>
      <option v-for="eventType in eventTypeOptionsLocal" :key="eventType.id" :value="eventType.id">
        {{ eventType.name }}
      </option>
    </select>

    <select v-if="canSelectGenre" v-model="selectedGenreTypeId" class="_genre-select">
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>
      <option v-for="genreType in genreTypeOptionsLocal" :key="genreType.id" :value="genreType.id">
        {{ genreType.name }}
      </option>
    </select>

    <button
        v-if="canAddType"
        class="uranus-secondary-button _button"
        @click="onAddType"
    >
      {{ t('add') }}
    </button>
  </UranusFormRow>

  <div class="uranus-dashboard-chip-wrapper">
    <span
        v-for="typeItem in draftTypeList"
        :key="typeItem.typeId + '_' + typeItem.genreId"
        class="uranus-dashboard-chip"
        :class="{ removable: canRemoveChips }"
    >
      {{ formatTypeGenreItem(typeItem) }}

      <span
          v-if="canRemoveChips"
          class="uranus-dashboard-chip-close"
          @click="onRemoveType(typeItem.typeId + '_' + typeItem.genreId)"
      >
        ×
      </span>
    </span>
  </div>

</template>


<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { apiFetch } from "@/api.ts";
import { useEventTypeLookupStore } from '@/store/eventTypesLookup.ts'
import type { UranusEventType } from "@/models/UranusEventModel.ts";
import UranusFormRow from "@/components/ui/UranusFormRow.vue";

const { t, locale } = useI18n({ useScope: 'global' })

const typeLookupStore = useEventTypeLookupStore()
function formatTypeGenreItem(item: UranusEventType): string {
  return  typeLookupStore.getTypeGenreName(item.typeId, item.genreId, locale.value)
}
const eventTypeOptionsLocal = computed(() => {
  const langData = typeLookupStore.data[locale.value]
  if (!langData) return []
  return Object.values(langData.types)
})
const genreTypeOptionsLocal = computed(() => {
  const langData = typeLookupStore.data[locale.value]
  if (!langData || selectedEventTypeId.value == null) return []
  const genresForType = langData.genres[selectedEventTypeId.value]
  return genresForType
      ? Object.entries(genresForType).map(([id, name]) => ({ id: Number(id), name }))
      : []
})


interface SelectOption {
  id: number
  name: string
}

// Props and v-model
const props = defineProps<{
  modelValue: UranusEventType[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UranusEventType[]): void
}>()

// Local reactive copy
const draftTypeList = ref<UranusEventType[]>([...(props.modelValue ?? [])])
const canRemoveChips = ref(true) // or false if you want read-only mode


watch(locale, async (newLocale) => {
  // Refetch event types for new locale
  eventTypeOptionsLocal.value = await fetchEventTypes()

  // If a type is already selected, refetch its genres
  if (selectedEventTypeId.value != null) {
    genreTypeOptionsLocal.value = await fetchGenreTypes(selectedEventTypeId.value)
  }
})

onMounted(async () => {
  eventTypeOptionsLocal.value = await fetchEventTypes()
})

async function fetchEventTypes(): Promise<SelectOption[]> {
  const { data } = await apiFetch<SelectOption[]>(`/api/choosable-event-types?lang=${locale.value}`)
  return Array.isArray(data) ? data : []
}

async function fetchGenreTypes(eventTypeId: number): Promise<SelectOption[]> {
  const { data } = await apiFetch<SelectOption[]>(`/api/choosable-event-genres/event-type/${eventTypeId}?lang=${locale.value}`)
  return Array.isArray(data) ? data : []
}

const selectedEventTypeId = ref<number | null>(null)
const selectedGenreTypeId = ref<number | null>(null)
const currentSelection = ref<UranusEventType>({
  typeId: null,
  typeName: null,
  genreId: null,
  genreName: null,
})
const canSelectGenre = ref<boolean>(false)
const canAddType = ref<boolean>(false)


watch(selectedEventTypeId, (newId) => {
  const selectedEventType = eventTypeOptionsLocal.value.find(et => et.id === newId)
  onEventTypeChange(selectedEventType)
})

watch(selectedGenreTypeId, (newId) => {
  const selectedGenreType = genreTypeOptionsLocal.value.find(et => et.id === newId)
  onGenreTypeChange(selectedGenreType)
})

async function onEventTypeChange(eventType: SelectOption | undefined) {
  if (!eventType) {
    genreTypeOptionsLocal.value = []
    return
  }
  genreTypeOptionsLocal.value = await fetchGenreTypes(eventType.id)
  currentSelection.value.typeId = eventType?.id
  currentSelection.value.typeName = eventType?.name
  currentSelection.value.genreId = null
  currentSelection.value.genreName = null
  canAddType.value = Number.isFinite(eventType.id)
  canSelectGenre.value = genreTypeOptionsLocal.value.length > 0
}

async function onGenreTypeChange(genreType: SelectOption | undefined) {
  currentSelection.value.genreId = genreType?.id ?? null
  currentSelection.value.genreName = genreType?.name ?? null
}


const onAddType = () => {
  const copy = { ...currentSelection.value }
  // Check if combination already exists
  const exists = draftTypeList.value.some(
      item =>
          normalizeId(item.typeId) === normalizeId(copy.typeId) &&
          normalizeId(item.genreId) === normalizeId(copy.genreId)
  )
  if (!exists) {
    draftTypeList.value.push(copy)
    emit('update:modelValue', draftTypeList.value)
  }
}

// Utility function for consistent comparison
const normalizeId = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  return Number.isFinite(value) ? value : null
}

function onRemoveType(key: string) {
  draftTypeList.value = draftTypeList.value.filter(
      item => (item.typeId + '_' + item.genreId) !== key
  )
  emit('update:modelValue', draftTypeList.value)
}

</script>

<style scoped lang="scss">
._type-select,
._genre-select {
  flex: 3;
  border-width: 2px;
  font-size: 1em;
  padding: 0.4em 0.6em;
  max-width: 250px;
}

._button {
  flex: 0 0 auto;
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  padding: 0.5rem 1rem;
  white-space: nowrap;
  align-items: center;
  justify-content: center;
}

</style>