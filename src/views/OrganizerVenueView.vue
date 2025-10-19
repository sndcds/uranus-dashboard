<template>
  <div class="dashboard-container">
    <h1 v-if="organizer">{{ organizer.organizer_name }}</h1>
    <router-link :to="`/organizer/${organizerId}/venue/create`">Create New Venue</router-link>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="organizer" class="organizer-block">
      <p>{{ t('total_events') }}: {{ organizer.total_upcoming_events }}</p>

      <div class="cards">
        <VenueCardComponent v-for="venue in organizer.venues" :key="venue.venue_id" :venue="venue" />
      </div>
    </div>

    <!-- Debug JSON -->
    <pre>{{ organizer }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import VenueCardComponent from '@/components/VenueCardComponent.vue'

const { t } = useI18n()
const route = useRoute()
const organizerId = Number(route.params.id)

interface Space {
  space_id: number
  space_name: string
  upcoming_event_count: number
}

interface Venue {
  venue_id: number
  venue_name: string
  upcoming_event_count: number
  spaces: Space[]
  can_edit?: boolean
  can_edit_venue?: boolean
  can_delete_venue?: boolean
  can_add_space?: boolean
  can_edit_space?: boolean
  can_delete_space?: boolean
  can_add_event?: boolean
  can_edit_event?: boolean
  can_delete_event?: boolean
  can_release_event?: boolean
}

interface Organizer {
  organizer_id: number
  organizer_name: string
  can_edit_organizer?: boolean
  can_delete_organizer?: boolean
  total_upcoming_events: number
  venues: Venue[]
}

const organizer = ref<Organizer | null>(null)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // Fetch a single organizer
    const response = await apiFetch<Organizer>(`/api/admin/organizer/venues/${organizerId}?start=2000-01-01`)

    // If your API returns the organizer directly, just assign it:
    organizer.value = response.data

    // If your API wraps it under "data", do:
    // organizer.value = response.data
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || 'Failed to load organizer venues'
    } else {
      error.value = 'Unknown error'
    }
  }
})
</script>

<style scoped lang="scss">
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error {
  color: red;
  margin-bottom: 16px;
}

.organizer-block {
  margin-bottom: 24px;
}

.cards {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
</style>