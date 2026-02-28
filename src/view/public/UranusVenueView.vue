<!--
  src/view/public/UranusVenueView.vue

  2026-02-27, ChatGPT
-->

<template>

  <div v-if="showLoading" class="uranus-public-venue-state-info--loading">
    <span>{{ loadingLabel }}</span>
  </div>
  <div v-else-if="loadError" class="uranus-public-venue-state-info--alert">
    <span>{{ loadError }}</span>
  </div>
  <div v-else-if="venue" class="uranus-public-venue-frame">

    <div class="uranus-public-venue-detail-layout">

      <!-- Main Content -->
      <section class="uranus-public-venue-main-layout">

        <!-- Title -->
        <div class="uranus-public-venue-section">
          <h1>{{ venue.name }}</h1>
          <h2 v-if="venue.type_name">{{ venue.type_name }}</h2>
        </div>

        <!-- Description -->
        <div v-if="venue.description" class="uranus-public-venue-section">
          <div class="uranus-public-venue-description" v-html="formatMarkdown(venue.description)"></div>
        </div>

        <!-- Address & Contact -->
        <div class="uranus-public-venue-section">
          <p v-if="venue.street || venue.house_number">
            {{ venue.street }} {{ venue.house_number }}
          </p>
          <p v-if="venue.postal_code || venue.city || venue.country">
            {{ venue.postal_code }} {{ venue.city }} {{ venue.country }}
          </p>
          <p v-if="venue.contact_email">Email: <a :href="`mailto:${venue.contact_email}`">{{ venue.contact_email }}</a></p>
          <p v-if="venue.contact_phone">Phone: {{ venue.contact_phone }}</p>
          <p v-if="venue.website_link">
            <a :href="venue.website_link" target="_blank" rel="noopener noreferrer">
              {{ venue.website_link }}&nbsp;↗
            </a>
          </p>
        </div>

        <!-- Spaces -->
        <div v-if="venue.spaces && venue.spaces.length" class="uranus-public-venue-section">
          <h3>{{ t('spaces') }}</h3>
          <ul class="uranus-public-venue-spaces">
            <li v-for="space in venue.spaces" :key="space.id">
              <strong>{{ space.name }}</strong>
              <span v-if="space.total_capacity">({{ space.total_capacity }} total)</span>
              <span v-if="space.seating_capacity">, {{ space.seating_capacity }} seats</span>
              <span v-if="space.building_level !== undefined">, Level {{ space.building_level }}</span>
              <span v-if="space.space_type_name">, {{ space.space_type_name }}</span>
              <p v-if="space.description">{{ space.description }}</p>
              <p v-if="space.website_link">
                <a :href="space.website_link" target="_blank" rel="noopener noreferrer">
                  {{ space.website_link }}&nbsp;↗
                </a>
              </p>
            </li>
          </ul>
        </div>

      </section>

      <!-- Sidebar -->
      <aside class="uranus-public-venue-sidebar">

        <!-- Organization -->
        <div v-if="venue.organization" class="uranus-public-venue-info-section">
          <p class="uranus-public-venue-info-label">{{ t('venue_organization') }}</p>
          <p v-if="venue.organization.website_link && venue.organization.name">
            <a :href="venue.organization.website_link" target="_blank" rel="noopener noreferrer">
              {{ venue.organization.name }}&nbsp;↗
            </a>
          </p>
          <p v-else>{{ venue.organization.name }}</p>
          <p v-if="venue.organization.city || venue.organization.country">
            {{ venue.organization.city }}, {{ venue.organization.country }}
          </p>
        </div>

        <!-- Map button -->
        <button
            v-if="hasLonLat"
            type="button"
            class="uranus-public-venue-detail-link"
            @click="onShowOnMap">
          {{ t('show_map') }}
        </button>

      </aside>
    </div>
  </div>

  <div class="public-calendar-page" v-if="venue">
    <UranusEventCalendar
        :initial-filter="initialEventFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { marked } from 'marked'
import UranusEventCalendar from '@/component/event/UranusEventCalendar.vue'
import type {UranusVenueSelectItemInfo} from '@/domain/venue/UranusVenue.ts'

const route = useRoute()
const { t, locale } = useI18n({ useScope: 'global' })

// State
const venue = ref<any | null>(null)
const isLoading = ref(true)
const showLoading = ref(false)
const loadingLabel = computed(() => t('loading'))
const loadError = ref<string | null>(null)

const hasLonLat = computed(() => venue.value?.lon && venue.value?.lat)


const initialEventFilter = reactive({
  search: null,
  city: null,
  startDate: null,
  endDate: null,
  venue: { id: -1, name: '' } as UranusVenueSelectItemInfo
})

watch(venue, (newVenue) => {
  if (newVenue) {
    initialEventFilter.venue = { id: newVenue.id, name: newVenue.name }
  }
})

// Helpers
const formatMarkdown = (markdown: string) => {
  try { return marked(markdown) }
  catch { return markdown }
}

const resolveRouteParam = (param: string | string[] | undefined) =>
    Array.isArray(param) ? param[0] : param

const loadVenue = async () => {
  const venueId = Number(resolveRouteParam(route.params.id))
  if (!venueId) {
    loadError.value = t('error_missing_params')
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = null

  try {
    const lang = locale.value || 'en'
    const apiPath = `/api/venue/${venueId}?lang=${lang}`
    const response = await apiFetch<any>(apiPath)
    venue.value = response.data.data
  } catch (error: unknown) {
    loadError.value = error instanceof Error ? error.message : t('error_fetch_data_failed')
  } finally {
    isLoading.value = false
  }
}

const onShowOnMap = () => {
  if (!venue.value?.lon || !venue.value?.lat) return
  // Implement map popup or routing
  window.alert(`Show on map: ${venue.value.lat}, ${venue.value.lon}`)
}

onMounted(() => void loadVenue())

</script>

<style scoped>
.uranus-public-venue-frame {
  display: flex;
  gap: 2rem;
}
.uranus-public-venue-main-layout {
  flex: 3;
}
.uranus-public-venue-sidebar {
  flex: 1;
}
.uranus-public-venue-section {
  margin-bottom: 1.5rem;
}
.uranus-public-venue-spaces li {
  margin-bottom: 1rem;
}
</style>