<template>
    <aside class="calendar-sidebar">
        <div class="calendar-sidebar__header">
            <h2>{{ filtersTitle }}</h2>
            <p>{{ filtersSubtitle }}</p>
        </div>

        <div class="calendar-sidebar__section calendar-sidebar__section--search">
            <label class="calendar-sidebar__label" :for="searchId">{{ searchLabel }}</label>
            <input type="search" v-model="searchQueryModel" :id="searchId" :placeholder="searchPlaceholder"
                :disabled="isLoading" @keyup.enter="onSearchEnter" />
        </div>

        <div class="calendar-sidebar__section calendar-sidebar__section--types">
            <label class="calendar-sidebar__label" for="venue-select">{{ t('events_calendar_venue_label') }}</label>
            <select
                id="venue-select"
                v-model="selectedVenueModel"
                :disabled="isLoading || !props.venueCountOptions.length"
                class="calendar-sidebar__select"
            >
                <option value="">{{ t('events_calendar_venue_all_option') }}</option>
                <option v-for="venue in props.venueCountOptions" :key="venue.id" :value="venue.id.toString()">
                    {{ venue.name }}, {{ venue.city }} ({{ venue.event_date_count }})
                </option>
            </select>
        </div>

        <div class="calendar-sidebar__section calendar-sidebar__section--dates">
            <label class="calendar-sidebar__label" :for="dateId">{{ dateLabel }}</label>
            <div class="calendar-sidebar__date-controls">
                <input :id="dateId" type="date" :value="tempStartDate" :disabled="isLoading"
                    @change="onDateConfirm('start', $event)" @blur="onDateConfirm('start', $event)"
                    @keyup.enter="onDateConfirm('start', $event)" />
                <div class="calendar-sidebar__end-date">
                    <label class="calendar-sidebar__sublabel" :for="endDateId">{{ endDateLabel }}</label>
                    <input :id="endDateId" type="date" :value="tempEndDate" :disabled="isLoading"
                        @change="onDateConfirm('end', $event)" @blur="onDateConfirm('end', $event)"
                        @keyup.enter="onDateConfirm('end', $event)" />
                </div>
                <button type="button" class="calendar-btn calendar-btn--ghost calendar-sidebar__all-dates"
                    :disabled="isLoading || (!selectedDate && !selectedEndDate)" @click="clearDateFilters()">
                    {{ showAllDatesLabel }}
                </button>
            </div>
        </div>

        <div class="calendar-sidebar__section calendar-sidebar__section--location">
            <label class="calendar-sidebar__label">{{ locationLabel }}</label>

            <div class="calendar-sidebar__toggle">
                <label class="calendar-sidebar__toggle-label">
                    <input type="checkbox" v-model="showMyLocationModel" :disabled="isLoading"
                        class="calendar-sidebar__toggle-input" />
                    <span class="calendar-sidebar__toggle-slider"></span>
                    <span class="calendar-sidebar__toggle-text">{{ showMyLocationLabel }}</span>
                </label>
            </div>

            <div class="calendar-sidebar__address-search">
                <label class="calendar-sidebar__label" :for="addressSearchId">{{ addressSearchLabel }}</label>
                <div class="calendar-sidebar__address-input-wrapper">
                    <input type="text" v-model="addressQueryModel" :id="addressSearchId"
                        :placeholder="addressSearchPlaceholder" :disabled="isLoading || isGeocodingLoading"
                        @keyup.enter="onAddressSearch" />
                    <button type="button" class="calendar-btn calendar-btn--search"
                        :disabled="!addressQueryModel.trim() || isLoading || isGeocodingLoading"
                        @click="onAddressSearch">
                        {{ searchAddressLabel }}
                    </button>
                </div>
            </div>

            <div v-if="showMyLocation || userLatitude !== null" class="calendar-sidebar__radius">
                <label class="calendar-sidebar__label" for="radius-slider">
                    {{ radiusLabel }}: {{ radiusModel }} km
                </label>

                <input
                    id="radius-slider"
                    type="range"
                    v-model.number="radiusModel"
                    :min="radiusMin"
                    :max="radiusMax"
                    :step="radiusStep"
                    :disabled="isLoading"
                    @mousedown="emit('radius-slide-start')"
                    @mouseup="emit('radius-slide-end')"
                    @touchstart="emit('radius-slide-start')"
                    @touchend="emit('radius-slide-end')"
                    class="calendar-sidebar__range-slider"
                />
                <div class="calendar-sidebar__range-labels">
                    <span>{{ radiusMin }} km</span>
                    <span>{{ radiusMax }} km</span>
                </div>
            </div>
        </div>

        <div class="calendar-sidebar__footer">
            <button type="button" class="calendar-btn calendar-btn--ghost calendar-sidebar__reset"
                :disabled="!filtersActive" @click="resetFilters">
                {{ resetFiltersLabel }}
            </button>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface VenueOption {
    id: number
    name: string
    city: string
    event_date_count: number
}

