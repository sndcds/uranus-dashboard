<template>
    <div class="event-url-section">
        <div class="add-link-form">
            <h3 class="event-links-title">{{ t('event_links_title') }}</h3>

            <div class="form-grid">
                <div class="form-field">
                    <label for="link-url">{{ t('event_link_url') }}</label>
                    <input id="link-url" v-model="newLink.url" type="url"
                        :placeholder="t('event_link_url_placeholder')" />
                </div>
                <div class="form-field">
                    <label for="link-title">{{ t('event_link_title') }}</label>
                    <input id="link-title" v-model="newLink.title" type="text"
                        :placeholder="t('event_link_title_placeholder')" />
                </div>
                <div class="form-field">
                    <label for="link-type">{{ t('event_link_type') }}</label>
                    <select id="link-type" v-model="newLink.url_type">
                        <option value="">{{ t('event_link_type_select') }}</option>
                        <option v-for="option in urlTypeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button v-if="isEditing" type="button" class="cancel-edit-button" @click="cancelEdit">
                    {{ t('event_link_cancel_edit') }}
                </button>
                <button type="button" class="add-link-button" @click="addLink" :disabled="!canAddLink">
                    {{ addButtonText }}
                </button>
            </div>

            <div v-if="links.length > 0" class="links-list">
                <div v-for="(link, index) in links" :key="index" class="link-item">
                    <div class="link-info">
                        <span class="link-type">{{ link.title || getUrlTypeLabel(link.url_type) }}</span>
                        <a :href="link.url" target="_blank" rel="noopener noreferrer" class="link-url">
                            {{ link.url }}
                        </a>
                    </div>
                    <div class="link-actions">
                        <button type="button" class="edit-link-button" @click="startEdit(index)" :disabled="isEditing">
                            {{ t('event_link_edit') }}
                        </button>
                        <button type="button" class="remove-link-button" @click="removeLink(index)">
                            {{ t('event_link_remove') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Save button -->
        <div v-if="links.length > 0" class="save-actions">
            <button type="button" class="save-button" @click="saveLinks" :disabled="isSaving">
                <span v-if="!isSaving">{{ t('event_links_save') }}</span>
                <span v-else>{{ t('saving') }}</span>
            </button>
        </div>

        <!-- Error message -->
        <div v-if="error" class="error-message">
            {{ error }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

interface Props {
    eventId: number
}

interface Link {
    url: string
    title: string
    url_type: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    updated: []
}>()

const { t } = useI18n({ useScope: 'global' })

// Form state
const newLink = ref<Link>({
    url: '',
    title: '',
    url_type: ''
})

// Links list
const links = ref<Link[]>([])

// UI state
const isSaving = ref(false)
const error = ref<string>('')
const editingIndex = ref<number | null>(null)

// Computed properties
const canAddLink = computed(() => {
    return newLink.value.url.trim() && newLink.value.title.trim()
})

const isEditing = computed(() => editingIndex.value !== null)

const addButtonText = computed(() => {
    return isEditing.value ? t('event_link_update') : t('event_link_add')
})

// URL type options
const urlTypeOptions = [
    { value: 'website', label: t('event_link_type_website') },
    { value: 'facebook', label: t('event_link_type_facebook') },
    { value: 'instagram', label: t('event_link_type_instagram') },
    { value: 'twitter', label: t('event_link_type_twitter') },
    { value: 'youtube', label: t('event_link_type_youtube') },
    { value: 'ticket', label: t('event_link_type_ticket') },
    { value: 'other', label: t('event_link_type_other') }
]

// Methods
const addLink = () => {
    if (!canAddLink.value) return

    if (isEditing.value && editingIndex.value !== null) {
        // Update existing link
        links.value[editingIndex.value] = {
            url: newLink.value.url.trim(),
            title: newLink.value.title.trim(),
            url_type: newLink.value.url_type
        }
        cancelEdit()
    } else {
        // Add new link
        links.value.push({
            url: newLink.value.url.trim(),
            title: newLink.value.title.trim(),
            url_type: newLink.value.url_type
        })

        // Reset form
        newLink.value = {
            url: '',
            title: '',
            url_type: ''
        }
    }
}

const startEdit = (index: number) => {
    const link = links.value[index]
    if (!link) return

    newLink.value = {
        url: link.url,
        title: link.title,
        url_type: link.url_type
    }
    editingIndex.value = index
}

const cancelEdit = () => {
    newLink.value = {
        url: '',
        title: '',
        url_type: ''
    }
    editingIndex.value = null
}

const removeLink = (index: number) => {
    links.value.splice(index, 1)
}

const getUrlTypeLabel = (urlType: string): string => {
    const option = urlTypeOptions.find(opt => opt.value === urlType)
    return option ? option.label : urlType
}

const saveLinks = async () => {
    if (links.value.length === 0 || isSaving.value) return

    isSaving.value = true
    error.value = ''

    try {
        await apiFetch(`/api/admin/event/${props.eventId}/links`, {
            method: 'POST',
            body: JSON.stringify({
                links: links.value
            })
        })

        // Clear the list after successful save
        links.value = []
        emit('updated')
    } catch (err) {
        console.error('Failed to save links', err)
        error.value = t('event_links_save_error')
    } finally {
        isSaving.value = false
    }
}

// Load existing links on mount (if needed)
onMounted(() => {
    // Could load existing links here if the API supports GET
})
</script>

<style scoped lang="scss">
.event-url-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.event-links-title {
    margin-bottom: 1.5rem;
    color: var(--color-text);
}

.form-grid {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.form-field {
    @include form-group();
}

.form-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

.add-link-button {
    @include form-secondary-button();
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
}

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
    color: white;

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
        color: white;
    }
}

.save-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
}

.save-button {
    @include form-primary-button();
    font-size: 0.9rem;
    padding: 0.75rem 1.5rem;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.error-message {
    @include form-feedback-error();
    text-align: center;
}
</style>
