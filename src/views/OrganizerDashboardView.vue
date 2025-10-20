<template>
  <div class="dashboard-container">
    <h1>{{ t('organizers') }}</h1>
    <p v-if="!organizers.length">{{ t('no_organizers_help') }}</p>

    <router-link to="/organizer/create">{{ t('create_organizer') }}</router-link>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="cards">
      <OrganizerCardComponent v-for="organizer in organizers" :key="organizer.organizer_id" :organizer="organizer" />
    </div>

    <!--pre>{{ organizers }}</pre-->
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
  upcoming_event_count: number
  spaces: Space[]
}

interface Organizer {
  organizer_id: number
  organizer_name: string
  total_upcoming_events: number
  venues: Venue[]
}

const organizers = ref<Organizer[]>([])
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const { data } = await apiFetch<Organizer[]>('/api/admin/organizer/dashboard?start=2000-01-01') // Todo: start should be Now
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
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}
</style>
