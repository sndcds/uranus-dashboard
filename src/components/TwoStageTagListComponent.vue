<template>
  <div class="tag-selector">
    <div class="tag-selector__controls">
      <div class="tag-selector__group">
        <label for="event-type-select">{{ t('event_type_label') }}</label>
        <select id="event-type-select" v-model="selectedType" @change="onTypeChange">
          <option disabled :value="null">{{ t('event_type_placeholder') }}</option>
          <option v-for="type in eventTypes" :key="type.type_id" :value="type">
            {{ type.name }}
          </option>
        </select>
      </div>

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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ComboTagComponent from "@/components/ComboTagComponent.vue";

// --- Props ---
interface Props {
  fetchStage1: () => Promise<any[]>
  fetchStage2: (typeId: number) => Promise<any[]>
}

const props = defineProps<Props>()

// --- Emits ---
const emit = defineEmits<{
  (e: 'update-selection', payload: { typeIds: number[], genreIds: number[] }): void
}>()

// --- Reactive state ---
const eventTypes = ref<any[]>([])
const genres = ref<any[]>([])
const selectedType = ref<any | null>(null)
const selectedGenre = ref<any | null>(null)
const selectedList = ref<{ type: any; genre: any | null }[]>([])

const { t } = useI18n({ useScope: 'global' })

// --- Fetch Functions ---
async function fetchEventTypes() {
  try {
    const data = await props.fetchStage1()
    eventTypes.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('fetchStage1 error:', err)
    eventTypes.value = []
  }
}

async function fetchEventGenres(typeId: number) {
  try {
    const data = await props.fetchStage2(typeId)
    genres.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('fetchStage2 error:', err)
    genres.value = []
  }
}

// --- Handlers ---
async function onTypeChange() {
  selectedGenre.value = null
  genres.value = []
  if (selectedType.value?.type_id) {
    await fetchEventGenres(selectedType.value.type_id)
  }
}

function updateParentSelection() {
  const typeIds = selectedList.value.map(item => item.type.type_id)
  const genreIds = selectedList.value
    .filter(item => item.genre)
    .map(item => item.genre.type_id)
  emit('update-selection', { typeIds, genreIds })
}

function addCombination() {
  if (!selectedType.value) return

  const exists = selectedList.value.some(
    item =>
      item.type.type_id === selectedType.value.type_id &&
      (item.genre?.type_id || null) === (selectedGenre.value?.type_id || null)
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

// --- On component mount ---
onMounted(fetchEventTypes)
</script>

<style scoped lang="scss">
.tag-selector {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.5vw, 1.5rem);
  padding: clamp(1rem, 2.5vw, 1.5rem);
  background: rgba(248, 250, 252, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.tag-selector__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: clamp(1.1rem, 2vw, 1.35rem);
    font-weight: 700;
    color: #111827;
  }
}

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
  color: rgba(71, 85, 105, 0.75);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .tag-selector {
    padding: clamp(0.85rem, 5vw, 1.2rem);
  }

  .tag-selector__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .tag-selector__add {
    width: 100%;
  }
}
</style>
