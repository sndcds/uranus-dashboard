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
      <ul class="venue-space-list">
        <li v-for="space in venue.spaces" :key="space.space_id" class="venue-space">
          <div>{{ space.space_name }} ({{ space.upcoming_event_count }} events) </div>
          <div class="venue-space-action">
            <router-link :to="`/venues/${venue.venue_id}/spaces/${space.space_id}/events/new`"
              v-if="venue.can_add_event">Add Event</router-link>
            <router-link :to="`/venues/${venue.venue_id}/spaces/${space.space_id}/edit`"
              v-if="venue.can_edit_space">Edit</router-link>
            <router-link :to="`/venues/${venue.venue_id}/spaces/${space.space_id}/delete`"
              v-if="venue.can_delete_space">Delete</router-link>
          </div>
        </li>
      </ul>
    </div>
    <router-link :to="`/organizer/${organizerId}/venue/${venue.venue_id}/space/create`" v-if="venue.can_add_space" class="new-venue-space">Add New
      Space</router-link>

  </div>
</template>

<script setup lang="ts">

import { defineProps } from 'vue'

defineProps<{
  venue: Venue
  organizerId: number
}>()

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
</script>

<style scoped lang="scss">
.new-venue-space {
  display: inline-block;
  margin-top: 12px;
  padding: 6px 12px;
  background-color: seagreen;
  color: white;
  text-decoration: none;
  border-radius: 4px;

  &:hover {
    background-color: mediumseagreen;
  }
}

ul.venue-space-list {
  margin: 0;
  padding: 0;

  li {
    margin-bottom: 18px;
  }
}

.venue-space {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 6px;

  .venue-space-action>a {
    background-color: cornflowerblue;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    text-decoration: none;
    margin-left: 8px;

    &:hover {
      background-color: royalblue;
    }
  }
}

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

  .permissions>ul {
    margin: 0;
    padding-left: 20px;
    list-style: disc;
  }

  .permissions {
    margin-bottom: 8px;
  }
}
</style>