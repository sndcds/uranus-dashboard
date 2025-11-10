<template>
  <section class="two-stage-list">
    <!-- Editing controls -->
    <div v-if="editable && isEditing" class="two-stage-list__controls">
      <!-- Primary select -->
      <div class="two-stage-list__select">
        <label class="uranus-label-text" for="two-stage-primary">{{ labelPrimary }}</label>
        <input
            id="two-stage-primary"
            v-model="selectedPrimaryName"
            list="primary-options"
            type="text"
            :placeholder="placeholderPrimary"
            @input="onPrimaryInput"
            @change="onPrimaryChange">
        <datalist id="primary-options">
          <option v-for="item in primaries" :key="item.id" :value="item.name">
            {{ item.name }}
          </option>
        </datalist>
      </div>

      <!-- Secondary select (shown only if primary is chosen) -->
      <div v-if="selectedPrimaryId && secondaryOptions.length" class="two-stage-list__select">
        <label class="uranus-label-text" for="two-stage-secondary">{{ labelSecondary }}</label>
        <input
            id="two-stage-secondary"
            v-model="selectedSecondaryName"
            list="secondary-options"
            type="text"
            :placeholder="placeholderSecondary"
            @input="onSecondaryInput">
        <datalist id="secondary-options">
          <option v-for="item in secondaryOptions" :key="item.id" :value="item.name">
            {{ item.name }}
          </option>
        </datalist>
      </div>

        <div style="display: flex; align-items: flex-end; padding-bottom: 8px;" >
            <button
                v-show="selectedPrimaryId"
                class="uranus-button"
                @click.prevent="addCombination"
                :disabled="!selectedPrimaryId"
            >
              {{ t('add') }}
            </button>
        </div>
    </div>

    <!-- Selected combinations list -->
    <div class="two-stage-list__list">
      <ComboTagComponent
          v-for="(item, index) in selectedList"
          :key="`${String(item.primary.id ?? '')}-${String(item.secondary?.id ?? '')}`"
          :label="item.secondary ? `${item.primary.name} / ${item.secondary.name}` : item.primary.name"
          theme="light"
          :editable="editable && isEditing"
          @remove="onRemove(index)"
      />
      <p v-if="!selectedList.length" class="two-stage-list__empty">
        {{ t('none_selected') }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ComboTagComponent from '@/components/ComboTagComponent.vue'

type ItemId = number | string
interface Item {
  id: ItemId
  name: string
}
export interface Selection {
  primaryId: ItemId
  secondaryId?: ItemId | null
}
interface SelectedItem {
  primary: Item
  secondary?: Item | null
}

interface Props {
  fetchPrimaries: () => Promise<Item[]>
  fetchSecondaries?: (primaryId: ItemId) => Promise<Item[]>
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
const secondaryCache: Record<string, Item[]> = {}

const selectedPrimaryId = ref<ItemId | null>(null)
const selectedPrimaryName = ref<string>('')
const selectedSecondaryId = ref<ItemId | null>(null)
const selectedSecondaryName = ref<string>('')
const selectedList = ref<SelectedItem[]>([])

// --- Fetch ---
async function loadPrimaries() {
  try {
    primaries.value = await props.fetchPrimaries()
    await applyInitialSelection()
  } catch (err) {
    console.error('fetchPrimaries error:', err)
    primaries.value = []
  }
}

async function loadSecondaries(primaryId: ItemId | null | undefined) {
  if (!props.fetchSecondaries || primaryId == null) {
    secondaryOptions.value = []
    return []
  }

  const key = String(primaryId)
  if (secondaryCache[key]) {
    secondaryOptions.value = secondaryCache[key]
    return secondaryCache[key]
  }

  try {
    const data = await props.fetchSecondaries(primaryId)
    secondaryCache[key] = data ?? []
    secondaryOptions.value = secondaryCache[key]
    return data
  } catch (err) {
    console.error('fetchSecondaries error:', err)
    secondaryOptions.value = []
    return []
  }
}

// --- Handlers ---
function onPrimaryInput() {
  // Find matching primary by name
  const primary = primaries.value.find(p => p.name === selectedPrimaryName.value)
  if (primary) {
    selectedPrimaryId.value = primary.id
  } else {
    selectedPrimaryId.value = null
  }
}

async function onPrimaryChange() {
  selectedSecondaryId.value = null
  selectedSecondaryName.value = ''
  if (selectedPrimaryId.value && props.fetchSecondaries) {
    await loadSecondaries(selectedPrimaryId.value)
  } else {
    secondaryOptions.value = []
  }
}

function onSecondaryInput() {
  // Find matching secondary by name
  const secondary = secondaryOptions.value.find(s => s.name === selectedSecondaryName.value)
  if (secondary) {
    selectedSecondaryId.value = secondary.id
  } else {
    selectedSecondaryId.value = null
  }
}

function addCombination() {
  if (!selectedPrimaryId.value) return

  const primary = primaries.value.find(p => p.id === selectedPrimaryId.value)
  const secondary = secondaryOptions.value.find(s => s.id === selectedSecondaryId.value) ?? null
  if (!primary) return

  const exists = selectedList.value.some(
      item =>
          String(item.primary.id) === String(primary.id) &&
          String(item.secondary?.id ?? '') === String(secondary?.id ?? '')
  )
  if (exists) return

  selectedList.value.push({ primary, secondary })
  
  // Reset both primary and secondary inputs
  selectedPrimaryId.value = null
  selectedPrimaryName.value = ''
  selectedSecondaryId.value = null
  selectedSecondaryName.value = ''
  secondaryOptions.value = []
  
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

// --- Initialization ---
async function applyInitialSelection() {
  if (!props.initialSelection?.length) return

  const list: SelectedItem[] = []

  for (const sel of props.initialSelection) {
    const primary = primaries.value.find(p => String(p.id) === String(sel.primaryId))
    if (!primary) continue

    let secondary: Item | null | undefined = undefined
    if (sel.secondaryId != null && props.fetchSecondaries) {
      const options =
          secondaryCache[String(primary.id)] ?? (await loadSecondaries(primary.id))
      secondary = options.find(s => String(s.id) === String(sel.secondaryId)) ?? null
    }

    list.push({ primary, secondary })
  }

  selectedList.value = list
  emitSelection()
}

onMounted(loadPrimaries)
</script>

<style scoped lang="scss">
.two-stage-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &__controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.9rem;
    }

    &__select {
        display: flex;
        flex-direction: column;
        gap: 4px;
        justify-content: flex-end;
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