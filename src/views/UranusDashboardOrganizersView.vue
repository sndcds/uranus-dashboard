<!--
  UranusDashboardOrganizersView.vue
-->
<template>
    <div class="uranus-main-layout" style="max-width: 1600px;">
        <DashboardHeroComponent :title="t('organizers')" :subtitle="t('organizers_overview_subtitle')" />

        <UranusDashboardActionBar>
            <router-link to="/admin/organizer/create" class="uranus-secondary-button">
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
      <UranusOrganizerCard
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

import UranusOrganizerCard from '@/components/organizer/UranusOrganizerCard.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue"
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue";

const { t } = useI18n()

interface Organizer {
  organizer_id: number
  organizer_name: string
  organizer_city: string | null
  organizer_country_code: string | null
  total_upcoming_events: number
  venue_count: number
  space_count: number
  can_edit_organizer: boolean
  can_delete_organizer: boolean
  can_manage_team: boolean
}

const organizers = ref<Organizer[]>([])
const error = ref<string | null>(null)

const handleOrganizerDeleted = (organizerId: number) => {
  organizers.value = organizers.value.filter(org => org.organizer_id !== organizerId)
}

onMounted(async () => {
  try {
    // Updated to reflect the new API shape
    const { data } = await apiFetch<{ organizers: Organizer[] }>('/api/admin/organizer/dashboard')
    organizers.value = data?.organizers || []
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
  flex-direction: column;
  grid-template-columns: repeat(auto-fill, minmax(360px, 500px));
  grid-auto-rows: auto;
  gap: var(--uranus-grid-gap);
  max-width: var(--uranus-dashboard-content-width);
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
  color: var(--uranus-muted-text);
  line-height: 1.6;
}

// Error feedback
.organizer-dashboard-view__error {
  width: 100%;
  max-width: 600px;
}

.form-feedback-error {
}

</style>
