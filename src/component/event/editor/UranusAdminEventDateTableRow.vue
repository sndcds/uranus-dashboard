<template>
  <article class="date-card" :class="{ 'is-open': open }">
    <button
        type="button"
        class="date-summary"
        :aria-expanded="open"
        :aria-controls="detailId"
        @click="emit('toggle')"
    >
      <span class="date-summary-content">
        <strong>{{ formattedStartDate || '-' }}</strong>
        <span v-if="formattedDateTime">{{ formattedDateTime }}</span>
        <template v-if="venueLabel">
          <span>,</span>
          <strong>{{ venueLabel }}</strong>
        </template>
      </span>
      <ChevronDown :size="18" class="expand-icon" :class="{ 'is-open': open }" />
      <span class="sr-only">{{ t('event_edit_date') }}</span>
    </button>
    <div v-if="open" :id="detailId" class="date-editor">
        <div class="date-pair">
          <UranusDateInput :id="`start-date-${index}`" v-model="date.startDate" :label="t('event_start_date')" required />
          <UranusTimeInput :id="`start-time-${index}`" v-model="date.startTime" :label="t('event_start_time')" required />
        </div>

        <div class="date-pair">
          <UranusDateInput :id="`end-date-${index}`" v-model="date.endDate" :label="t('event_end_date')" />
          <UranusTimeInput :id="`end-time-${index}`" v-model="date.endTime" :label="t('event_end_time')" />
        </div>

        <div class="date-pair">
          <UranusTimeInput :id="`entry-time-${index}`" v-model="date.entryTime" :label="t('event_entry_time')" />
          <UranusNumberInput :id="`duration-${index}`" v-model="duration" min="1" :label="t('event_duration_minutes')" />
        </div>

        <div class="date-pair date-options">
          <UranusCheckbox :id="`all-day-${index}`" v-model="date.allDay" :label="t('event_all_day')" />
          <UranusEventReleaseStatusSelect
              v-model="date.releaseStatus"
              renderAs="select"
              mode="event_date_override"
          />
        </div>

        <div class="date-pair">
          <UranusInput
              :id="`date-ticket-link-${index}`"
              v-model="date.ticketLink"
              type="url"
              :label="t('event_date_ticket_link')"
              placeholder="https://"
          />
          <UranusInput
              :id="`date-venue-name-${index}`"
              v-model="date.dateVenueName"
              :label="t('event_date_venue_name')"
          />
        </div>

        <UranusTextarea
            :id="`date-description-${index}`"
          v-model="dateDescription"
            :label="t('event_date_description')"
            resize="vertical"
        />

        <div class="date-actions">
          <UranusButton size="small" variant="tertiary" @click="emit('select-venue')">
            {{ t('event_select_venue') }}
          </UranusButton>
          <UranusButton size="small" variant="tertiary" @click="emit('clear-venue')">
            {{ t('event_remove_venue') }}
          </UranusButton>
          <UranusButton size="small" variant="tertiary" @click="emit('select-location')">
            {{ t('event_date_select_location') }}
          </UranusButton>
          <UranusButton v-if="canRemove" size="small" variant="tertiary" @click="emit('remove')">
            {{ t('event_remove_date') }}
          </UranusButton>
        </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import type { AdminEventDate } from '@/domain/event/adminEventDate.model.ts'
import { formatDate, formatTimeForUI, formatTimeRangeForUI } from '@/util/dateTime.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'
import UranusNumberInput from '@/component/ui/UranusNumberInput.vue'
import UranusTimeInput from '@/component/ui/UranusTimeInput.vue'
import UranusInput from '@/component/ui/UranusInput.vue'
import UranusTextarea from '@/component/ui/UranusTextarea.vue'
import UranusEventReleaseStatusSelect from '@/component/event/ui/UranusEventReleaseStatusSelect.vue'

const props = defineProps<{
  date: AdminEventDate
  index: number
  open: boolean
  venueLabel: string
  canRemove: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle'): void
  (event: 'select-venue'): void
  (event: 'clear-venue'): void
  (event: 'select-location'): void
  (event: 'remove'): void
}>()

const { t, locale } = useI18n({ useScope: 'global' })

const formattedStartDate = computed(() => formatDate(props.date.startDate, locale.value))

const formattedDateTime = computed(() => {
  const sameDay = !props.date.endDate || props.date.endDate === props.date.startDate

  if (sameDay) {
    if (props.date.startTime && props.date.endTime) {
      return formatTimeRangeForUI(props.date.startTime, locale.value, props.date.endTime)
    }
    return props.date.startTime ? formatTimeForUI(props.date.startTime, locale.value) : ''
  }

  const startTime = props.date.startTime ? ` ${formatTimeForUI(props.date.startTime, locale.value)}` : ''
  const endDate = formatDate(props.date.endDate, locale.value)
  const endTime = props.date.endTime ? ` ${formatTimeForUI(props.date.endTime, locale.value)}` : ''

  return endDate ? `${startTime} - ${endDate}${endTime}` : startTime
})

const dateDescription = computed({
  get: () => props.date.dateDescription ?? '',
  set: (value: string) => {
    props.date.dateDescription = value || null
  },
})

const duration = computed({
  get: () => props.date.duration ?? 0,
  set: (value: number) => {
    props.date.duration = value || null
  },
})

const detailId = `event-date-detail-${Math.random().toString(36).slice(2)}`
</script>

<style scoped lang="scss">
.date-card {
  border: 1px solid var(--uranus-input-border-color);
}

.date-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover,
  .date-card.is-open & {
    background: var(--uranus-input-bg);
  }
}

.date-summary-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.35rem;
}

.expand-icon {
  flex: 0 0 auto;
  margin-left: 0.75rem;
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(180deg);
  }
}

.date-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--uranus-input-bg);
}

.date-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 200px));
  gap: 0.75rem;
}

.date-options {
  align-items: end;
}

.date-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 700px) {
  .date-editor {
    padding-left: 1rem;
  }

  .date-pair {
    grid-template-columns: 1fr;
  }
}
</style>