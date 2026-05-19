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