interface Props {
    searchId: string
    dateId: string
    endDateId: string
    addressSearchId: string
    searchQuery: string
    selectedDate: string | null
    selectedEndDate: string | null
    selectedVenue: VenueOption | null
    tempStartDate: string | null
    tempEndDate: string | null
    isLoading: boolean
    filtersActive: boolean
    showMyLocation: boolean
    locationRadius: number
    isGeocodingLoading: boolean
    userLatitude: number | null
    venueCountOptions: VenueOption[]
}

interface Emits {
    (e: 'update:searchQuery', value: string): void
    (e: 'update:selectedDate', value: string | null): void
    (e: 'update:selectedEndDate', value: string | null): void
    (e: 'update:tempStartDate', value: string | null): void
    (e: 'update:tempEndDate', value: string | null): void
    (e: 'update:showMyLocation', value: boolean): void
    (e: 'update:locationRadius', value: number): void
    (e: 'radius-slide-start'): void
    (e: 'radius-slide-end'): void
    (e: 'date-confirm', which: 'start' | 'end', event: Event): void
    (e: 'clear-date-filters'): void
    (e: 'reset-filters'): void
    (e: 'address-search', payload: { query: string; disableMyLocation: boolean }): void
    (e: 'selected-venue', venue: VenueOption | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n({ useScope: 'global' })

// Computed for v-model binding
const searchQueryModel = computed({
    get: () => internalSearch.value,
    set: (value: string) => {
        internalSearch.value = value
    }
})
const internalSearch = ref(props.searchQuery)

// Keep internalSearch in sync if the prop changes
watch(() => props.searchQuery, (val) => {
    internalSearch.value = val
})

const showMyLocationModel = computed({
    get: () => props.showMyLocation,
    set: (value: boolean) => {
        emit('update:showMyLocation', value)
    }
})

const radiusModel = computed({
    get: () => props.locationRadius,
    set: (value: number) => {
        emit('update:locationRadius', value)
    }
})

const selectedVenueModel = computed({
    get: () => props.selectedVenue?.id?.toString() ?? '',
    set: (value: string) => {
        if (!value) {
            emit('selected-venue', null)
            return
        }

        const id = Number(value)
        if (Number.isNaN(id)) {
            emit('selected-venue', null)
            return
        }

        const venue = props.venueCountOptions.find((item) => item.id === id) ?? null
        emit('selected-venue', venue)
    }
})

// Address search state
const addressQueryModel = ref('')

// Radius slider configuration
const radiusMin = 1
const radiusMax = 100
const radiusStep = 1

const onSearchEnter = () => {
    emit('update:searchQuery', internalSearch.value.trim())
}

const onAddressSearch = () => {
    const query = addressQueryModel.value.trim()
    if (query) {
        emit('address-search', {
            query,
            disableMyLocation: props.showMyLocation
        })
    }
}

const filtersTitle = computed(() => t('events_calendar_filters_title'))
const filtersSubtitle = computed(() => t('events_calendar_filters_subtitle'))
const searchLabel = computed(() => t('events_calendar_search_label'))
const searchPlaceholder = computed(() => t('events_calendar_search_placeholder'))
const dateLabel = computed(() => t('events_calendar_date_label'))
const endDateLabel = computed(() => t('events_calendar_end_date_label'))
const showAllDatesLabel = computed(() => t('events_calendar_all_dates'))
const resetFiltersLabel = computed(() => t('events_calendar_reset_filters'))
const locationLabel = computed(() => t('events_calendar_location_label'))
const showMyLocationLabel = computed(() => t('events_calendar_show_my_location'))
const radiusLabel = computed(() => t('events_calendar_radius_label'))
const addressSearchLabel = computed(() => t('events_calendar_address_search_label'))
const addressSearchPlaceholder = computed(() => t('events_calendar_address_search_placeholder'))
const searchAddressLabel = computed(() => t('events_calendar_search_address_button'))

const onDateConfirm = (which: 'start' | 'end', event: Event) => {
    emit('date-confirm', which, event)
}

const clearDateFilters = () => {
    emit('clear-date-filters')
}

const resetFilters = () => {
    addressQueryModel.value = ''
    emit('reset-filters')
}
</script>

<style scoped lang="scss">
.calendar-sidebar {
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
    background: var(--card-bg, #fff);
    border-radius: 12px;
    padding: clamp(1.25rem, 3vw, 1.75rem);
    border: 0px solid var(--border-soft);
    position: sticky;
    top: 100px;
}

.calendar-sidebar__header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.calendar-sidebar__header h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
}

.calendar-sidebar__header p {
    margin: 0;
    color: var(--muted-text);
    font-size: 0.95rem;
    line-height: 1.5;
}

.calendar-sidebar__section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.calendar-sidebar__label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--muted-text);
}

