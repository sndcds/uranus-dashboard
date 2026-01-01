<!-- UranusEditEventDateDisplay.vue -->
<template>
  <div
      class="uranus-event-date-display"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
  >
    <template v-if="formattedDate">
      <!-- Date Display -->
      <div v-if="formattedDate.date">
        <span class="event-date">{{ formattedDate.date }}</span>

        <!-- Edit/Delete Icons -->
        <UranusInlineIcon
            v-if="canEdit"
            mode="edit"
            class="icon"
            @click.native="onEdit"
        />
        <UranusInlineIcon
            v-if="canDelete"
            mode="delete"
            class="icon"
            @click.native="onDelete"
        />

        <br>
        <span v-if="formattedDate.time" class="event-time">{{ formattedDate.time }}</span>
      </div>

      <div v-else>
        <span class="event-date">{{ formattedDate.startDate }}</span>
        <UranusInlineIcon v-if="canEdit" mode="edit" class="icon" @click.native="onEdit" />
        <UranusInlineIcon v-if="canDelete" mode="delete" class="icon" @click.native="onDelete" />
        <br>
        <span v-if="formattedDate.startTime" class="event-time">{{ formattedDate.startTime }}</span>
        &nbsp;–&nbsp;<span class="event-time">{{ formattedDate.endDate }}</span>
        <span v-if="formattedDate.endTime" class="event-time"> / {{ formattedDate.endTime }}</span>
      </div>

      <!-- Venue/Space Display -->
      <span v-if="formattedVenueSpaceName !== ''" class="event-venue">
        {{ formattedVenueSpaceName }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatEventDateTime } from '@/utils/UranusUtils.ts'
import UranusInlineIcon from "@/components/ui/UranusInlineIcon.vue"
import type { UranusEventDate } from "@/models/UranusEventModel.ts"

const { t, locale } = useI18n({ useScope: 'global' })

const props = defineProps<{
  eventDate: UranusEventDate
}>()

const emits = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const canEdit = computed(() => true) // TODO: replace with permissions
const canDelete = computed(() => true) // TODO: replace with permissions
const hovered = ref(false)

const formattedDate = computed(() =>
    props.eventDate ? formatEventDateTime(props.eventDate, locale.value) : null
)

const formattedVenueSpaceName = computed(() => {
  if (props.eventDate.dateVenueId != null) {
    let name = props.eventDate.venueName ?? ''
    if (props.eventDate.spaceId) {
      name += ' / ' + props.eventDate.spaceName
    }
    return name
  }
  return ''
})

// --- Wrapper functions to handle native click ---
function onEdit(event: MouseEvent) {
  event.stopPropagation() // prevent double alert
  emits('edit')
}

function onDelete(event: MouseEvent) {
  event.stopPropagation() // prevent double alert
  emits('delete')
}
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