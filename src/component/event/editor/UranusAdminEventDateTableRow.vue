<template>
  <tr class="date-summary-row" :class="{ 'is-open': open }" @click="emit('toggle')">
    <td>
      <button
          type="button"
          class="expand-button"
          :aria-expanded="open"
          :aria-controls="detailId"
          @click.stop="emit('toggle')"
      >
        <ChevronDown :size="18" :class="{ 'is-open': open }" />
        <span class="sr-only">{{ t('event_edit_date') }}</span>
      </button>
    </td>
    <td>{{ date.startDate || '-' }}</td>
    <td>{{ date.startTime || '-' }}</td>
    <td>{{ date.endDate || '-' }}</td>
    <td>{{ date.endTime || '-' }}</td>
    <td>{{ venueLabel || '-' }}</td>
  </tr>
  <tr v-if="open" :id="detailId" class="date-detail-row">
    <td :colspan="6">
      <div class="date-editor">
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
          <UranusNumberInput :id="`duration-${index}`" v-model="date.duration" min="1" :label="t('event_duration_minutes')" />
        </div>

        <div class="date-pair date-options">
          <UranusCheckbox :id="`all-day-${index}`" v-model="date.allDay" :label="t('event_all_day')" />
          <UranusEventReleaseStatusSelect
              v-model="date.releaseStatus"
              renderAs="select"
              mode="event_date_override"
          />
        </div>

        <div class="date-actions">
          <UranusButton size="small" variant="tertiary" @click="emit('select-venue')">
            {{ t('event_select_venue') }}
          </UranusButton>
          <UranusButton size="small" variant="tertiary" @click="emit('clear-venue')">
            {{ t('event_remove_venue') }}
          </UranusButton>
          <UranusButton v-if="canRemove" size="small" variant="tertiary" @click="emit('remove')">
            {{ t('event_remove_date') }}
          </UranusButton>
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import type { AdminEventDate } from '@/domain/event/adminEventDate.model.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'
import UranusNumberInput from '@/component/ui/UranusNumberInput.vue'
import UranusTimeInput from '@/component/ui/UranusTimeInput.vue'
import UranusEventReleaseStatusSelect from '@/component/event/ui/UranusEventReleaseStatusSelect.vue'

defineProps<{
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
  (event: 'remove'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const detailId = `event-date-detail-${Math.random().toString(36).slice(2)}`
</script>

<style scoped lang="scss">
.date-summary-row {
  cursor: pointer;

  &:hover,
  &.is-open {
    background: var(--uranus-input-bg);
  }
}

.expand-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;

  svg {
    transition: transform 0.2s ease;

    &.is-open {
      transform: rotate(180deg);
    }
  }
}

.date-detail-row td {
  padding: 0;
}

.date-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem 2.75rem;
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