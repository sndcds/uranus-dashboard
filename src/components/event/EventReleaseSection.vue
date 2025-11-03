<template>
    <section class="uranus-card uranus-hover-section">
        <InlineEditorLabel :label-text="t('event_release_date')" :edit-button-text="t('edit')"
            @edit-started="startEditingRelease" />

        <p v-if="releaseSaveError" class="event-meta__error event-meta__error--global">
            {{ releaseSaveError }}
        </p>

        <div v-if="!isEditingRelease && releaseDisplay" class="event-meta__display">
            <div class="event-meta__row">
                <span class="event-meta__label">{{ releaseDisplay.date }}</span>
                <span v-if="releaseDisplay.label" class="release-status-chip" :class="{
                    'release-status-chip--red': releaseDisplay.id === 1,
                    'release-status-chip--orange': releaseDisplay.id === 2,
                    'release-status-chip--green': releaseDisplay.id === 3,
                    'release-status-chip--blue': releaseDisplay.id === 4,
                    'release-status-chip--pink': releaseDisplay.id === 5
                }">
                    {{ releaseDisplay.label }}
                </span>
            </div>
        </div>

        <div v-if="!isEditingRelease && !releaseDisplay" class="event-meta__empty">
            {{ t('event_release_empty') }}
        </div>

        <div v-if="isEditingRelease" class="event-release__editor">
            <div class="form-group">
                <label for="release-select">{{ t('event_release_select') }}</label>
                <select v-model.number="releaseDraft" id="release-select" :disabled="isLoadingReleases">
                    <option :value="null" disabled>
                        {{ t('event_release_choose') }}
                    </option>
                    <option v-for="release in availableReleases" :key="release.id" :value="release.id">
                        {{ release.name }}
                    </option>
                </select>
                <p v-if="releaseDraftDescription" class="event-release__description">
                    {{ releaseDraftDescription }}
                </p>
            </div>

            <div class="form-group">
                <label for="release-date">{{ t('event_release_date_input') }}</label>
                <input v-model="releaseDateDraft" id="release-date" type="date" class="event-release__date-input" />
            </div>

            <div class="event-meta__actions">
                <button type="button" class="uranus-inline-cancel-button" @click="cancelEditingRelease">
                    {{ t('form_cancel') }}
                </button>
                <button type="button" class="uranus-inline-save-button"
                    :disabled="isSavingRelease || releaseDraft === null" @click="saveRelease">
                    <span v-if="!isSavingRelease">{{ t('form_save') }}</span>
                    <span v-else>{{ t('form_saving') }}</span>
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import InlineEditorLabel from "@/components/InlineEditorLabel.vue"

interface Release {
    id: number
    name: string
    description?: string
    date?: string
}

interface ReleaseDisplay {
    date: string
    label: string
    id: number
}

const props = defineProps<{
    eventId: number
    releaseStatusId?: number | null
    releaseDate?: string | null
    locale: string
}>()

const emit = defineEmits<{ (e: 'updated'): void }>()

const { t } = useI18n({ useScope: 'global' })

const availableReleases = ref<Release[]>([])
const isLoadingReleases = ref(false)
const releaseDraft = ref<number | null>(toNumberOrNull(props.releaseStatusId))
const releaseDateDraft = ref<string>(
    resolveReleaseDate(releaseDraft.value, props.releaseDate)
)
const isEditingRelease = ref(false)
const isSavingRelease = ref(false)
const releaseSaveError = ref<string | null>(null)

