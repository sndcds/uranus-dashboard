<template>
  <article class="uranus-card">
    <header>
      <div>
        <h2>{{ venue.venue_name }}</h2>
      </div>
      <p>
        <span>{{ venue.upcoming_event_count }}</span>
        <span>{{ t('events') }}
          <router-link v-if="venue.can_edit_venue" :to="`/admin/organizer/${organizerId}/venue/${venue.venue_id}/edit`"
            class="uranus-secondary-button">
            {{ t('edit_venue') }}
          </router-link>
        </span>
      </p>
    </header>

    <section>
      <div>
        <h3>{{ t('spaces') }}</h3>
        <router-link v-if="venue.can_add_space"
          :to="`/admin/organizer/${organizerId}/venue/${venue.venue_id}/space/create`" class="uranus-secondary-button">
          {{ t('add_new_space') }}
        </router-link>
      </div>

      <template v-if="venue.spaces.length">
        <ul>
          <li v-for="space in venue.spaces" :key="space.space_id">
            <div>
              <span>{{ space.space_name }}</span>
              <span>
                {{ space.upcoming_event_count }}
                <span>{{ t('events') }}
                  <router-link v-if="venue.can_edit_space"
                    :to="`/admin/organizer/${organizerId}/venue/${venue.venue_id}/space/${space.space_id}/edit`"
                    class="uranus-secondary-button">
                    {{ t('edit_space') }}
                  </router-link>
                </span>
              </span>
            </div>
          </li>
        </ul>
      </template>
      <p v-else>{{ t('spaces_empty') }}</p>
    </section>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()

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
</style>
