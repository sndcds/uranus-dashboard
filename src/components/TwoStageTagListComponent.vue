<template>
  <div class="two-stage-list">
    <div class="two-stage-list__controls">
      <!-- Primary Selector -->
      <div class="two-stage-list__group">
        <label>{{ labelPrimary }}</label>
        <select v-model="selectedPrimary" @change="onPrimaryChange">
          <option disabled :value="null">{{ placeholderPrimary }}</option>
          <option v-for="item in primaries" :key="item.id" :value="item">{{ item.name }}</option>
        </select>
      </div>

      <!-- Secondary Selector -->
      <div class="two-stage-list__group" v-if="selectedPrimary && secondaryOptions.length">
        <label>{{ labelSecondary }}</label>
        <select v-model="selectedSecondary">
          <option disabled :value="null">{{ placeholderSecondary }}</option>
          <option v-for="item in secondaryOptions" :key="item.id" :value="item">{{ item.name }}</option>
        </select>
      </div>

      <button
          class="two-stage-list__add"
          @click.prevent="addCombination"
          :disabled="!selectedPrimary"
      >
        {{ t('add') }}
      </button>
    </div>

    <!-- Selected List -->
    <div class="two-stage-list__list">
      <ComboTagComponent
          v-for="(item, index) in selectedList"
          :key="item.primary.id + '-' + (item.secondary?.id ?? 0)"
          :label="item.secondary ? `${item.primary.name} / ${item.secondary.name}` : item.primary.name"
          theme="light"
          @remove="removeCombination(index)"
      />
      <p v-if="!selectedList.length" class="two-stage-list__empty">{{ t('none_selected') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ComboTagComponent from '@/components/ComboTagComponent.vue'

interface Item { id: number; name: string }
interface Selection { primaryId: number; secondaryId?: number | null }
interface SelectedItem { primary: Item; secondary?: Item | null }

interface Props {
  fetchPrimaries: () => Promise<Item[]>
  fetchSecondaries?: (primaryId: number) => Promise<Item[]>
  initialSelection?: Selection[]
  labelPrimary?: string
  labelSecondary?: string
  placeholderPrimary?: string
  placeholderSecondary?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelPrimary: 'Primary',
  labelSecondary: 'Secondary',
  placeholderPrimary: 'Select primary',
  placeholderSecondary: 'Select secondary',
})

const emit = defineEmits<{
  (e: 'update-selection', payload: Selection[]): void
}>()

const { t } = useI18n({ useScope: 'global' })

// --- State ---
const primaries = ref<Item[]>([])
const secondaryOptions = ref<Item[]>([])
const secondaryCache: Record<number, Item[]> = {}

const selectedPrimary = ref<Item | null>(null)
const selectedSecondary = ref<Item | null>(null)
const selectedList = ref<SelectedItem[]>([])

// --- Fetch Functions ---
async function loadPrimaries() {
  try {
    primaries.value = await props.fetchPrimaries() ?? []
    await applyInitialSelection()
  } catch (err) {
    console.error('fetchPrimaries error:', err)
    primaries.value = []
  }
}

async function loadSecondaries(primaryId: number) {
  if (!props.fetchSecondaries) return []

  if (secondaryCache[primaryId]) {
    secondaryOptions.value = secondaryCache[primaryId]
    return secondaryCache[primaryId]
  }

  try {
    const data = await props.fetchSecondaries(primaryId)
    secondaryCache[primaryId] = data ?? []
    secondaryOptions.value = secondaryCache[primaryId]
    return secondaryCache[primaryId]
  } catch (err) {
    console.error('fetchSecondaries error:', err)
    secondaryOptions.value = []
    return []
  }
}

// --- Handlers ---
async function onPrimaryChange() {
  selectedSecondary.value = null
  if (selectedPrimary.value && props.fetchSecondaries) {
    await loadSecondaries(selectedPrimary.value.id)
  } else {
    secondaryOptions.value = []
  }
}

function addCombination() {
  if (!selectedPrimary.value) return

  const exists = selectedList.value.some(
      item =>
          item.primary.id === selectedPrimary.value!.id &&
          (item.secondary?.id ?? 0) === (selectedSecondary.value?.id ?? 0)
  )
  if (exists) return

  selectedList.value.push({
    primary: selectedPrimary.value,
    secondary: secondaryOptions.value.length ? selectedSecondary.value ?? null : undefined,
  })

  selectedSecondary.value = null
  emitSelection()
}

function removeCombination(index: number) {
  selectedList.value.splice(index, 1)
  emitSelection()
}

function emitSelection() {
  const payload: Selection[] = selectedList.value.map(item => ({
    primaryId: item.primary.id,
    secondaryId: item.secondary?.id ?? null,
  }))
  emit('update-selection', payload)
}

// --- Initial Selection ---
async function applyInitialSelection() {
  if (!props.initialSelection?.length || !primaries.value.length) return

  const list: SelectedItem[] = []

  for (const sel of props.initialSelection) {
    const primary = primaries.value.find(p => p.id === sel.primaryId)
    if (!primary) continue

    let secondary: Item | null | undefined = undefined
    if (sel.secondaryId !== undefined && props.fetchSecondaries) {
      const options = await loadSecondaries(primary.id)
      secondary = options.find(s => s.id === sel.secondaryId) ?? null
    }

    list.push({ primary, secondary })
  }

  selectedList.value = list
  emitSelection()
}

// --- Lifecycle ---
onMounted(() => void loadPrimaries())
watch(() => props.initialSelection, () => void applyInitialSelection(), { deep: true })
</script>

<style scoped lang="scss">
.two-stage-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 1rem;
  border: 1px solid var(--border-soft);

  &__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-end;
  }

  &__group { flex: 1 1 220px; }

  &__add { padding: 0.5rem 1rem; }

  &__list { display: flex; flex-wrap: wrap; gap: 0.75rem; }

  &__empty { color: var(--muted-text); font-size: 0.9rem; }
}
</style>