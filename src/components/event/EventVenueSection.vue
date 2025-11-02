<template>
    <section class="uranus-card uranus-hover-section">
        <InlineEditorLabel :label-text="t('venue')" :edit-button-text="t('edit')" @edit-started="startEditingVenue" />

        <h2>{{ venueName }}</h2>

        <template v-if="isEditingVenue">
            <div class="event-venue__controls">
                <label class="event-venue__label" for="event-venue-select">{{ t('event_venue_select_label') }}</label>
                <select id="event-venue-select" class="event-venue__select" v-model="selectedVenueId"
                    :disabled="isLoadingVenues">
                    <option :value="null" disabled>{{ t('event_venue_select_placeholder') }}</option>
                    <option v-for="venueOption in venueOptions" :key="venueOption.id" :value="venueOption.id">
                        {{ venueOption.name }}
                    </option>
                </select>
                <p v-if="isLoadingVenues" class="event-venue__empty">{{ t('loading') }}</p>
                <p v-else-if="!venueOptions.length" class="event-venue__empty">{{ t('event_venue_no_options') }}</p>
            </div>
            <div class="event-venue__actions">
                <button type="button" class="uranus-inline-cancel-button" @click="cancelEditingVenue">
                    {{ t('form_cancel') }}
                </button>
                <button type="button" class="uranus-inline-save-button"
                    :disabled="selectedVenueId === null || isLoadingVenues" @click="saveVenue">
                    <span v-if="!isSavingVenue">{{ t('form_save') }}</span>
                    <span v-else>{{ t('saving') }}</span>
                </button>
            </div>
        </template>
        <template v-else>
            <p>
                {{ venueStreet }} {{ venueHouseNumber }}<br />
                {{ venuePostalCode }} {{ venueCity }}
            </p>
        </template>

        <div class="uranus-hover-section">
            <InlineEditorLabel :label-text="t('space')" :edit-button-text="t('edit')"
                @edit-started="startEditingSpace" />

            <p>{{ spaceName }} ({{ spaceCapacityDisplay }} {{ t('event_capacity_label') }})</p>

            <template v-if="isEditingSpace">
                <div class="event-space__controls">
                    <label class="event-space__label" for="event-space-select">{{ t('event_space_select_label')
                        }}</label>
                    <select id="event-space-select" class="event-space__select" v-model="selectedSpaceId"
                        :disabled="isLoadingSpaces">
                        <option :value="null" disabled>{{ t('event_space_select_placeholder') }}</option>
                        <option v-for="spaceOption in spaceOptions" :key="spaceOption.id" :value="spaceOption.id">
                            {{ spaceOption.name }}
                        </option>
                    </select>
                    <p v-if="isLoadingSpaces" class="event-space__empty">{{ t('loading') }}</p>
                    <p v-else-if="!spaceOptions.length" class="event-space__empty">{{ t('event_space_no_options') }}</p>
                </div>
                <div class="event-space__actions">
                    <button type="button" class="uranus-inline-cancel-button" @click="cancelEditingSpace">
                        {{ t('form_cancel') }}
                    </button>
                    <button type="button" class="uranus-inline-save-button"
                        :disabled="selectedSpaceId === null || isLoadingSpaces" @click="saveSpace">
                        <span v-if="!isSavingSpace">{{ t('form_save') }}</span>
                        <span v-else>{{ t('saving') }}</span>
                    </button>
                </div>
            </template>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import InlineEditorLabel from "@/components/InlineEditorLabel.vue"

