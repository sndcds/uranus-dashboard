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
.venue-card {
  @include form-section();
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 4vw, 1.5rem);
  padding: clamp(1rem, 4vw, 1.5rem);
}

.venue-card__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.venue-card__header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.venue-card__title {
  margin: 0;
  font-size: clamp(1.4rem, 5vw, 1.75rem);
  color: var(--color-text);
  flex: 1;
}

.venue-card__edit-btn {
  @include form-secondary-button($padding-y: 0.6rem, $padding-x: 1.2rem);
  text-decoration: none;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 600;

  &:hover {
    text-decoration: none;
  }
}

.venue-card__stat {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0;
  color: var(--muted-text);
  font-size: clamp(0.95rem, 3vw, 1.05rem);
}

.venue-card__stat-value {
  font-weight: 700;
  font-size: clamp(1.1rem, 4vw, 1.35rem);
  color: var(--accent-primary);
}

.venue-card__section-title {
  margin: 0;
  font-size: clamp(1.1rem, 3.5vw, 1.3rem);
  color: var(--color-text);
}

.venue-card__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
}

.venue-card__space-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 3vw, 1rem);
}

.venue-card__space {
  @include form-section();
  background: var(--surface-muted);
  border-radius: 14px;
  padding: clamp(0.85rem, 3vw, 1.1rem);
}

.venue-card__space-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.venue-card__space-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: clamp(1rem, 3vw, 1.1rem);
}

.venue-card__space-events {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  font-weight: 600;
  color: var(--accent-primary);
}

.venue-card__space-events-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  font-size: 0.85em;
  color: var(--muted-text);
}

.venue-card__action {
  @include form-secondary-button($padding-y: 0.7rem, $padding-x: 1.35rem);
  white-space: nowrap;
}

.venue-card__empty {
  margin: 0;
  padding: clamp(0.85rem, 3vw, 1.1rem);
  border-radius: 14px;
  background: var(--surface-muted);
  color: var(--muted-text);
  font-size: clamp(0.95rem, 2.5vw, 1.05rem);
}

@media (min-width: 640px) {
  .venue-card {
    padding: clamp(1.25rem, 4vw, 2rem);
    gap: clamp(1.25rem, 3vw, 2rem);
  }

  .venue-card__space-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
    gap: clamp(1rem, 3vw, 1.5rem);
  }

  .venue-card__space {
    padding: clamp(1rem, 3vw, 1.35rem);
  }
}

@media (min-width: 1024px) {
  .venue-card {
    padding: clamp(1.5rem, 4vw, 2.25rem);
  }

  .venue-card__header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .venue-card__stat {
    font-size: clamp(1rem, 2vw, 1.15rem);
  }
}
</style>