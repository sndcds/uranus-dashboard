<template>

    <template v-if="effectiveEditing">
      <div class="tag-manager">

        <div class="tag-manager__add">
          <input
              v-model="newTagName"
              type="text"
              class="tag-manager__input"
              :placeholder="labels.placeholder"
              @keydown.enter.prevent="addDraftTag"
          />
          <!--button type="button" class="tag-manager__add-button" @click="addDraftTag">
            {{ labels.add }}
          </button-->
        </div>

        <div class="tag-manager__chip-list">
          <span
              v-for="(tag, index) in draftTags"
              :key="`${tag}-${index}`"
              class="uranus-dashboard-chip removable tags"
          >
            {{ tag }}
            <button
                type="button"
                class="uranus-dashboard-chip-close tags"
                @click="removeDraftTag(index)"
            >
              ×
            </button>
          </span>
          <span v-if="!draftTags.length" class="uranus-not-set-info">
            {{ labels.empty }}
          </span>
        </div>

        <p v-if="error" class="tag-manager__error">{{ error }}</p>

        <div class="tag-manager__actions">
          <button
              type="button"
              class="uranus-inline-cancel-button"
              @click="cancelEditing"
              :disabled="isSaving"
          >
            {{ labels.cancel }}
          </button>

          <button
              type="button"
              class="uranus-inline-save-button"
              :disabled="isSaving"
              @click="handleSave"
          >
            <span v-if="!isSaving">{{ labels.save }}</span>
            <span v-else>{{ labels.saving }}</span>
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="displayTags.length" class="tag-manager__chip-list tag-manager__chip-list--readonly">
        <span
            v-for="(tag, index) in displayTags"
            :key="`${tag}-${index}`"
            class="uranus-dashboard-chip tags">
         {{ tag }}
        </span>
      </div>
      <p v-else class="uranus-not-set-info">{{ labels.empty }}</p>
    </template>

</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    tags?: string[]
    isSaving?: boolean
    error?: string
    title?: string
    editLabel?: string
    emptyLabel?: string
    addPlaceholder?: string
    addButtonLabel?: string
    saveLabel?: string
    cancelLabel?: string
    savingLabel?: string
    isEditing?: boolean
  }>(),
  {
    tags: () => [],
    isSaving: false,
    error: '',
    title: '',
    editLabel: '',
    emptyLabel: '',
    addPlaceholder: '',
    addButtonLabel: '',
    saveLabel: '',
    cancelLabel: '',
    savingLabel: '',
    isEditing: undefined
  }
)

const emit = defineEmits<{
  (e: 'save', tags: string[]): void
  (e: 'cancel'): void
}>()

const { t } = useI18n({ useScope: 'global' })

// Internal editing state (used only if parent does not control via prop)
const internalEditing = ref(false)
const draftTags = ref<string[]>([])
const newTagName = ref('')

// Compute effective editing state
const effectiveEditing = computed(() => props.isEditing ?? internalEditing.value)

// Labels
const labels = computed(() => ({
  title: props.title || t('event_teaser_tags'),
  edit: props.editLabel || t('event_tags_edit'),
  empty: props.emptyLabel || t('tag_no_tags'),
  placeholder: props.addPlaceholder || t('tag_select_placeholder'),
  add: props.addButtonLabel || t('tag_selector_add'),
  save: props.saveLabel || t('save'),
  cancel: props.cancelLabel || t('cancel'),
  saving: props.savingLabel || t('saving')
}))

// Normalize tags
const normalizeTag = (value: string): string => value.replace(/\s+/g, ' ').trim()
const normalizedList = (tags?: string[]): string[] =>
  Array.from(
    new Set(
      (tags ?? [])
          .map((tag) => (typeof tag === 'string' ? normalizeTag(tag) : normalizeTag(String(tag))))
          .filter((tag) => tag.length > 0)
    )
  )

const displayTags = computed(() => normalizedList(props.tags))

// --- Editing control ---
const startEditing = () => {
  draftTags.value = [...displayTags.value]
  newTagName.value = ''
  if (props.isEditing === undefined) {
    internalEditing.value = true
  }
}

const cancelEditing = () => {
  draftTags.value = []
  newTagName.value = ''
  if (props.isEditing === undefined) {
    internalEditing.value = false
  }
  emit('cancel')
}

// --- Tag actions ---
const addDraftTag = () => {
  const normalized = normalizeTag(newTagName.value)
  if (!normalized) return
  if (!draftTags.value.includes(normalized)) {
    draftTags.value.push(normalized)
  }
  newTagName.value = ''
}

const removeDraftTag = (index: number) => {
  draftTags.value.splice(index, 1)
}

const handleSave = () => {
  const payload = normalizedList(draftTags.value)
  emit('save', payload)
}

// --- Watchers ---
watch(
  () => props.tags,
  () => {
    if (!effectiveEditing.value) {
      draftTags.value = [...displayTags.value]
    }
  },
  { immediate: true }
)

watch(
  () => props.isSaving,
  (newVal, oldVal) => {
    if (oldVal && !newVal && !props.error && props.isEditing === undefined) {
      internalEditing.value = false
      draftTags.value = []
      newTagName.value = ''
    }
  }
)

const error = computed(() => props.error)
</script>

<style scoped lang="scss">
.tag-manager__chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-manager__chip-list--readonly {
  justify-content: start;
}

.tag-manager__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.1);
  color: var(--color-text);
  font-size: 0.9rem;
}

.tag-manager__chip-remove {
  border: none;
  background: transparent;
  color: var(--uranus-muted-text);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.tag-manager__chip-remove:hover {
  color: var(--color-text);
}

.tag-manager__add {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.tag-manager__input {
  flex: 1;
  margin-top: 8px;
}

.tag-manager {
  display: flex;
  flex-direction: column;
  gap: var(--uranus-grid-gap);
}

.tag-manager__error {
  margin: 0;
}

.tag-manager__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

</style>
