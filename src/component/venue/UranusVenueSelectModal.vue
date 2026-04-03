<!--
  src/component/venue/UranusVenueSelectModal.vue
-->

<template>
  <UranusModal
      :show="show"
      title="Select Venue / Space"
      @close="$emit('close')"
      :maxWidth="'600px'"
  >
    <!-- Container for autoscroll -->
    <div class="venue-space-list" ref="containerRef">
      <div
          v-for="venue in groupedVenues"
          :key="venue.venueUuid"
          class="venue-group"
      >
        <div
            class="venue-item"
            :class="{ selected: isSelected(venue.venueUuid, null) }"
            @click="select(venue.venueUuid, null)"
        >
          {{ venue.venueName }} ({{ venue.city }})
        </div>

        <div
            v-for="space in venue.spaces"
            :key="space.spaceUuid ?? 0"
            class="space-item"
            :class="{ selected: isSelected(venue.venueUuid, space.spaceUuid) }"
            @click="select(venue.venueUuid, space.spaceUuid)"
        >
          {{ space.spaceName }}
        </div>
      </div>
    </div>

    <template>
      <button @click="$emit('close')">Cancel</button>
    </template>
  </UranusModal>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import UranusModal from '@/component/uranus/UranusModal.vue'
import { type VenueInfo } from '@/domain/venue/venueInfo.model.ts'

interface VenueSpaceOption {
  venueUuid: string
  venueName: string
  city: string
  spaces: {
    spaceUuid: string | null
    spaceName: string | null
    city: string
  }[]
}

const props = defineProps<{
  show: boolean
  venueInfos: VenueInfo[]
  modelValue: { venueUuid: string | null; spaceUuid: string | null }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { venueUuid: string | null; spaceUuid: string | null }): void
  (e: 'close'): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)

// Group venues + spaces
const groupedVenues = computed<VenueSpaceOption[]>(() => {
  const map = new Map<string, VenueSpaceOption>()

  for (const v of props.venueInfos) {
    if (!map.has(v.venueUuid)) {
      map.set(v.venueUuid, {
        venueUuid: v.venueUuid,
        venueName: v.venueName,
        city: v.city,
        spaces: [],
      })
    }

    if (v.spaceUuid != null) {
      map.get(v.venueUuid)!.spaces.push({
        spaceUuid: v.spaceUuid,
        spaceName: v.spaceName,
        city: v.city,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) =>
      a.venueName.localeCompare(b.venueName)
  )
})

// Select a venue/space
function select(venueUuid: string, spaceUuid: string | null) {
  emit('update:modelValue', { venueUuid, spaceUuid })
  emit('close')
}

// Check if a venue/space is selected
function isSelected(venueUuid: string, spaceUuid: string | null) {
  return props.modelValue?.venueUuid === venueUuid && props.modelValue?.spaceUuid === spaceUuid
}

// Auto-scroll selected item when modal opens
watch(() => props.show, async (val) => {
  if (!val) return
  await nextTick()
  const selectedEl = containerRef.value?.querySelector('.selected') as HTMLElement | null
  selectedEl?.scrollIntoView({ block: 'center', behavior: 'smooth' })
})
</script>

<style scoped lang="scss">
.venue-space-list {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
}

.venue-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .venue-item {
    font-weight: 600;
    padding: 0.4rem 0.6rem;
    cursor: pointer;
    background: #ffffff;
    border-radius: 4px;

    &:hover {
      background: #e6edff;
    }
  }

  .space-item {
    padding: 0.4rem 2rem;
    cursor: pointer;
    border-radius: 4px;
    background: #ffffff;

    &:hover {
      background: #e6edff;
    }
  }

  .selected {
    background: #2d36e4 !important;
    color: white;
  }
}
</style>