const dateFormatter = computed(
    () =>
        new Intl.DateTimeFormat(props.locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
)

const releaseDraftDescription = computed(() => {
    if (releaseDraft.value === null) return ''
    const selected = availableReleases.value.find(r => r.id === releaseDraft.value)
    return selected?.description || ''
})

const releaseDisplay = computed<ReleaseDisplay | null>(() => {
    const statusId = toNumberOrNull(props.releaseStatusId)
    const hasStatus = statusId !== null
    const matchedRelease = hasStatus
        ? availableReleases.value.find(r => r.id === statusId)
        : undefined

    const label = matchedRelease?.name ?? (hasStatus ? t('event_release_status_placeholder', { id: statusId }) : '')

    const dateDisplay =
        formatReleaseDate(props.releaseDate) ||
        formatReleaseDate(matchedRelease?.date ?? null)

    if (!label && !dateDisplay) {
        return null
    }

    return {
        date: dateDisplay || '—',
        label: label || '—',
        id: statusId || 0
    }
})

const loadReleaseStates = async () => {
    isLoadingReleases.value = true
    releaseSaveError.value = null

    try {
        const { data } = await apiFetch<unknown>(`/api/choosable-release-states?lang=${props.locale}`)

        const releases = normalizeReleases(data)
        availableReleases.value = releases

        const statusId = toNumberOrNull(props.releaseStatusId)

        if (!isEditingRelease.value) {
            releaseDraft.value = statusId
            releaseDateDraft.value = resolveReleaseDate(statusId, props.releaseDate)
        } else {
            if (releaseDraft.value === null && statusId !== null) {
                releaseDraft.value = statusId
            }
            if (!releaseDateDraft.value) {
                releaseDateDraft.value = resolveReleaseDate(releaseDraft.value, props.releaseDate)
            }
        }
    } catch (err) {
        console.error('Failed to load releases', err)
        releaseSaveError.value = t('event_release_load_error')
        availableReleases.value = []
    } finally {
        isLoadingReleases.value = false
    }
}

const normalizeReleases = (data: unknown): Release[] => {
    const items: unknown[] = []

    if (Array.isArray(data)) {
        items.push(...data)
    } else if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>
        if (Array.isArray(obj.releases)) {
            items.push(...obj.releases)
        } else if (Array.isArray(obj.data)) {
            items.push(...obj.data)
        }
    }

    return items
        .map((entry) => {
            if (!entry || typeof entry !== 'object') {
                return null
            }

            const raw = entry as Record<string, unknown>
            const idCandidate = toNumberOrNull(raw.id ?? raw.status_id)
            const nameCandidate = typeof raw.name === 'string' ? raw.name : ''

            if (idCandidate === null || !nameCandidate) {
                return null
            }

            const release: Release = {
                id: idCandidate,
                name: nameCandidate,
            }

            if (typeof raw.description === 'string') {
                release.description = raw.description
            }

            if (typeof raw.date === 'string') {
                release.date = raw.date
            }

            return release
        })
        .filter((release): release is Release => release !== null)
}

const startEditingRelease = async () => {
    const statusId = toNumberOrNull(props.releaseStatusId)
    releaseDraft.value = statusId
    releaseDateDraft.value = resolveReleaseDate(statusId, props.releaseDate)
    releaseSaveError.value = null
    isEditingRelease.value = true

    if (availableReleases.value.length === 0) {
        await loadReleaseStates()
    }
}

const cancelEditingRelease = () => {
    isEditingRelease.value = false
    const statusId = toNumberOrNull(props.releaseStatusId)
    releaseDraft.value = statusId
    releaseDateDraft.value = resolveReleaseDate(statusId, props.releaseDate)
    releaseSaveError.value = null
}

const saveRelease = async () => {
    if (!Number.isFinite(props.eventId) || releaseDraft.value === null) {
        releaseSaveError.value = t('event_submit_error_generic')
        return
    }

    isSavingRelease.value = true
    releaseSaveError.value = null

    try {
        const payload: Record<string, unknown> = {
            release_status_id: releaseDraft.value,
        }

        const trimmedDate = normalizeDateInput(releaseDateDraft.value)
        if (trimmedDate) {
            payload.release_date = trimmedDate
        }

        await apiFetch(`/api/admin/event/${props.eventId}/release-status`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })

        isEditingRelease.value = false
        emit('updated')
    } catch (err) {
        console.error('Failed to update event release', err)
        releaseSaveError.value = t('event_submit_error_generic')
    } finally {
        isSavingRelease.value = false
    }
}

watch(
    () => props.releaseStatusId,
    (newId) => {
        if (!isEditingRelease.value) {
            releaseDraft.value = toNumberOrNull(newId)
            releaseDateDraft.value = resolveReleaseDate(releaseDraft.value, props.releaseDate)
        }
    }
)

