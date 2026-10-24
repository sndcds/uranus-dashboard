<template>
  <fieldset class="admin-event-date-filter">
    <legend>{{ t('event_table_date_range') }}</legend>
    <label>
      <span>{{ t('event_table_period') }}</span>
      <select v-model="mode" :aria-label="t('event_table_period')">
        <option value="all">{{ t('event_table_all_dates') }}</option>
        <option value="month">{{ t('event_table_month') }}</option>
        <option value="quarter">{{ t('event_table_quarter') }}</option>
        <option value="custom">{{ t('event_table_custom_range') }}</option>
      </select>
    </label>
    <label v-if="mode === 'month'">
      <span>{{ t('event_table_month') }}</span>
      <input v-model="month" type="month" min="1000-01" max="9999-12" required :aria-invalid="!valid || undefined" :aria-describedby="!valid ? errorId : undefined" />
    </label>
    <template v-if="mode === 'quarter'">
      <label>
        <span>{{ t('event_table_year') }}</span>
        <input v-model.number="year" type="number" min="1000" max="9999" step="1" required :aria-invalid="!valid || undefined" :aria-describedby="!valid ? errorId : undefined" />
      </label>
      <label>
        <span>{{ t('event_table_quarter') }}</span>
        <select v-model.number="quarter" :aria-label="t('event_table_quarter')">
          <option v-for="value in 4" :key="value" :value="value">{{ t('event_table_quarter_number', { number: value }) }}</option>
        </select>
      </label>
    </template>
    <template v-if="mode === 'custom'">
      <label>
        <span>{{ t('event_filter_from') }}</span>
        <input v-model="startDate" type="date" :max="endDate || undefined" :aria-invalid="!valid || undefined" :aria-describedby="!valid ? errorId : undefined" />
      </label>
      <label>
        <span>{{ t('event_filter_to') }}</span>
        <input v-model="endDate" type="date" :min="startDate || undefined" :aria-invalid="!valid || undefined" :aria-describedby="!valid ? errorId : undefined" />
      </label>
    </template>
    <p v-if="!valid" :id="errorId" role="alert">{{ t('event_table_invalid_range') }}</p>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatLocalDate, isValidAdminEventDateRange, monthDateRange, type AdminEventDateRange } from '@/domain/event/adminEventDateRange'

const model = defineModel<AdminEventDateRange>({ required: true })
const { t } = useI18n({ useScope: 'global' })
const now = new Date()
const mode = ref<'all' | 'month' | 'quarter' | 'custom'>('all')
const month = ref(formatLocalDate(now).slice(0, 7))
const year = ref(now.getFullYear())
const quarter = ref(Math.floor(now.getMonth() / 3) + 1)
const startDate = ref('')
const endDate = ref('')
const errorId = useId()
const range = computed<AdminEventDateRange>(() => {
  if (mode.value === 'month') {
    if (!/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(month.value)) return { startDate: 'invalid', endDate: '' }
    return monthDateRange(Number(month.value.slice(0, 4)), Number(month.value.slice(5, 7)))
  }
  if (mode.value === 'quarter') {
    if (!Number.isInteger(year.value) || year.value < 1000 || year.value > 9999) return { startDate: 'invalid', endDate: '' }
    return monthDateRange(year.value, (quarter.value - 1) * 3 + 1, 3)
  }
  return mode.value === 'custom' ? { startDate: startDate.value, endDate: endDate.value } : { startDate: '', endDate: '' }
})
const valid = computed(() => isValidAdminEventDateRange(range.value))
watch(range, value => { model.value = value }, { immediate: true })
</script>

<style scoped lang="scss">
.admin-event-date-filter { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; margin: 12px 0; padding: 10px 12px; border: 1px solid var(--uranus-color-7); border-radius: 6px; font-size: .8rem; }
legend { padding-inline: 4px; }
label { display: grid; gap: 4px; min-width: 0; }
input, select { box-sizing: border-box; min-width: 0; max-width: 100%; min-height: 36px; padding: 7px 8px; border: 1px solid var(--uranus-input-border-color); border-radius: 6px; color: inherit; background: var(--uranus-input-bg); font: inherit; }
input[type=number] { width: 100px; }
input:focus-visible, select:focus-visible { outline: 2px solid var(--uranus-focus-color); outline-offset: 2px; }
p { flex-basis: 100%; margin: 0; color: var(--uranus-error-color); }
@media (max-width: 600px) { label { flex: 1 1 130px; } input[type=number] { width: 100%; } }
</style>
