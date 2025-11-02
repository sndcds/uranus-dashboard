<template>
  <div
      class="uranus-card"
      :class="{ 'organizer-card--active': appStore.organizerId === organizer.organizer_id }"
      data-ribbon-label="⭐">
    <header>
      <h2>{{ organizer.organizer_name }}</h2>
    </header>

    <div class="organizer-card__button-group">
      <router-link :to="`/admin/organizer/${organizer.organizer_id}/edit`" class="uranus-secondary-button">
        {{ t('edit_organizer') }}
      </router-link>
      <button class="uranus-secondary-button"
        :class="{ 'uranus-secondary-button--active': appStore.organizerId === organizer.organizer_id }"
        @click="assignOrganizer(organizer.organizer_id)">
        {{ appStore.organizerId === organizer.organizer_id ? t('organizer_active') : t('organizer_activate') }}
      </button>
    </div>

    <div v-if="organizer.venues.length" class="organizer-card__content">
      <table class="organizer-card__table simple-table">
        <thead>
          <tr>
            <th class="organizer-card__table-header">Venue</th>
            <th class="organizer-card__table-header organizer-card__table-header--right">Spaces</th>
            <th class="organizer-card__table-header organizer-card__table-header--right">Events</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venue in organizer.venues" :key="venue.venue_id" class="organizer-card__table-row">
            <td class="organizer-card__table-cell">
              <strong class="organizer-card__venue-name">{{ venue.venue_name }}</strong>
            </td>
            <td class="organizer-card__table-cell organizer-card__table-cell--right">
              {{ venue.spaces.length }}
            </td>
            <td class="organizer-card__table-cell organizer-card__table-cell--right">
              {{ venue.upcoming_event_count }}
            </td>
          </tr>
          <tr class="organizer-card__table-row organizer-card__table-row--total">
            <td class="organizer-card__table-cell">
              <strong class="organizer-card__total-label">Total</strong>
            </td>
            <td class="organizer-card__table-cell organizer-card__table-cell--right"></td>
            <td class="organizer-card__table-cell organizer-card__table-cell--right">
              <strong class="organizer-card__total-value">{{ organizer.total_upcoming_events }}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="organizer-card__empty">
      <em class="organizer-card__empty-text">No venues found</em>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/appStore'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()
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

function assignOrganizer(id: number) {
  appStore.setOrganizerId(id)
}
</script>

<style scoped lang="scss">
// OrganizerCardComponent - Global style compliant

.organizer-card {
  @include form-card(100%, clamp(1.25rem, 3vw, 1.75rem), clamp(0.75rem, 2vw, 1.25rem));
  position: relative;
  min-height: 280px;
  border: 4px solid transparent;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;

  // Active state styling
  &.organizer-card--active {
    &::after {
      content: attr(data-ribbon-label);
      position: absolute;
      font-size: 1.7rem;
      top: 15px;
      right: 15px;
      pointer-events: none;
    }
  }
}

// Header section
.organizer-card__header {
  gap: 0;
}

.organizer-card__title {
  margin: 0;
  font-size: clamp(1.1rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}

// Content section
.organizer-card__content {
  flex: 1;
  margin-bottom: 1rem;
}

// Table styling
.organizer-card__table {
  font-size: 0.9rem;
  color: var(--color-text);
}

.organizer-card__table-header {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 2px solid var(--border-soft);
  padding: 0.5rem 0.75rem;

  &--right {
    text-align: right;
  }
}

.organizer-card__table-row {
  &:first-child td {
    border-top: none;
  }

  &--total {
    border-top: 2px solid var(--border-soft);
    background: var(--surface-muted);
  }
}

.organizer-card__table-cell {
  padding: 0.5rem 0.75rem;
  color: var(--color-text);

  &--right {
    text-align: right;
  }
}

.organizer-card__venue-name {
  color: var(--color-text);
  font-weight: 600;
}

.organizer-card__total-label,
.organizer-card__total-value {
  color: var(--color-text);
  font-weight: 700;
}

// Empty state
.organizer-card__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.organizer-card__empty-text {
  color: var(--muted-text);
  font-style: italic;
  text-align: center;
}

// Footer section
.organizer-card__footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-soft);
}

.organizer-card__button-group {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.organizer-card__button {
  @include form-secondary-button();
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;

  // Active state for button
  &--active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);

    &:hover {
      background: var(--accent-secondary);
      border-color: var(--accent-secondary);
    }
  }
}

.organizer-card__edit-btn {
  @include form-secondary-button();

  &:hover {
    text-decoration: none;
  }
}

// Responsive adjustments
@media (min-width: 640px) {
  .organizer-card__table {
    font-size: 0.95rem;
  }

  .organizer-card__table-cell {
    padding: 0.625rem 0.875rem;
  }
}
</style>
