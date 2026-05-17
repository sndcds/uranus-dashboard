<template>
  <div ref="root" class="uranus-portal-date-select">
    <button
        type="button"
        class="uranus-portal-date-select__trigger"
        :aria-expanded="open ? 'true' : 'false'"
        aria-haspopup="listbox"
        @click="toggleOpen"
        @keydown.down.prevent="openPopup"
        @keydown.esc.prevent="closePopup"
    >
      <span>{{ selectedLabel }}</span>
      <ChevronDown class="uranus-portal-date-select__icon" aria-hidden="true" />
    </button>

    <div
        v-if="open"
        class="uranus-portal-date-select__popup"
        role="listbox"
    >
      <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="uranus-portal-date-select__option"
          :class="{ 'uranus-portal-date-select__option--selected': option.value === modelValue }"
          role="option"
          :aria-selected="option.value === modelValue ? 'true' : 'false'"
          @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import type { UranusPresetDateRangeMode } from '@/util/eventDateRange.ts'
import { uranusPresetDateRangeModes } from '@/util/eventDateRange.ts'

const props = defineProps<{
  modelValue: UranusPresetDateRangeMode
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: UranusPresetDateRangeMode): void
}>()

const { t } = useI18n({ useScope: 'global' })
const root = ref<HTMLElement | null>(null)
const open = ref(false)

const labelKeys: Record<UranusPresetDateRangeMode, string> = {
  all_events: 'calendar_filter_date_all_events',
  today: 'calendar_filter_date_today',
  tomorrow: 'calendar_filter_date_tomorrow',
  weekend: 'calendar_filter_date_weekend',
  next_week: 'calendar_filter_date_next_week',
}

const options = computed(() =>
  uranusPresetDateRangeModes.map(value => ({
    value,
    label: t(labelKeys[value]),
  }))
)

const selectedLabel = computed(() => {
  const option = options.value.find(entry => entry.value === props.modelValue)
  return option?.label ?? t('calendar_filter_date_all_events')
})

function toggleOpen() {
  open.value = !open.value
}

function openPopup() {
  open.value = true
}

function closePopup() {
  open.value = false
}

function selectOption(value: UranusPresetDateRangeMode) {
  emit('update:modelValue', value)
  closePopup()
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Node) || !root.value || root.value.contains(target)) return
  closePopup()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<style scoped>
.uranus-portal-date-select {
  position: relative;
  display: inline-flex;
  min-width: 11rem;
}

.uranus-portal-date-select__trigger {
  display: inline-flex;
  width: 100%;
  min-height: 2.5rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--portal-event-border, var(--uranus-input-border-color));
  border-radius: 4px;
  color: inherit;
  background: var(--portal-event-chip-bg, var(--uranus-input-bg));
  cursor: pointer;
  font: inherit;
}

.uranus-portal-date-select__icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
}

.uranus-portal-date-select__popup {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.35rem);
  left: 0;
  display: flex;
  min-width: 100%;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.3rem;
  border: 1px solid var(--portal-event-border, var(--uranus-color-7));
  border-radius: 6px;
  background: var(--portal-background, var(--uranus-bg));
  box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 14%);
}

.uranus-portal-date-select__option {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 0;
  border-radius: 4px;
  color: inherit;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
  white-space: nowrap;
}

.uranus-portal-date-select__option:hover,
.uranus-portal-date-select__option--selected {
  background: var(--portal-event-chip-bg, var(--uranus-color-8));
}
</style>
