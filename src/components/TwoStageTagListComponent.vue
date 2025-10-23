<template>
  <div class="tag-selector">
    <div class="tag-selector__controls">
      <!-- Event Type Selector -->
      <div class="tag-selector__group">
        <label for="event-type-select">{{ t('event_type_label') }}</label>
        <select id="event-type-select" v-model="selectedType" @change="onTypeChange">
          <option disabled :value="null">{{ t('event_type_placeholder') }}</option>
          <option v-for="type in eventTypes" :key="type.type_id" :value="type">
            {{ type.name }}
          </option>
        </select>
      </div>

      <!-- Event Genre Selector -->
      <div class="tag-selector__group" v-if="selectedType && genres.length > 0">
        <label for="event-genre-select">{{ t('event_genre_label') }}</label>
        <select id="event-genre-select" v-model="selectedGenre">
          <option disabled :value="null">{{ t('event_genre_placeholder') }}</option>
          <option v-for="genre in genres" :key="genre.type_id" :value="genre">
            {{ genre.name }}
          </option>
        </select>
      </div>

      <button class="tag-selector__add" @click.prevent="addCombination" :disabled="!selectedType">
        {{ t('tag_selector_add') }}
      </button>
    </div>

    <!-- Selected List -->
    <div class="tag-selector__list">
      <ComboTagComponent
          v-for="(item, index) in selectedList"
          :key="item.type.type_id + '-' + (item.genre?.type_id || 0)"
          :label="item.genre ? `${item.type.name} / ${item.genre.name}` : item.type.name"
          theme="light"
          @remove="removeCombination(index)"
      />
      <p v-if="!selectedList.length" class="tag-selector__empty">
        {{ t('tag_selector_empty') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ComboTagComponent from '@/components/ComboTagComponent.vue'

// --- Types ---
interface EventType {
  type_id: number
  name: string
}

interface EventGenre {
  type_id: number
  name: string
}

interface TypeGenrePair {
  type_id: number
  genre_id: number
}

interface SelectionPreset {
  typeId: number
  genreId: number | null
}

type SelectionTuple = [number, number]
type InitialSelectionItem = SelectionPreset | SelectionTuple

interface Props {
  fetchStage1: () => Promise<EventType[]>
  fetchStage2: (typeId: number) => Promise<EventGenre[]>
  initialSelection?: InitialSelectionItem[]
}

interface SelectedItem {
  type: EventType
  genre: EventGenre | null
}

// --- Props & Emits ---
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update-selection', payload: { typeGenrePairs: TypeGenrePair[] }): void
}>()

// --- Reactive State ---
const { t } = useI18n({ useScope: 'global' })
const eventTypes = ref<EventType[]>([])
const genres = ref<EventGenre[]>([])
const selectedType = ref<EventType | null>(null)
const selectedGenre = ref<EventGenre | null>(null)
const selectedList = ref<SelectedItem[]>([])
const genresCache: Record<number, EventGenre[]> = {}
const isApplyingInitialSelection = ref(false)
const initialSelectionQueue = ref<InitialSelectionItem[]>([])

// --- Fetch Functions ---
async function fetchEventTypes() {
  try {
    eventTypes.value = await props.fetchStage1() ?? []
    await applyInitialSelection()
  } catch (err) {
    console.error('fetchStage1 error:', err)
    eventTypes.value = []
  }
}

async function fetchEventGenres(typeId: number) {
  try {
    const data = await props.fetchStage2(typeId)
    genres.value = data ?? []
    genresCache[typeId] = genres.value
  } catch (err) {
    console.error('fetchStage2 error:', err)
    genres.value = []
  }
}

async function ensureGenres(typeId: number) {
  if (typeId in genresCache) return genresCache[typeId] ?? []
  const data = await props.fetchStage2(typeId)
  const options = data ?? []
  genresCache[typeId] = options
  return options
}

// --- Initial Selection ---
async function applyInitialSelection() {
  if (!initialSelectionQueue.value.length || !eventTypes.value.length) return
  const selections = [...initialSelectionQueue.value]
  initialSelectionQueue.value = []
  const list: SelectedItem[] = []
  isApplyingInitialSelection.value = true

  try {
    for (const sel of selections) {
      let typeId: number
      let genreId: number | null = null

      if (Array.isArray(sel)) {
        [typeId, genreId] = sel
      } else {
        typeId = sel.typeId
        genreId = sel.genreId ?? null
      }

      const type = eventTypes.value.find(item => item.type_id === typeId)
      if (!type) continue

      let genre: EventGenre | null = null
      if (genreId !== null && genreId > 0) {
        const genreOptions = await ensureGenres(type.type_id)
        genre =
            genreOptions.find(opt =>
                opt.type_id === genreId ||
                (opt as any).genre_id === genreId ||
                (opt as any).id === genreId
            ) ?? null
      }

      list.push({ type, genre })
    }

    selectedList.value = list
  } finally {
    isApplyingInitialSelection.value = false
    updateParentSelection()
  }
}

// --- Handlers ---
async function onTypeChange() {
  selectedGenre.value = null
  genres.value = []
  if (selectedType.value) {
    await fetchEventGenres(selectedType.value.type_id)
  }
}

function updateParentSelection() {
  if (isApplyingInitialSelection.value) return

  const typeGenrePairs: TypeGenrePair[] = selectedList.value.map(item => ({
    type_id: item.type.type_id,
    genre_id: item.genre?.type_id ?? 0,
  }))

  emit('update-selection', { typeGenrePairs })
}

function addCombination() {
  if (!selectedType.value) return

  const typeId = selectedType.value.type_id
  const genreId = selectedGenre.value?.type_id ?? 0

  const exists = selectedList.value.some(
      item => item.type.type_id === typeId && (item.genre?.type_id ?? 0) === genreId
  )
  if (exists) return

  selectedList.value.push({
    type: selectedType.value,
    genre: genres.value.length > 0 ? selectedGenre.value : null,
  })

  selectedGenre.value = null
  updateParentSelection()
}

function removeCombination(index: number) {
  selectedList.value.splice(index, 1)
  updateParentSelection()
}

// --- Lifecycle ---
onMounted(() => {
  if (props.initialSelection) initialSelectionQueue.value = [...props.initialSelection]
  void fetchEventTypes()
})

watch(
    () => props.initialSelection,
    (value) => {
      if (!value) return
      initialSelectionQueue.value = [...value]
      void applyInitialSelection()
    },
    { deep: true }
)
</script>

<style scoped lang="scss">
.tag-selector {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.5vw, 1.5rem);
  padding: clamp(1rem, 2.5vw, 1.5rem);
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid var(--border-soft);
}

// Mobile-first: Single column layout by default
.tag-selector__controls {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.75rem, 2vw, 1rem);
  align-items: flex-end;
}

.tag-selector__group {
  flex: 1 1 220px;
  @include form-group();
}

.tag-selector__add {
  @include form-primary-button($padding-y: 0.75rem, $padding-x: 1.5rem);
}

.tag-selector__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag-selector__empty {
  margin: 0;
  color: var(--muted-text);
  font-size: 0.9rem;
}

// Tablet and up: Enhanced layout
@media (min-width: 640px) {
  .tag-selector {
    padding: clamp(1rem, 2.5vw, 1.5rem);
  }

  .tag-selector__controls {
    flex-direction: row;
    align-items: flex-end;
  }

  .tag-selector__add {
    width: auto;
  }
}
</style>