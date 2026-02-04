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
          :key="venue.venueId"
          class="venue-group"
      >
        <div
            class="venue-item"
            :class="{ selected: isSelected(venue.venueId, null) }"
            @click="select(venue.venueId, null)"
        >
          {{ venue.venueName }} ({{ venue.city }})
        </div>

        <div
            v-for="space in venue.spaces"
            :key="space.spaceId ?? 0"
            class="space-item"
            :class="{ selected: isSelected(venue.venueId, space.spaceId) }"
            @click="select(venue.venueId, space.spaceId)"
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

interface VenueSpaceOption {
  venueId: number
  venueName: string
  city: string
  spaces: {
    spaceId: number | null
    spaceName: string | null
    city: string
  }[]
}

export interface UranusEventVenueInfo {
  venue_id: number
  venue_name: string
  space_id: number | null
  space_name: string | null
  city: string
  country: string
}

const props = defineProps<{
  show: boolean
  venueInfos: UranusEventVenueInfo[]
  modelValue: { venueId: number | null; spaceId: number | null }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { venueId: number | null; spaceId: number | null }): void
  (e: 'close'): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)

const groupedVenues = computed<VenueSpaceOption[]>(() => {
  const map = new Map<number, VenueSpaceOption>()

  for (const p of props.venueInfos) {
    if (!map.has(p.venue_id)) {
      map.set(p.venue_id, {
        venueId: p.venue_id,
        venueName: p.venue_name,
        city: p.city,
        spaces: [],
      })
    }

    if (p.space_id != null) {
      map.get(p.venue_id)!.spaces.push({
        spaceId: p.space_id,
        spaceName: p.space_name,
        city: p.city,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) =>
      a.venueName.localeCompare(b.venueName)
  )
})

function select(venueId: number, spaceId: number | null) {
  emit('update:modelValue', { venueId, spaceId })
  emit('close')
}

function isSelected(venueId: number, spaceId: number | null) {
  return props.modelValue?.venueId === venueId && props.modelValue?.spaceId === spaceId
}

// Watch for modal opening and scroll selected item into view
watch(() => props.show, async (val) => {
  if (!val) return
  await nextTick() // wait for DOM render
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