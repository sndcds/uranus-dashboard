<template>
  <div class="organizer-card">
    <h2>{{ venue.venue_name }}</h2>
    <p><strong>ID:</strong> {{ venue.venue_id }}</p>
    <p>
      <strong>Permissions:</strong>
      {{ venue.can_edit ? 'Edit' : '-' }},
      {{ venue.can_delete_venue ? 'Delete' : '-' }}
    </p>
    <p><strong>Upcoming Events:</strong> {{ venue.upcoming_event_count }}</p>

    <div v-if="venue.spaces.length" class="spaces">
      <h3>Spaces</h3>
      <ul>
        <li v-for="space in venue.spaces" :key="space.space_id">
          {{ space.space_name }} (Upcoming Events: {{ space.upcoming_event_count }})
        </li>
      </ul>
    </div>
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

defineProps<{
  venue: Venue
}>()
</script>

<style scoped lang="scss">
.organizer-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  transition: border 0.2s, box-shadow 0.2s;
  background-color: #fafafa;

  &:hover {
    border-color: #aaa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  h2 {
    margin: 0 0 8px 0;
    font-size: 1.2rem;
  }

  .spaces {
    margin-top: 12px;

    h3 {
      margin: 0 0 4px 0;
      font-size: 1rem;
    }

    ul {
      padding-left: 20px;
      margin: 0;

      li {
        font-size: 0.95rem;
        margin-bottom: 2px;
      }
    }
  }
}
</style>