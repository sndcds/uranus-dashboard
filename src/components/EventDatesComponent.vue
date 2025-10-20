<template>
    <section class="event-section">
        <header class="event-section__header">
            <h2>{{ t('event_section_dates') }}</h2>
            <p>{{ t('event_section_dates_subtitle') }}</p>
        </header>

        <form class="event-section__form">
            <div class="event-dates">
                <div v-for="(date, index) in eventDates" :key="index" class="event-dates__card">
                    <div class="event-dates__meta">
                        <span class="badge">#{{ index + 1 }}</span>
                        <button
                            type="button"
                            class="link"
                            @click="removeDate(index)"
                            v-if="eventDates.length > 1"
                        >
                            {{ t('event_remove_date') }}
                        </button>
                    </div>
                    <div class="event-dates__grid">
                        <div class="form-field">
                            <label :for="`start-date-${index}`">{{ t('event_start_date') }}</label>
                            <input :id="`start-date-${index}`" v-model="date.startDate" type="date" required />
                        </div>

                        <div class="form-field">
                            <label :for="`start-time-${index}`">{{ t('event_start_time') }}</label>
                            <input :id="`start-time-${index}`" v-model="date.startTime" type="time" required />
                        </div>

                        <div class="form-field">
                            <label :for="`end-date-${index}`">{{ t('event_end_date') }}</label>
                            <input :id="`end-date-${index}`" v-model="date.endDate" type="date" />
                        </div>

                        <div class="form-field">
                            <label :for="`end-time-${index}`">{{ t('event_end_time') }}</label>
                            <input :id="`end-time-${index}`" v-model="date.endTime" type="time" required />
                        </div>

                        <div class="form-field">
                            <label :for="`entry-time-${index}`">{{ t('event_entry_time') }}</label>
                            <input :id="`entry-time-${index}`" v-model="date.entryTime" type="time" />
                        </div>

                        <div class="form-field">
                            <label :for="`space-${index}`">{{ t('event_space_label') }}</label>
                            <select :id="`space-${index}`" v-model="date.spaceId" required>
                                <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                                <option v-for="sp in spaces" :key="sp.id" :value="sp.id">
                                    {{ sp.name }}
                                </option>
                            </select>
                        </div>

                        <div class="form-field form-field--checkbox">
                            <label :for="`all-day-${index}`">
                                <input type="checkbox" :id="`all-day-${index}`" v-model="date.allDayEvent" />
                                {{ t('event_all_day') }}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="event-section__actions">
                <button type="button" class="secondary" @click="addDate">
                    {{ t('event_add_date') }}
                </button>
            </div>
        </form>
    </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

interface EventDate {
    startDate: string
    endDate: string | null
    startTime: string
    endTime: string
    entryTime: string | null
    spaceId: number | null
    allDayEvent: boolean
}

const spaces = ref<Array<{ id: number; name: string }>>([])

const eventDates = ref<EventDate[]>([
    {
        startDate: '',
        endDate: null,
        startTime: '',
        endTime: '',
        entryTime: null,
        spaceId: null,
        allDayEvent: false,
    },
])

const addDate = () => {
    eventDates.value.push({
        startDate: '',
        endDate: null,
        startTime: '',
        endTime: '',
        entryTime: null,
        spaceId: null,
        allDayEvent: false,
    })
}

const removeDate = (index: number) => {
    eventDates.value.splice(index, 1)
}
</script>

<style scoped lang="scss">
.event-section {
    background: #ffffff;
    border-radius: 24px;
    padding: clamp(1.75rem, 4vw, 2.5rem);
    box-shadow: 0 24px 50px rgba(31, 41, 55, 0.14);
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 3vw, 1.75rem);
}

.event-section__header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    h2 {
        font-size: clamp(1.35rem, 2.5vw, 1.75rem);
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    p {
        margin: 0;
        color: rgba(55, 65, 81, 0.8);
        line-height: 1.6;
        font-size: 0.98rem;
    }
}

.event-section__form {
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
}

.event-dates {
    display: grid;
    gap: clamp(1rem, 2vw, 1.5rem);
}

.event-dates__card {
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 20px;
    padding: clamp(1.2rem, 2.4vw, 1.6rem);
    background: rgba(248, 250, 252, 0.85);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-dates__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: rgba(55, 65, 81, 0.9);
}

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: rgba(79, 70, 229, 0.1);
    color: #4338ca;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.link {
    background: none;
    border: none;
    color: #4f46e5;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    &:hover {
        color: #4338ca;
        text-decoration: underline;
    }
}

.event-dates__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: clamp(0.75rem, 2vw, 1.2rem);
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        font-weight: 600;
        color: #1f2937;
        letter-spacing: 0.01em;
    }

    input,
    select {
        padding: 0.75rem 0.9rem;
        border: 1px solid rgba(17, 24, 39, 0.1);
        border-radius: 12px;
        background-color: rgba(243, 244, 246, 0.6);
        color: #0f172a;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        font-size: 1rem;

        &:focus {
            outline: none;
            border-color: rgba(79, 70, 229, 0.75);
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
            background-color: #fff;
        }
    }

    select {
        padding-right: 2.4rem;
        background:
            linear-gradient(180deg, rgba(243, 244, 246, 0.9), rgba(229, 231, 235, 0.65)),
            url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%2363748B'/%3E%3C/svg%3E")
                no-repeat right 0.85rem center/0.9rem;
        appearance: none;

        &:focus {
            background:
                linear-gradient(180deg, #ffffff, rgba(229, 231, 235, 0.65)),
                url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%234856FF'/%3E%3C/svg%3E")
                    no-repeat right 0.85rem center/0.9rem;
        }
    }
}

.form-field--checkbox {
    flex-direction: row;
    align-items: center;
    gap: 0.6rem;

    label {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: #374151;
    }
}

.event-section__actions {
    display: flex;
    justify-content: flex-end;
}

.secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    border: 1px solid rgba(79, 70, 229, 0.35);
    background: #fff;
    color: #4f46e5;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        background: rgba(79, 70, 229, 0.08);
        box-shadow: 0 10px 20px rgba(79, 70, 229, 0.15);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.18);
    }
}

@media (max-width: 540px) {
    .event-section {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }

    .event-dates__grid {
        grid-template-columns: 1fr;
    }

    .event-section__actions {
        justify-content: center;
    }
}
</style>
