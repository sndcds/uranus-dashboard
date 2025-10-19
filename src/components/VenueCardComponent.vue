<template>
  <div class="venue-card">
    <h3>{{ venue.venue_name }}</h3>
    <p>Upcoming Events: {{ venue.upcoming_event_count }}</p>

    <div class="permissions">
      <h4>Permissions</h4>
      <ul>
        <li>Edit Venue: {{ venue.can_edit_venue ? 'Yes' : 'No' }}</li>
        <li>Delete Venue: {{ venue.can_delete_venue ? 'Yes' : 'No' }}</li>
        <li>Add Space: {{ venue.can_add_space ? 'Yes' : 'No' }}</li>
        <li>Edit Space: {{ venue.can_edit_space ? 'Yes' : 'No' }}</li>
        <li>Delete Space: {{ venue.can_delete_space ? 'Yes' : 'No' }}</li>
        <li>Add Event: {{ venue.can_add_event ? 'Yes' : 'No' }}</li>
        <li>Edit Event: {{ venue.can_edit_event ? 'Yes' : 'No' }}</li>
        <li>Delete Event: {{ venue.can_delete_event ? 'Yes' : 'No' }}</li>
        <li>Release Event: {{ venue.can_release_event ? 'Yes' : 'No' }}</li>
        <li>Can Edit Overall: {{ venue.can_edit ? 'Yes' : 'No' }}</li>
      </ul>
    </div>

    <div v-if="venue.spaces.length">
      <h4>Spaces</h4>
      <ul>
        <li v-for="space in venue.spaces" :key="space.space_id">
          {{ space.space_name }} ({{ space.upcoming_event_count }} events)
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

defineProps<{
  venue: Venue
}>()
</script>

<style scoped lang="scss">
.venue-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  background-color: #fafafa;

  h3 {
    margin: 0 0 8px 0;
  }

  h4 {
    margin: 12px 0 4px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    list-style: disc;
  }

  .permissions {
    margin-bottom: 8px;
  }
}
</style>