.calendar-sidebar__sublabel {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--muted-text);
}

.calendar-sidebar__end-date {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.calendar-sidebar__section input,
.calendar-sidebar__section select {
    width: 100%;
    border-radius: 999px;
    border: 1px solid var(--border-soft);
    padding: 0.65rem 1rem;
    background: var(--input-bg);
    font-size: 0.95rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.calendar-sidebar__section input:focus,
.calendar-sidebar__section select:focus {
    outline: none;
    border-color: var(--accent-primary);
}

.calendar-sidebar__section--dates input {
    padding: 0.55rem 0.85rem;
}

.calendar-sidebar__date-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.calendar-sidebar__all-dates {
    width: 100%;
    justify-content: center;
}

.calendar-sidebar__toggle {
    display: flex;
    align-items: center;
}

.calendar-sidebar__toggle-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    user-select: none;
    position: relative;
}

.calendar-sidebar__toggle-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.calendar-sidebar__toggle-slider {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    background-color: var(--border-soft);
    border-radius: 24px;
    transition: background-color 0.3s ease;
    flex-shrink: 0;
}

.calendar-sidebar__toggle-slider::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.calendar-sidebar__toggle-input:checked+.calendar-sidebar__toggle-slider {
    background-color: var(--accent-primary);
}

.calendar-sidebar__toggle-input:checked+.calendar-sidebar__toggle-slider::after {
    transform: translateX(20px);
}

.calendar-sidebar__toggle-input:disabled+.calendar-sidebar__toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
}

.calendar-sidebar__toggle-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text);
}

.calendar-sidebar__address-search {
    margin-top: 0.75rem;
}

.calendar-sidebar__address-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.calendar-sidebar__address-input-wrapper input {
    flex: 1;
    border-radius: 999px;
    border: 1px solid var(--border-soft);
    padding: 0.65rem 1rem;
    background: var(--input-bg);
    font-size: 0.95rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.calendar-sidebar__address-input-wrapper input:focus {
    outline: none;
    border-color: var(--accent-primary);
}

.calendar-sidebar__radius {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-soft);
}

.calendar-sidebar__range-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--border-soft);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
}

.calendar-sidebar__range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.calendar-sidebar__range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.calendar-sidebar__range-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
}

.calendar-sidebar__range-slider::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.calendar-sidebar__range-slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.calendar-sidebar__range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--muted-text);
    margin-top: 0.25rem;
}

.calendar-sidebar__footer {
    margin-top: auto;
}

.calendar-sidebar__reset {
    width: 100%;
    justify-content: center;
}

.calendar-btn {
    border: none;
    background: var(--accent-primary);
    color: #fff;
    padding: 0.55rem 0.85rem;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
}

.calendar-btn--ghost {
    background: rgba(79, 70, 229, 0.08);
    color: var(--accent-primary);
}

.calendar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
}

.calendar-btn:not(:disabled):hover {
    transform: translateY(-1px);
}

@media (max-width: 900px) {
    .calendar-sidebar {
        position: static;
    }
}
</style>
