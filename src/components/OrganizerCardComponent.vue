<template>
  <div class="card" :class="{ 'card-active': appStore.organizerId === organizer.organizer_id }">
    <h2 class="card-title">{{ organizer.organizer_name }}</h2>
    <div v-if="organizer.venues.length" class="venues">
      <table class="simple-table">
        <thead>
          <tr>
            <th>Venue</th>
            <th style="text-align: right;">Spaces</th>
            <th style="text-align: right;">Events</th>
          </tr>
        </thead>
        <tbody>
        <tr v-for="venue in organizer.venues" :key="venue.venue_id">
          <td><strong>{{ venue.venue_name }}</strong></td>
          <td style="text-align: right;">{{ venue.spaces.length }} </td>
          <td style="text-align: right;"> {{ venue.upcoming_event_count }} </td>
        </tr>
        <tr>
          <td>Gesamt</td>
          <td></td>
          <td style="text-align: right;">{{ organizer.total_upcoming_events }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <em>No venues found</em>
    </div>
    <button class="small-button left" @click="assignOrganizer(organizer.organizer_id)">
      Activate
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/appStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed } from "vue";

const appStore = useAppStore()
const router = useRouter()
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

defineProps<{ organizer: Organizer }>()

const isActive = (id: number) => computed(() => appStore.organizerId === id)

function assignOrganizer(id: number) {
  appStore.setOrganizerId(id)
  console.log(id)
}

function goToOrganizer(id: number) {
  router.push(`/organizer/${id}`)
}
</script>

<style scoped lang="scss">
.card {
}

.active {
  background-color: red;
}

.right {
  position: absolute;
  display: inline-block;
  bottom: 10px;
  right: 10px;
}

.left {
  position: absolute;
  display: inline-block;
  bottom: 10px;
  left: 10px;
}

</style>