watch(
    () => props.releaseDate,
    (newDate) => {
        if (!isEditingRelease.value) {
            releaseDateDraft.value = resolveReleaseDate(releaseDraft.value, newDate)
        }
    }
)

onMounted(() => {
    void loadReleaseStates()
})

function toNumberOrNull(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed.length) {
            return null
        }
        const parsed = Number(trimmed)
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

function normalizeDateInput(value: unknown): string {
    if (typeof value !== 'string') {
        return ''
    }

    const trimmed = value.trim()
    if (!trimmed) {
        return ''
    }

    // Already in the expected YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed
    }

    try {
        const parsed = new Date(trimmed)
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().slice(0, 10)
        }
    } catch {
        // Ignore parsing errors and fall back to raw value
    }

    return trimmed
}

function resolveReleaseDate(statusId: number | null, date: unknown): string {
    const explicit = normalizeDateInput(date)
    if (explicit) {
        return explicit
    }

    if (statusId !== null) {
        const fallback = availableReleases.value.find((release) => release.id === statusId)?.date
        const normalizedFallback = normalizeDateInput(fallback)
        if (normalizedFallback) {
            return normalizedFallback
        }
    }

    return ''
}

function formatReleaseDate(value: string | null | undefined): string {
    const trimmed = typeof value === 'string' ? value.trim() : ''
    if (!trimmed) {
        return ''
    }

    try {
        const parsed = new Date(trimmed)
        if (!Number.isNaN(parsed.getTime())) {
            return dateFormatter.value.format(parsed)
        }
    } catch {
        // ignore and fall back to raw value
    }

    return trimmed
}
</script>

<style scoped lang="scss">
.event-meta {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
    }

    &__empty {
        margin: 0;
        color: var(--muted-text);
        font-size: 0.95rem;
    }

    &__display {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    &__row {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    &__label {
        font-size: 1.85rem;
        font-weight: 600;
        color: var(--color-text);
    }

    &__value {
        margin: 0;
        color: var(--color-text);
        font-size: 0.9rem;
        line-height: 1.4;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
    }

    &__error {
        margin: 0;
        color: #b91c1c;
        font-weight: 600;
        font-size: 0.85rem;

        &--global {
            align-self: flex-start;
        }
    }
}

.release-status-chip {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: fit-content;

  &--red {
    background: #fee2e2;
    color: #991b1b;
  }

  &--orange {
    background: #ffedd5;
    color: #9a3412;
  }

  &--green {
    background: #dcfce7;
    color: #166534;
  }

  &--blue {
    background: #dbeafe;
    color: #1e40af;
  }

  &--pink {
    background: #fce7f3;
    color: #9d174d;
  }
}

.event-release {
    &__editor {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    &__description {
        margin: 0.5rem 0 0;
        font-size: 0.85rem;
        color: var(--muted-text);
    }

    &__date-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 0.5rem;
        background: var(--surface-muted);
        color: var(--color-text);
        font-size: 0.95rem;
        transition: border-color 0.2s ease;

        &:hover {
            border-color: var(--accent-primary);
        }

        &:focus-visible {
            outline: 2px solid var(--accent-primary);
            outline-offset: 2px;
        }
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        font-weight: 600;
        font-size: 0.95rem;
    }

    select {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 0.5rem;
        background: var(--surface-muted);
        color: var(--color-text);
        font-size: 0.95rem;
        cursor: pointer;
        transition: border-color 0.2s ease;

        &:hover:not(:disabled) {
            border-color: var(--accent-primary);
        }

        &:focus-visible {
            outline: 2px solid var(--accent-primary);
            outline-offset: 2px;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }
}

@media (min-width: 640px) {
    .event-meta {
        border-radius: 20px;
        padding: 1.25rem;

        &__label {
            font-size: 2rem;
        }
    }
}

@media (min-width: 1024px) {
    .event-meta {
        border-radius: 24px;
        padding: 1.4rem;

        &__label {
            font-size: 2.85rem;
        }

        p {
            font-size: 1rem;
        }
    }
}

@media (min-width: 1280px) {
    .event-meta {
        padding: 1.75rem;
    }
}
</style>
