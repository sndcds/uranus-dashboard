<template>
    <section :class="['tag-manager', { 'tag-manager--editing': isEditing }]">
          <InlineEditorLabel
              :label-text="labels.title"
              :edit-button-text="t('edit')"
              @edit-started="startEditing"
          />

        <template v-if="isEditing">
            <div class="tag-manager__editor">
                <div class="tag-manager__chip-list">
                    <span
                        v-for="(tag, index) in draftTags"
                        :key="`${tag}-${index}`"
                        class="tag-manager__chip"
                    >
                        {{ tag }}
                        <button type="button" class="tag-manager__chip-remove" @click="removeDraftTag(index)">
                            ×
                        </button>
                    </span>
                    <span v-if="!draftTags.length" class="tag-manager__empty">{{ labels.empty }}</span>
                </div>
                <div class="tag-manager__add">
                    <input
                        v-model="newTagName"
                        type="text"
                        class="tag-manager__input"
                        :placeholder="labels.placeholder"
                        @keydown.enter.prevent="addDraftTag"
                    />
                    <button type="button" class="tag-manager__add-button" @click="addDraftTag">
                        {{ labels.add }}
                    </button>
                </div>
                <p v-if="error" class="tag-manager__error">
                    {{ error }}
                </p>
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
                <span v-for="(tag, index) in displayTags" :key="`${tag}-${index}`" class="tag-manager__chip">
                    {{ tag }}
                </span>
            </div>
            <p v-else class="tag-manager__empty">{{ labels.empty }}</p>
        </template>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import InlineEditorLabel from "@/components/InlineEditorLabel.vue";

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
        savingLabel: ''
    }
)

const emit = defineEmits<{
    (e: 'save', tags: string[]): void
    (e: 'cancel'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditing = ref(false)
const draftTags = ref<string[]>([])
const newTagName = ref('')

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

const labels = computed(() => ({
    title: props.title || t('event_teaser_tags'),
    edit: props.editLabel || t('event_tags_edit'),
    empty: props.emptyLabel || t('tag_no_tags'),
    placeholder: props.addPlaceholder || t('tag_select_placeholder'),
    add: props.addButtonLabel || t('tag_selector_add'),
    save: props.saveLabel || t('form_save'),
    cancel: props.cancelLabel || t('form_cancel'),
    saving: props.savingLabel || t('form_saving')
}))

const resetEditor = () => {
    draftTags.value = []
    newTagName.value = ''
}

const startEditing = () => {
    draftTags.value = [...displayTags.value]
    newTagName.value = ''
    isEditing.value = true
}

const cancelEditing = () => {
    isEditing.value = false
    resetEditor()
    emit('cancel')
}

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

watch(
    () => props.tags,
    () => {
        if (!isEditing.value) {
            draftTags.value = [...displayTags.value]
        }
    },
    { immediate: true }
)

watch(
    () => props.isSaving,
    (newVal, oldVal) => {
        if (oldVal && !newVal && !props.error) {
            isEditing.value = false
            resetEditor()
        }
    }
)

const error = computed(() => props.error)
</script>

<style scoped lang="scss">
.tag-manager {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
}

.tag-manager__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.tag-manager__edit {
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.tag-manager:hover .tag-manager__edit,
.tag-manager--editing .tag-manager__edit {
    opacity: 1;
    transform: translateY(0);
}

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
    color: var(--muted-text);
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
}

.tag-manager__add-button {
    @include form-secondary-button($padding-y: 0.45rem, $padding-x: 1rem);
}

.tag-manager__editor {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.tag-manager__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.tag-manager__button {
    display: inline-flex;
}

.tag-manager__button--primary {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.tag-manager__button--secondary {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.tag-manager__empty {
    margin: 0;
    color: var(--muted-text);
    font-style: italic;
}

.tag-manager__error {
    @include form-feedback-error();
    margin: 0;
}

.tag-manager__title {
    margin: 0 0 0.75rem 0;
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.01em;
}
</style>
