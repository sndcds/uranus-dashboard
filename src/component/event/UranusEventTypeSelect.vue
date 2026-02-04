<!--
  UranusEventTypeSelect
-->
<template>
  <UranusFormRow>

    <select v-model="selectedEventTypeId">
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>
      <option
          v-for="eventType in eventTypeOptions"
          :key="eventType.id"
          :value="eventType.id"
      >
        {{ eventType.name }}
      </option>
    </select>

    <select
        v-if="canSelectGenre"
        v-model="selectedGenreTypeId"
    >
      <option :value="null" disabled>{{ t('select_placeholder') }}</option>
      <option
          v-for="genreType in genreTypeOptions"
          :key="genreType.id"
          :value="genreType.id"
      >
        {{ genreType.name }}
      </option>
    </select>

    <UranusActionButton v-if="canAddType" @click="onAddType">
      {{ t('add') }}
    </UranusActionButton>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventTypeLookupStore } from '@/store/uranusEventTypeGenreLookup.ts'
import type { UranusEventType } from '@/model/uranusEventModel.ts'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusActionButton from "@/component/ui/UranusActionButton.vue";

/* i18n */
const { t, locale } = useI18n({ useScope: 'global' })

/* store */
const typeLookupStore = useEventTypeLookupStore()

onMounted(async () => {
  await typeLookupStore.load()
})

/* props / emits */
const props = defineProps<{
  modelValue: UranusEventType[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UranusEventType[]): void
}>()

/* local state */
const draftTypeList = ref<UranusEventType[]>([...(props.modelValue ?? [])])
const selectedEventTypeId = ref<number | null>(null)
const selectedGenreTypeId = ref<number | null>(null)

const canRemoveChips = ref(true)

/* ===== computed options from store ===== */

const langData = computed(() => typeLookupStore.data[locale.value])

// Event type options
const eventTypeOptions = computed(() => {
  if (!langData.value) return []

  return Object.entries(langData.value.types)
      .map(([id, typeObj]) => ({
        id: Number(id),
        name: typeObj.name // <- access the name property
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
})

// Genre options for selected type
const genreTypeOptions = computed(() => {
  if (!langData.value || selectedEventTypeId.value == null) return []

  const typeObj = langData.value.types[selectedEventTypeId.value.toString()]
  if (!typeObj?.genres) return []

  return Object.entries(typeObj.genres)
      .map(([id, name]) => ({
        id: Number(id),
        name // already the genre name
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
})

/* ===== selection state ===== */

const currentSelection = ref<UranusEventType>({
  typeId: null,
  typeName: '',
  genreId: null,
  genreName: ''
})

const canSelectGenre = computed(() => genreTypeOptions.value.length > 0)
const canAddType = computed(() => selectedEventTypeId.value != null)

/* ===== watchers ===== */

watch(selectedEventTypeId, (id) => {
  if (id == null) {
    currentSelection.value = {
      typeId: null,
      typeName: '',
      genreId: null,
      genreName: ''
    }
    selectedGenreTypeId.value = null
    return
  }

  currentSelection.value.typeId = id
  selectedGenreTypeId.value = null
  currentSelection.value.genreId = null
})

watch(selectedGenreTypeId, (id) => {
  if (id == null || selectedEventTypeId.value == null) {
    currentSelection.value.genreId = null
    return
  }

  currentSelection.value.genreId = id
})

/* ===== actions ===== */

const onAddType = () => {
  const copy = { ...currentSelection.value }

  const exists = draftTypeList.value.some(
      item =>
          item.typeId === copy.typeId &&
          item.genreId === copy.genreId
  )

  if (!exists) {
    draftTypeList.value.push(copy)
    emit('update:modelValue', draftTypeList.value)
  }
}

function onRemoveType(key: string) {
  draftTypeList.value = draftTypeList.value.filter(
      item => `${item.typeId}_${item.genreId}` !== key
  )
  emit('update:modelValue', draftTypeList.value)
}

/* ===== formatting ===== */

function formatTypeGenreItem(item: UranusEventType): string {
  return typeLookupStore.getTypeGenreName(item.typeId, item.genreId ?? null, locale.value)
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

.uranus-action-button {
  flex: 0 0 auto;
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  padding: 0.5rem 1rem;
  white-space: nowrap;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

</style>