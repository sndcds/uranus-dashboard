<template>
    <UranusInlineEditSection :active="isEditingLinks">

        <UranusInlineEditLabel :label-text="t('event_links_title')" :edit-button-text="t('edit')"
            @edit-started="startEditingLinks" />

        <div v-if="isEditingLinks" class="event-url-section__body">
            <div class="add-link-form">
                <div class="form-grid">
                    <div class="form-field">
                        <label for="link-type">{{ t('event_link_type') }}</label>
                        <select id="link-type" v-model="newLink.url_type">
                            <option value="">{{ t('event_link_type_select') }}</option>
                            <option v-for="option in urlTypeOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                    <div class="form-field">
                        <label for="link-title">{{ t('event_link_title') }}</label>
                        <input id="link-title" v-model="newLink.title" type="text"
                            :placeholder="t('event_link_title_placeholder')" />
                    </div>
                    <div class="form-field">
                        <label for="link-url">{{ t('event_link_url') }}</label>
                        <input id="link-url" v-model="newLink.url" type="url"
                            :placeholder="t('event_link_url_placeholder')" />
                    </div>
                </div>
                <div class="form-actions">
                    <button v-if="isEditingExistingLink" type="button" class="cancel-edit-button" @click="cancelEdit">
                        {{ t('event_link_cancel_edit') }}
                    </button>
                    <button type="button" class="add-link-button" @click="addLink" :disabled="!canAddLink">
                        {{ addButtonText }}
                    </button>
                </div>
            </div>

            <div v-if="draftLinks.length" class="links-list">
                <div v-for="(link, index) in draftLinks" :key="index" class="link-item">
                    <div class="link-info">
                        <span class="link-type">{{ link.title || getUrlTypeLabel(link.url_type) }}</span>
                        <a :href="link.url" target="_blank" rel="noopener noreferrer" class="link-url">
                            {{ link.url }}
                        </a>
                    </div>
                    <div class="link-actions">
                        <button type="button" class="edit-link-button" @click="startEdit(index)"
                            :disabled="isEditingExistingLink">
                            {{ t('event_link_edit') }}
                        </button>
                        <button type="button" class="remove-link-button" @click="removeLink(index)">
                            {{ t('event_link_remove') }}
                        </button>
                    </div>
                </div>
            </div>
            <p v-else class="event-url-section__empty">{{ t('event_links_empty') }}</p>

            <div class="event-url-section__actions">
                <button type="button" class="uranus-inline-cancel-button" @click="cancelEditingLinks">
                    {{ t('form_cancel') }}
                </button>
                <button type="button" class="uranus-inline-save-button" @click="saveLinks"
                    :disabled="isSaving || !draftLinks.length">
                    <span v-if="!isSaving">{{ t('event_links_save') }}</span>
                    <span v-else>{{ t('saving') }}</span>
                </button>
            </div>
        </div>
        <div v-else class="event-url-section__body">
            <div v-if="savedLinks.length" class="links-list links-list--readonly">
                <div v-for="(link, index) in savedLinks" :key="index" class="link-item">
                    <div class="link-info">
                        <span class="link-type">{{ link.title || getUrlTypeLabel(link.url_type) }}</span>
                        <a :href="link.url" target="_blank" rel="noopener noreferrer" class="link-url">
                            {{ link.url }}
                        </a>
                    </div>
                </div>
            </div>
            <p v-else class="event-url-section__empty">{{ t('event_links_empty') }}</p>
        </div>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>
    </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue"
import UranusInlineEditSection from "@/components/uranus/UranusInlineEditSection.vue";

interface Props {
    eventId: number
    links?: unknown
}

interface EventLink {
    url: string
    title: string
    url_type: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t, locale } = useI18n({ useScope: 'global' })

const savedLinks = ref<EventLink[]>([])
const draftLinks = ref<EventLink[]>([])
const newLink = ref<EventLink>({ url: '', title: '', url_type: '' })
const isEditingLinks = ref(false)
const editingIndex = ref<number | null>(null)
const isSaving = ref(false)
const error = ref<string>('')
const urlTypeOptions = ref<Array<{ value: string; label: string }>>([])

const canAddLink = computed(() => newLink.value.url.trim().length > 0)
const isEditingExistingLink = computed(() => editingIndex.value !== null)
const addButtonText = computed(() => (isEditingExistingLink.value ? t('event_link_update') : t('event_link_add')))

const urlTypeLookup = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    urlTypeOptions.value.forEach((option) => {
        map[option.value] = option.label
    })
    return map
})

const loadUrlTypes = async () => {
    try {
        const response = await apiFetch<Array<{ id: string; name: string }>>(`/api/choosable-url-types/event?lang=${locale.value}`)

        if (Array.isArray(response.data)) {
            urlTypeOptions.value = response.data.map((item) => ({
                value: item.id,
                label: item.name
            }))
        }
    } catch (err) {
        console.error('Failed to load URL types:', err)
        urlTypeOptions.value = []
    }
}

