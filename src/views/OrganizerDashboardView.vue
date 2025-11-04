<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent :title="t('organizers')" :subtitle="t('organizers_overview_subtitle')" />

    <!-- Empty State Message -->
    <div v-if="!organizers.length" class="organizer-dashboard-view__empty">
      <p class="organizer-dashboard-view__empty-text">{{ t('no_organizers_help') }}</p>
    </div>

    <!-- Create Organizer Action -->
    <div style="padding: 16px;">
      <router-link to="/admin/organizer/create" class="uranus-button">
        {{ t('create_organizer') }}
      </router-link>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="organizer-dashboard-view__error">
      <p class="form-feedback-error">{{ error }}</p>
    </div>

    <!-- Organizer Cards Grid -->
    <div class="organizer-grid">
      <OrganizerCardComponent v-for="organizer in organizers" :key="organizer.organizer_id" :organizer="organizer" @deleted="handleOrganizerDeleted" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import OrganizerCardComponent from '@/components/OrganizerCardComponent.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue"

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

const handleOrganizerDeleted = (organizerId: number) => {
  organizers.value = organizers.value.filter(org => org.organizer_id !== organizerId)
}

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
.organizer-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: var(--uranus-grid-gap);
}

.organizer-grid>* {
  flex: 1 1 400px;
  /* grow/shrink with a base width */
  min-width: 300px;
  /* never smaller than this */
  max-width: 700px;
  /* never larger than this */
}

// Mobile-first responsive OrganizerDashboardView
.organizer-dashboard-view {
  @include form-page();
  padding: clamp(1rem, 4vw, 2rem);
  min-height: 100vh;
}

.organizer-dashboard-view__hero {
  @include form-hero(540px);
}

.organizer-title {
  margin: 0 0 clamp(0.5rem, 2vw, 1rem) 0;
}

// Header section
.organizer-dashboard-view__header {
  width: 100%;
  max-width: 1200px;
  text-align: center;
}

.organizer-dashboard-view__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

// Empty state
.organizer-dashboard-view__empty {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.organizer-dashboard-view__empty-text {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: var(--muted-text);
  line-height: 1.6;
}

// Actions section
.organizer-dashboard-view__actions {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
}

.organizer-dashboard-view__create-btn {
  @include form-primary-button();
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    text-decoration: none;
  }
}

// Error feedback
.organizer-dashboard-view__error {
  width: 100%;
  max-width: 600px;
}

.form-feedback-error {
  @include form-feedback();
  @include form-feedback-error();
}

// Organizer cards grid - mobile first
.organizer-dashboard-view__grid {
  @include form-grid(280px, clamp(1rem, 3vw, 1.5rem));
  width: 100%;
  max-width: 1200px;
}

// Tablet enhancements (640px+)
@media (min-width: 640px) {
  .organizer-dashboard-view__actions {
    justify-content: center;
  }

  .organizer-dashboard-view__grid {
    @include form-grid(320px, clamp(1.25rem, 3.5vw, 1.75rem));
  }
}

// Desktop enhancements (1024px+)
@media (min-width: 1024px) {
  .organizer-dashboard-view__grid {
    @include form-grid(360px, clamp(1.5rem, 4vw, 2rem));
  }
}

// Large desktop (1280px+)
@media (min-width: 1280px) {
  .organizer-dashboard-view__grid {
    @include form-grid(400px, clamp(2rem, 5vw, 2.5rem));
  }
}
</style>
