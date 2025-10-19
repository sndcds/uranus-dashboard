<template>
  <div class="organizer-card">
    <h2>{{ organizer.organizer_name }}</h2>
    <p><strong>Total Upcoming Events:</strong> {{ organizer.total_upcoming_events }}</p>

    <div v-if="organizer.venues.length" class="venues">
      <h3>Venues</h3>
      <ul>
        <li v-for="venue in organizer.venues" :key="venue.venue_id">
          <strong>{{ venue.venue_name }}</strong>
          <span> — {{ venue.spaces.length }} spaces</span>,
          <span> {{ venue.upcoming_event_count }} events</span>
        </li>
      </ul>
    </div>
    <div v-else>
      <em>No venues found</em>
    </div>
    <router-link :to="`/organizer/${organizer.organizer_id}`" class="organizer-detail">View Details</router-link>
  </div>
</template>

<script setup lang="ts">
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
</script>

<style scoped lang="scss">
.organizer-detail {
  display: inline-block;
  margin-top: 12px;
  color: #fff;
  text-decoration: none;
  background-color: #666;
  padding: 6px 12px;

  &:hover {
    text-decoration: underline;
  }
}
.organizer-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #aaa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  h2 {
    margin: 0 0 8px;
    font-size: 1.3rem;
  }

  h3 {
    margin: 12px 0 4px;
    font-size: 1.1rem;
  }

  ul {
    list-style: none;
    padding-left: 0;
    margin: 0;

    li {
      font-size: 0.95rem;
      margin-bottom: 4px;
    }
  }
}
</style>