const resetNewLink = () => {
    newLink.value = { url: '', title: '', url_type: '' }
    editingIndex.value = null
}

const startEditingLinks = () => {
    draftLinks.value = savedLinks.value.map((link) => ({ ...link }))
    resetNewLink()
    error.value = ''
    isSaving.value = false
    isEditingLinks.value = true
}

const cancelEditingLinks = () => {
    resetNewLink()
    draftLinks.value = []
    error.value = ''
    isSaving.value = false
    isEditingLinks.value = false
}

const cancelEdit = () => {
    resetNewLink()
}

const addLink = () => {
    if (!canAddLink.value) return

    const normalized: EventLink = {
        url: newLink.value.url.trim(),
        title: newLink.value.title.trim(),
        url_type: newLink.value.url_type
    }

    if (isEditingExistingLink.value && editingIndex.value !== null) {
        draftLinks.value.splice(editingIndex.value, 1, normalized)
    } else {
        draftLinks.value.push(normalized)
    }

    resetNewLink()
}

const startEdit = (index: number) => {
    const link = draftLinks.value[index]
    if (!link) return

    newLink.value = { ...link }
    editingIndex.value = index
}

const removeLink = (index: number) => {
    draftLinks.value.splice(index, 1)

    if (editingIndex.value !== null) {
        if (editingIndex.value === index) {
            resetNewLink()
        } else if (editingIndex.value > index) {
            editingIndex.value -= 1
        }
    }
}

const getUrlTypeLabel = (urlType: string): string => urlTypeLookup.value[urlType] ?? urlType

const saveLinks = async () => {
    if (!isEditingLinks.value || !draftLinks.value.length || isSaving.value) return

    isSaving.value = true
    error.value = ''

    try {
        await apiFetch(`/api/admin/event/${props.eventId}/links`, {
            method: 'PUT',
            body: JSON.stringify({ links: draftLinks.value })
        })

        savedLinks.value = draftLinks.value.map((link) => ({ ...link }))
        cancelEditingLinks()
        emit('updated')
    } catch (err) {
        console.error('Failed to save links', err)
        error.value = t('event_links_save_error')
    } finally {
        isSaving.value = false
    }
}

const normalizeLinks = (data: unknown): EventLink[] => {
    if (Array.isArray(data)) {
        return data
            .map((raw) => ({
                url: typeof raw?.url === 'string' ? raw.url : '',
                title: typeof raw?.title === 'string' ? raw.title : '',
                url_type: typeof raw?.url_type === 'string' ? raw.url_type : ''
            }))
            .filter((link) => link.url)
    }

    if (data && typeof data === 'object' && 'links' in data) {
        const nested = (data as { links?: unknown }).links ?? []
        return normalizeLinks(nested)
    }

    return []
}

watch(
    () => props.links,
    (value) => {
        savedLinks.value = normalizeLinks(value)
    },
    { immediate: true, deep: true }
)

onMounted(() => {
    loadUrlTypes()
})
</script>

<style scoped lang="scss">
.event-url-section {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.event-url-section__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.event-links-title {
    margin: 0;
    color: var(--color-text);
}

.event-url-section__edit {
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-url-section:hover .event-url-section__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-url-section__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.add-link-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 640px) {
    .form-grid {
        grid-template-columns: 1fr 2fr 2fr;
    }
}

.form-field {
    @include form-group();
}

.form-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

.add-link-button,
.cancel-edit-button {
    @include form-secondary-button();
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
}

.links-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--card-bg);
    border-radius: 12px;
    padding: 0.75rem 0.85rem;
}

.link-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.link-item:hover .link-actions {
    opacity: 1;
    visibility: visible;
}

.link-info {
    display: flex;
    flex-direction: row;
    gap: 0.25rem;
    flex: 1;
}

.link-url {
    color: var(--accent-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
}

.link-type {
    color: var(--muted-text);
}

.link-actions {
    display: flex;
    gap: 0.5rem;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
}

.edit-link-button,
.remove-link-button {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.edit-link-button {
    background: var(--accent-primary);
    color: #fff;

    &:hover:not(:disabled) {
        background: var(--accent-secondary);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.remove-link-button {
    background: rgba(239, 68, 68, 0.1);
    color: rgba(239, 68, 68, 0.9);

    &:hover {
        background: rgba(239, 68, 68, 0.9);
        color: #fff;
    }
}

.event-url-section__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-url-section__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);

    &--cancel {
        @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
    }
}

.event-url-section__empty {
    margin: 0;
    color: var(--muted-text);
    font-size: 0.95rem;
}

.links-list--readonly {
    background: transparent;
    padding: 0;
    gap: 0.5rem;
}

.links-list--readonly .link-item {
    justify-content: flex-start;
}

.links-list--readonly .link-actions {
    display: none;
}

.error-message {
    @include form-feedback-error();
    text-align: center;
}
</style>
