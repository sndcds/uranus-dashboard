<!--
  src/component/event/ui/UranusEventReleaseSelect.vue

  UI select component for choosing the release status of an event.

  2026-02-05, Roald
-->

<template>
  <UranusFieldLabel
      id="event-venue-select"
      required
      :label="t('event_release_status_label')">
    <select
        style="height: 40px; font-size: 1rem;"
        id="release-status-select"
        v-model="modelValue"
    >
      <option
          v-for="status in releaseStatuses"
          :key="status.id"
          :value="status.value"
      >
        {{ status.label }}
      </option>
    </select>
  </UranusFieldLabel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusFieldLabel from "@/component/ui/UranusFieldLabel.vue";
import UranusInlineSectionLayout from "@/component/ui/UranusInlineSectionLayout.vue";

const { t } = useI18n({ useScope: 'global' })

// Props for v-model
const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

// v-model binding
const modelValue = computed({
  get: () => props.modelValue,
  set: (val: string | null) => emit('update:modelValue', val)
})

// Status options
const releaseStatuses = computed(() => [
  { id: 1, value: 'draft', label: t('event_release_draft') },
  { id: 2, value: 'review',label: t('event_release_review') },
  { id: 3, value: 'released',label: t('event_release_released') },
  { id: 4, value: 'cancelled',label: t('event_release_cancelled') },
  { id: 5, value: 'deferred',label: t('event_release_deferred') },
  { id: 6, value: 'rescheduled',label: t('event_release_rescheduled') },
])
</script>