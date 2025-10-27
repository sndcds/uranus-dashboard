<template>
  <section class="two-stage-list">
    <header class="two-stage-list__header" v-if="editable && isEditing">
      <h3 class="two-stage-list__title">{{ labelPrimary }}</h3>
      <button class="two-stage-list__add" @click.prevent="addCombination" :disabled="!selectedPrimary">
        {{ t('add') }}
      </button>
    </header>

    <div v-if="editable && isEditing" class="two-stage-list__controls">
      <div class="two-stage-list__group">
        <label class="two-stage-list__label" for="two-stage-primary">{{ labelPrimary }}</label>
        <select
          id="two-stage-primary"
          class="two-stage-list__select"
          v-model="selectedPrimary"
          @change="onPrimaryChange"
        >
          <option disabled :value="null">{{ placeholderPrimary }}</option>
          <option v-for="item in primaries" :key="item.id" :value="item">{{ item.name }}</option>
        </select>
      </div>

      <div class="two-stage-list__group" v-if="selectedPrimary && secondaryOptions.length">
        <label class="two-stage-list__label" for="two-stage-secondary">{{ labelSecondary }}</label>
        <select
          id="two-stage-secondary"
          class="two-stage-list__select"
          v-model="selectedSecondary"
        >
          <option disabled :value="null">{{ placeholderSecondary }}</option>
          <option v-for="item in secondaryOptions" :key="item.id" :value="item">{{ item.name }}</option>
        </select>
      </div>
    </div>

    <div class="two-stage-list__list">
      <ComboTagComponent
        v-for="(item, index) in selectedList"
        :key="item.primary.id + '-' + (item.secondary?.id ?? 0)"
        :label="item.secondary ? `${item.primary.name} / ${item.secondary.name}` : item.primary.name"
        theme="light"
        :editable="editable && isEditing"
        @remove="onRemove(index)"
      />
      <p v-if="!selectedList.length" class="two-stage-list__empty">{{ t('none_selected') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ComboTagComponent from '@/components/ComboTagComponent.vue'

interface Item { id: number; name: string }
export interface Selection { primaryId: number; secondaryId?: number | null }
interface SelectedItem { primary: Item; secondary?: Item | null }

interface Props {
  fetchPrimaries: () => Promise<Item[]>
  fetchSecondaries?: (primaryId: number) => Promise<Item[]>
  initialSelection?: Selection[]
  labelPrimary?: string
  labelSecondary?: string
  placeholderPrimary?: string
  placeholderSecondary?: string
  editable?: boolean
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  labelPrimary: 'Primary',
  labelSecondary: 'Secondary',
  placeholderPrimary: 'Select primary',
  placeholderSecondary: 'Select secondary',
  editable: true,
  isEditing: false,
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

// --- Fetch functions ---
async function loadPrimaries() {
  try {
    primaries.value = (await props.fetchPrimaries()) ?? []
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
      item => item.primary.id === selectedPrimary.value!.id &&
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

function onRemove(index: number) {
  if (props.editable && props.isEditing) removeCombination(index)
}

function emitSelection() {
  const payload: Selection[] = selectedList.value.map(item => ({
    primaryId: item.primary.id,
    secondaryId: item.secondary?.id ?? null,
  }))
  emit('update-selection', payload)
}

// --- Apply initial selection safely ---
async function applyInitialSelection() {
  if (!props.initialSelection?.length || !primaries.value.length) return

  const list: SelectedItem[] = []
  await Promise.all(
      props.initialSelection.map(async sel => {
        const primary = primaries.value.find(p => p.id === sel.primaryId)
        if (!primary) return
        let secondary: Item | null | undefined = undefined
        if (sel.secondaryId !== undefined && props.fetchSecondaries) {
          const options = secondaryCache[primary.id] ?? await loadSecondaries(primary.id)
          secondary = options.find(s => s.id === sel.secondaryId) ?? null
        }
        list.push({ primary, secondary })
      })
  )

  selectedList.value = list
  emitSelection()
}

// --- Lifecycle ---
onMounted(() => void loadPrimaries())
</script>

<style scoped lang="scss">
.two-stage-list {
  background: var(--card-bg);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.5vw, 1.4rem);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  &__title {
    margin: 0;
    font-size: clamp(1.05rem, 2.5vw, 1.2rem);
    color: var(--color-text);
    font-weight: 600;
  }

  &__controls {
    display: grid;
    gap: 0.9rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__label {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--color-text);
  }

  &__select {
    @include form-control();
  }

  &__add {
    @include form-primary-button($padding-y: 0.55rem, $padding-x: 1.4rem);
    margin-left: auto;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  &__empty {
    margin: 0;
    color: var(--muted-text);
    font-size: 0.9rem;
  }
}
</style>