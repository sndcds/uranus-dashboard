<template>
  <div class="dashboard-container">
    <h1>{{ t('organizers') }}</h1>
    <router-link to="/organizer/create">{{ t('create_organizer') }}</router-link>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-for="organizer in organizers" :key="organizer.organizer_id" class="organizer-block">
      <h2>{{ organizer.organizer_name }}</h2>
      <div class="cards">
        <OrganizerCardComponent
            v-for="venue in organizer.venues"
            :key="venue.venue_id"
            :venue="venue"
        />
      </div>
    </div>

    <pre>{{ organizers }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '../api'
import OrganizerCardComponent from '@/components/OrganizerCardComponent.vue'

const { t } = useI18n()

interface Space {
  space_id: number
  space_name: string
  upcoming_event_count: number
}

interface Venue {
  venue_id: number
  venue_name: string
  can_edit: boolean
  can_edit_venue: boolean
  can_delete_venue: boolean
  can_add_space: boolean
  can_edit_space: boolean
  can_delete_space: boolean
  can_add_event: boolean
  can_edit_event: boolean
  can_delete_event: boolean
  can_release_event: boolean
  upcoming_event_count: number
  spaces: Space[]
}

interface Organizer {
  organizer_id: number
  organizer_name: string
  can_edit_organizer: boolean
  can_delete_organizer: boolean
  total_upcoming_events: number
  venues: Venue[]
}

const organizers = ref<Organizer[]>([])
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const data = await apiFetch<Organizer[]>('/api/user?mode=organizer-dashboard&start=2000-01-01')
    organizers.value = data || []
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || 'Failed to load dashboard'
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

.cards {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.organizer-block {
  margin-bottom: 24px;
}
</style>