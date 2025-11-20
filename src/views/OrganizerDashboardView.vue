<template>
    <div class="uranus-main-layout" style="max-width: 1600px;">
        <DashboardHeroComponent :title="t('organizers')" :subtitle="t('organizers_overview_subtitle')" />

        <UranusDashboardActionBar>
            <router-link to="/admin/organizer/create" class="uranus-button">
                {{ t('create_organizer') }}
            </router-link>
        </UranusDashboardActionBar>

        <!-- Empty State Message -->
        <div v-if="!organizers.length" class="organizer-dashboard-view__empty">
            <p class="organizer-dashboard-view__empty-text">{{ t('no_organizers_help') }}</p>
        </div>


    <!-- Error Message -->
    <div v-if="error" class="organizer-dashboard-view__error">
      <p class="form-feedback-error">{{ error }}</p>
    </div>

    <!-- Organizer Cards Grid -->
    <div class="organizer-grid">
      <OrganizerCardComponent
          v-for="organizer in organizers"
          :key="organizer.organizer_id"
          :organizer="organizer"
          @deleted="handleOrganizerDeleted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import OrganizerCardComponent from '@/components/OrganizerCardComponent.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue"
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue";

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
  can_delete_organizer: boolean
  can_edit_organizer: boolean
  venues: Venue[]
}

const organizers = ref<Organizer[]>([])
const error = ref<string | null>(null)

const handleOrganizerDeleted = (organizerId: number) => {
  organizers.value = organizers.value.filter(org => org.organizer_id !== organizerId)
}

onMounted(async () => {
  try {
    const { data } = await apiFetch<Organizer[]>('/api/admin/organizer/dashboard')
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
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 500px));
    grid-auto-rows: auto;
    gap: var(--uranus-grid-gap);
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

// Error feedback
.organizer-dashboard-view__error {
  width: 100%;
  max-width: 600px;
}

.form-feedback-error {
  @include form-feedback();
  @include form-feedback-error();
}

</style>
