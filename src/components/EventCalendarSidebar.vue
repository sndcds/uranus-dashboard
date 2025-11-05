<template>
    <aside class="calendar-sidebar">
        <div class="calendar-sidebar__header">
            <h2>{{ filtersTitle }}</h2>
            <p>{{ filtersSubtitle }}</p>
        </div>

        <div class="calendar-sidebar__section calendar-sidebar__section--search">
            <label class="calendar-sidebar__label" :for="searchId">{{ searchLabel }}</label>
            <input :id="searchId" type="search" :placeholder="searchPlaceholder"
                v-model="searchQueryModel" :disabled="isLoading" />
        </div>

        <div class="calendar-sidebar__section calendar-sidebar__section--dates">
            <label class="calendar-sidebar__label" :for="dateId">{{ dateLabel }}</label>
            <div class="calendar-sidebar__date-controls">
                <input :id="dateId" type="date" :value="tempStartDate" :max="lastAvailableDate"
                    :disabled="isLoading" @blur="onDateConfirm('start', $event)"
                    @keyup.enter="onDateConfirm('start', $event)" />
                <div class="calendar-sidebar__end-date">
                    <label class="calendar-sidebar__sublabel" :for="endDateId">{{ endDateLabel }}</label>
                    <input :id="endDateId" type="date" :value="tempEndDate"
                        :min="selectedDate ?? firstAvailableDate" :max="lastAvailableDate" :disabled="isLoading"
                        @blur="onDateConfirm('end', $event)" @keyup.enter="onDateConfirm('end', $event)" />
                </div>
                <button type="button" class="calendar-btn calendar-btn--ghost calendar-sidebar__all-dates"
                    :disabled="isLoading || (!selectedDate && !selectedEndDate)" @click="clearDateFilters()">
                    {{ showAllDatesLabel }}
                </button>
            </div>
        </div>

        <div class="calendar-sidebar__section calendar-sidebar__section--types">
            <label class="calendar-sidebar__label" :for="typeId">{{ typeLabel }}</label>
            <select :id="typeId" v-model="selectedTypeModel"
                :disabled="isLoading || isTypesLoading || typeOptions.length === 0">
                <option value="all">{{ allCategoriesLabel }}</option>
                <option v-for="type in typeOptions" :key="type" :value="type">
                    {{ type }}
                </option>
            </select>
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
    searchId: string
    dateId: string
    endDateId: string
    typeId: string
    searchQuery: string
    selectedType: 'all' | string
    selectedDate: string | null
    selectedEndDate: string | null
    tempStartDate: string | null
    tempEndDate: string | null
    isLoading: boolean
    isTypesLoading: boolean
    typeOptions: string[]
    lastAvailableDate: string | undefined
    firstAvailableDate: string | undefined
    filtersActive: boolean
}

interface Emits {
    (e: 'update:searchQuery', value: string): void
    (e: 'update:selectedType', value: 'all' | string): void
    (e: 'update:selectedDate', value: string | null): void
    (e: 'update:selectedEndDate', value: string | null): void
    (e: 'update:tempStartDate', value: string | null): void
    (e: 'update:tempEndDate', value: string | null): void
    (e: 'date-confirm', which: 'start' | 'end', event: Event): void
    (e: 'clear-date-filters'): void
    (e: 'reset-filters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n({ useScope: 'global' })

// Computed properties for v-model support
const searchQueryModel = computed({
    get: () => props.searchQuery,
    set: (value: string) => emit('update:searchQuery', value.trim())
})

const selectedTypeModel = computed({
    get: () => props.selectedType,
    set: (value: 'all' | string) => emit('update:selectedType', value)
})

const filtersTitle = computed(() => t('events_calendar_filters_title'))
const filtersSubtitle = computed(() => t('events_calendar_filters_subtitle'))
const searchLabel = computed(() => t('events_calendar_search_label'))
const searchPlaceholder = computed(() => t('events_calendar_search_placeholder'))
const dateLabel = computed(() => t('events_calendar_date_label'))
const endDateLabel = computed(() => t('events_calendar_end_date_label'))
const typeLabel = computed(() => t('events_calendar_type_label'))
const showAllDatesLabel = computed(() => t('events_calendar_all_dates'))
const allCategoriesLabel = computed(() => t('events_calendar_all_categories'))
const resetFiltersLabel = computed(() => t('events_calendar_reset_filters'))

const onDateConfirm = (which: 'start' | 'end', event: Event) => {
    emit('date-confirm', which, event)
}

const clearDateFilters = () => {
    emit('clear-date-filters')
}

const resetFilters = () => {
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