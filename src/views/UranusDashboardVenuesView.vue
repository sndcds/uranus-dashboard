<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent :title="t('venues')" :subtitle="t('venues_description')" />

    <!-- No Organizer Selected Message -->
    <div v-if="!organizerId" class="organizer-venue-view__no-organizer">
      <div class="uranus-card">
        <div class="no-organizer-content">
          <h3>{{ t('no_organizer_selected') }}</h3>
          <p>{{ t('no_organizer_selected_description') }}</p>
          <router-link to="/admin/organizer" class="uranus-button">
            {{ t('go_to_organizers') }}
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="uranus-main-layout">
      <UranusDashboardActionBar>
        <router-link :to="`/admin/organizer/${organizerId}/venue/create`" class="uranus-secondary-button">
          {{ t('add_new_venue') }}
        </router-link>
      </UranusDashboardActionBar>

      <!-- Error Message -->
      <div v-if="error" class="organizer-venue-view__error">
        <p class="form-feedback-error">{{ error }}</p>
      </div>

      <div v-if="organizer" class="organizer-venue-view__content">
        <!-- Stats -->
        <!--div class="uranus-card">
          <h2 v-if="organizer">{{ organizer.organizer_name }}</h2>
          <p>{{ t('total_events') }}: {{ organizer.total_upcoming_events }}</p>
        </div-->

        <!-- Venue Cards Grid -->
        <div class="organizer-venue-view__grid">
          <UranusVenueCard
            v-for="venue in organizer.venues"
            :key="venue.venue_id"
            :venue="venue"
            :organizerId="organizerId || 0"
            @deleted="handleVenueDeleted"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useAppStore } from '@/store/appStore'

import UranusVenueCard from '@/components/venue/UranusVenueCard.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue"
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue"

const { t } = useI18n()
const appStore = useAppStore()

// Make organizerId reactive from the store
const organizerId = computed({
  get: () => appStore.organizerId,
  set: (val: number | null) => appStore.setOrganizerId(val),
})

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

const handleVenueDeleted = (venueId: number) => {
  if (!organizer.value) {
    return
  }
  organizer.value = {
    ...organizer.value,
    venues: organizer.value.venues.filter((venue) => venue.venue_id !== venueId),
  }
}

// Watch for changes in organizerId and fetch organizer data
watch(
  organizerId,
  async (id) => {
    if (id === null) {
      organizer.value = null
      return
    }

    try {
      const response = await apiFetch<Organizer>(
        `/api/admin/organizer/${id}/venues`
      )
      organizer.value = response.data
      error.value = null
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'data' in err) {
        const e = err as { data?: { error?: string } }
        error.value = e.data?.error || 'Failed to load organizer venues'
      } else {
        error.value = 'Unknown error'
      }
      organizer.value = null
    }
  },
  { immediate: true } // fetch on initial load
)
</script>

<style scoped lang="scss">
// Error feedback
.organizer-venue-view__error {
  width: 100%;
  max-width: 600px;
}

.form-feedback-error {
}

// Content section
.organizer-venue-view__content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: var(--uranus-grid-gap);
}

// Stats section
// Venue cards grid
.organizer-venue-view__grid {
  display: flex;
  flex-direction: column;
  gap: var(--uranus-grid-gap);
  width: 100%;
}

@media (max-width: 768px) {
}

@media (min-width: 1280px) {
}

// No organizer selected message
.organizer-venue-view__no-organizer {
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.no-organizer-content {
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
  }

  p {
    margin: 0;
    color: var(--uranus-muted-text);
    line-height: 1.6;
  }

  .uranus-button {
    margin-top: 0.5rem;
    text-decoration: none;
  }
}
</style>
