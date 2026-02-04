<template>
  <UranusFieldLabel
      id="event-venue-select"
      required
      :label="t('event_release_status_label')">
    <select
        style="max-width: 250px;"
        id="release-status-select"
        v-model.number="modelValue"
    >
      <option
          v-for="status in releaseStatuses"
          :key="status.id"
          :value="status.id"
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
  modelValue: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

// v-model binding
const modelValue = computed({
  get: () => props.modelValue,
  set: (val: number | null) => emit('update:modelValue', val)
})

// Status options
const releaseStatuses = computed(() => [
  { id: 1, label: t('event_release_draft') },
  { id: 2, label: t('event_release_review') },
  { id: 3, label: t('event_release_released') },
  { id: 4, label: t('event_release_cancelled') },
  { id: 5, label: t('event_release_deferred') },
  { id: 6, label: t('event_release_rescheduled') },
])
</script>