const props = defineProps<{
    eventId: number
    organizerId: number | null
    venueId: number | null
    venueName: string
    venueStreet: string
    venueHouseNumber: string
    venuePostalCode: string
    venueCity: string
    spaceId: number | null
    spaceName: string
    spaceTotalCapacity: number | null
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditingVenue = ref(false)
const selectedVenueId = ref<number | null>(props.venueId ?? null)
const venueOptions = ref<Array<{ id: number; name: string }>>([])
const isLoadingVenues = ref(false)
const isSavingVenue = ref(false)

const isEditingSpace = ref(false)
const selectedSpaceId = ref<number | null>(props.spaceId ?? null)
const spaceOptions = ref<Array<{ id: number; name: string }>>([])
const isLoadingSpaces = ref(false)
const isSavingSpace = ref(false)

const spaceCapacityDisplay = computed(() => {
    if (props.spaceTotalCapacity == null || Number.isNaN(props.spaceTotalCapacity)) {
        return '—'
    }
    return String(props.spaceTotalCapacity)
})

watch(
    () => props.venueId,
    (value) => {
        if (!isEditingVenue.value) {
            selectedVenueId.value = value ?? null
        }
    }
)

watch(
    () => props.spaceId,
    (value) => {
        if (!isEditingSpace.value) {
            selectedSpaceId.value = value ?? null
        }
    }
)

const fetchVenueOptions = async () => {
    if (!props.organizerId) {
        venueOptions.value = []
        return
    }

    isLoadingVenues.value = true
    try {
        const { data } = await apiFetch<Array<{ id: number; name: string }>>(
            `/api/choosable-venues/organizer/${props.organizerId}`
        )
        venueOptions.value = Array.isArray(data) ? data : []
    } catch (err) {
        console.error('Failed to load venues', err)
        venueOptions.value = []
    } finally {
        isLoadingVenues.value = false
    }
}

const fetchSpaceOptions = async (venueId: number | null) => {
    if (venueId === null) {
        spaceOptions.value = []
        return
    }

    isLoadingSpaces.value = true
    try {
        const { data } = await apiFetch<Array<{ id: number; name: string }>>(
            `/api/choosable-spaces/venue/${venueId}`
        )
        spaceOptions.value = Array.isArray(data) ? data : []
    } catch (err) {
        console.error('Failed to load spaces', err)
        spaceOptions.value = []
    } finally {
        isLoadingSpaces.value = false
    }
}

const startEditingVenue = async () => {
    selectedVenueId.value = props.venueId ?? null
    isEditingVenue.value = true
    if (!venueOptions.value.length) {
        await fetchVenueOptions()
    }
}

const cancelEditingVenue = () => {
    selectedVenueId.value = props.venueId ?? null
    isEditingVenue.value = false
}

const saveVenue = async () => {
    if (selectedVenueId.value === null) {
        isEditingVenue.value = false
        return
    }

    isSavingVenue.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/venue`, {
            method: 'PUT',
            body: JSON.stringify({
                venue_id: selectedVenueId.value,
            }),
        })
        isEditingVenue.value = false
        emit('updated')
    } catch (err) {
        console.error('Failed to update venue', err)
        isEditingVenue.value = false
    } finally {
        isSavingVenue.value = false
    }
}

const startEditingSpace = async () => {
    selectedSpaceId.value = props.spaceId ?? null
    isEditingSpace.value = true
    if (!spaceOptions.value.length) {
        await fetchSpaceOptions(props.venueId ?? null)
    }
}

const cancelEditingSpace = () => {
    selectedSpaceId.value = props.spaceId ?? null
    isEditingSpace.value = false
}

const saveSpace = async () => {
    if (selectedSpaceId.value === null) {
        isEditingSpace.value = false
        return
    }

    isSavingSpace.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/space`, {
            method: 'PUT',
            body: JSON.stringify({
                space_id: selectedSpaceId.value,
            }),
        })
        isEditingSpace.value = false
        emit('updated')
    } catch (err) {
        console.error('Failed to update space', err)
        isEditingSpace.value = false
    } finally {
        isSavingSpace.value = false
    }
}
</script>

<style scoped lang="scss">
.event-venue {
    background: var(--card-bg);
    border-radius: 24px;
    padding: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
}

.event-venue__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
}

.event-venue__edit {
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-venue:hover .event-venue__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-venue__controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.event-venue__label {
    font-weight: 600;
    color: var(--color-text);
    text-align: left;
}

.event-venue__select {
    width: 100%;
    padding: 0.65rem 0.85rem;
    border-radius: 12px;
    border: 1px solid var(--input-border);
    background: var(--input-bg);
    font-size: 1rem;
    color: var(--color-text);
}

.event-venue__empty {
    margin: 0;
    font-style: italic;
    color: var(--muted-text);
}

.event-venue__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-venue__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-venue__button--cancel {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-space {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.event-space__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
}

.event-space__text {
    margin: 0;
    color: var(--muted-text);
}

.event-space__edit {
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-space:hover .event-space__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-space__controls {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.event-space__label {
    font-weight: 600;
    color: var(--color-text);
    text-align: left;
}

.event-space__select {
    width: 100%;
    padding: 0.6rem 0.85rem;
    border-radius: 12px;
    border: 1px solid var(--input-border);
    background: var(--input-bg);
    font-size: 1rem;
    color: var(--color-text);
}

.event-space__empty {
    margin: 0;
    font-style: italic;
    color: var(--muted-text);
}

.event-space__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-space__button {
    @include form-primary-button($padding-y: 0.45rem, $padding-x: 1.2rem);
}

.event-space__button--cancel {
    @include form-secondary-button($padding-y: 0.45rem, $padding-x: 1.2rem);
}
</style>
