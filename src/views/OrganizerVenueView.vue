<template>
  <div class="organizer-venue-view">
    <!-- Page Header -->
    <header class="organizer-venue-view__header">
      <h1 v-if="organizer" class="organizer-venue-view__title">{{ organizer.organizer_name }}</h1>
    </header>

    <!-- Create Venue Action -->
    <div class="organizer-venue-view__actions">
      <router-link
        :to="`/organizer/${organizerId}/venue/create`"
        class="organizer-venue-view__create-btn"
      >
        Create New Venue
      </router-link>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="organizer-venue-view__error">
      <p class="form-feedback-error">{{ error }}</p>
    </div>

    <!-- Organizer Content -->
    <div v-if="organizer" class="organizer-venue-view__content">
      <!-- Stats -->
      <div class="organizer-venue-view__stats">
        <p class="organizer-venue-view__stat">{{ t('total_events') }}: {{ organizer.total_upcoming_events }}</p>
      </div>

      <!-- Venue Cards Grid -->
      <div class="organizer-venue-view__grid">
        <VenueCardComponent
          v-for="venue in organizer.venues"
          :key="venue.venue_id"
          :venue="venue"
          :organizerId="organizerId || 0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useAppStore } from '@/store/appStore'

import VenueCardComponent from '@/components/VenueCardComponent.vue'

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
            `/api/admin/organizer/${id}/venues?start=2000-01-01`
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
// Mobile-first responsive OrganizerVenueView
.organizer-venue-view {
  @include form-page();
  padding: clamp(1rem, 4vw, 2rem);
  min-height: 100vh;
}

// Header section
.organizer-venue-view__header {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 3vw, 1.5rem);
  text-align: center;
}

.organizer-venue-view__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

// Actions section
.organizer-venue-view__actions {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
}

.organizer-venue-view__create-btn {
  @include form-primary-button();
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    text-decoration: none;
  }
}

// Error feedback
.organizer-venue-view__error {
  width: 100%;
  max-width: 600px;
}

.form-feedback-error {
  @include form-feedback();
  @include form-feedback-error();
}

// Content section
.organizer-venue-view__content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vw, 2rem);
}

// Stats section
.organizer-venue-view__stats {
  @include form-section();
  padding: clamp(1rem, 3vw, 1.5rem);
}

.organizer-venue-view__stat {
  margin: 0;
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  font-weight: 600;
  color: var(--color-text);
}

// Venue cards grid - mobile first
.organizer-venue-view__grid {
  @include form-grid(280px, clamp(1rem, 3vw, 1.5rem));
  width: 100%;
}

// Tablet enhancements (640px+)
@media (min-width: 640px) {
  .organizer-venue-view__header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }

  .organizer-venue-view__title {
    margin: 0;
  }

  .organizer-venue-view__actions {
    justify-content: flex-end;
  }
}

// Desktop enhancements (1024px+)
@media (min-width: 1024px) {
  .organizer-venue-view {
    padding: clamp(2rem, 6vw, 4rem);
  }

  .organizer-venue-view__grid {
    @include form-grid(320px, clamp(1.5rem, 4vw, 2rem));
  }
}

// Large desktop (1280px+)
@media (min-width: 1280px) {
  .organizer-venue-view__grid {
    @include form-grid(360px, clamp(2rem, 5vw, 2.5rem));
  }
}
</style>