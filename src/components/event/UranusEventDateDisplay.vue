<template>
  <div
      class="uranus-event-date-display"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
  >
    <template v-if="formattedDate">
      <div v-if="formattedDate.date">
        <span class="event-date">{{ formattedDate.date }}</span>
        <UranusInlineIcon
            v-if="canEdit"
            mode="edit"
            class="icon"
            @click="$emit('edit')"
        />
        <br>
        <span v-if="formattedDate.time" class="event-time">{{ formattedDate.time }}</span>
      </div>

      <div v-else>
        <span class="event-date">{{ formattedDate.startDate }}</span>
        <UranusInlineIcon
            v-if="canEdit"
            mode="edit"
            class="icon"
            @click="$emit('edit')"
        />
        <br>
        <span v-if="formattedDate.startTime" class="event-time">{{ formattedDate.startTime }}</span>
        &nbsp;–&nbsp;<span class="event-time">{{ formattedDate.endDate }}</span>
        <span v-if="formattedDate.endTime" class="event-time"> / {{ formattedDate.endTime }}</span>
      </div>

      <span v-if="eventDate.dateVenueId" class="event-venue">
        {{ eventDate.venueName }}
        <template v-if="eventDate.spaceName">
          / {{ eventDate.spaceName }}
        </template>
      </span>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatEventDateTime } from '@/utils/UranusUtils.ts'
import UranusInlineIcon from "@/components/ui/UranusInlineIcon.vue"
import type {UranusEventDate} from "@/models/UranusEventModel.ts";

const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{
  eventDate: UranusEventDate
}>()

const canEdit = computed(() => true )
const hovered = ref(false)
const { locale } = useI18n({ useScope: 'global' })

const formattedDate = computed(() => {
  return props.eventDate ? formatEventDateTime(props.eventDate, locale.value) : null
})
</script>

<style scoped>
.uranus-event-date-display {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 4px 12px;
}

.event-date {
  font-size: 1.5rem;
  font-weight: 500;
}

.event-time,
.event-venue {
  font-weight: 400;
  color: #666;
}

.icon {
  margin-left: 8px;
}
</style>