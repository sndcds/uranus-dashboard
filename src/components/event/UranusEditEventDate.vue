<template>
  <div>
    <!-- Only display the event date, emit 'edit' when requested -->
    <UranusEventDateDisplay
        :event-date="props.eventDate"
        :can-edit="true"
        @edit="$emit('edit', props.eventDate)"
    />
  </div>
</template>

<script setup lang="ts">
import UranusEventDateDisplay from './UranusEventDateDisplay.vue'
import type { UranusEventDate } from '@/models/UranusEventModel.ts'

const props = defineProps<{
  eventDate: UranusEventDate
}>()

const emit = defineEmits<{
  (e: 'edit', value: UranusEventDate): void
}>()
</script>
<style scoped lang="scss">
.uranus-grid-4 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
</style>