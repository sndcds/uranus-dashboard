<template>
  <UranusEventTableHint :text="label">
    <span class="event-release-bar" tabindex="0" role="img" :aria-label="label" :style="{ backgroundColor: eventReleaseColor(status) }" />
  </UranusEventTableHint>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { eventReleaseColor, isEventReleaseStatus } from '@/domain/event/eventReleaseStatus'
import UranusEventTableHint from './UranusEventTableHint.vue'
const props = defineProps<{ status: string | null | undefined }>()
const { t } = useI18n({ useScope: 'global' })
const label = computed(() => t('event_table_release', { status: isEventReleaseStatus(props.status)
  ? t(`event_release_${props.status}`) : props.status || t('event_table_release_unknown') }))
</script>

<style scoped>
.event-release-bar { display: inline-block; width: 28px; height: 7px; border-radius: 3px; flex: none; }
.event-release-bar:focus-visible { outline: 2px solid var(--uranus-focus-color); outline-offset: 4px; }
</style>
