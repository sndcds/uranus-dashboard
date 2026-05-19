<!--
  src/component/venue/UranusVenueUuidList.vue
-->

<template>
  <div class="venue-uuid-list">
    <div class="venue-uuid-list__header">
      <span class="venue-uuid-list__label">{{ label }}</span>
      <UranusButton size="small" variant="secondary" @click="showModal = true">
        {{ t('add_element') }}
      </UranusButton>
    </div>

    <div v-if="venueItems.length" class="venue-uuid-list__items">
      <div
          v-for="item in venueItems"
          :key="item.uuid"
          class="venue-uuid-list__item"
      >
        <div class="venue-uuid-list__main">
          <span class="venue-uuid-list__name">{{ item.name || item.uuid }}</span>
          <span class="venue-uuid-list__meta">{{ item.uuid }}</span>
          <span class="venue-uuid-list__meta">
            {{ [item.city, item.country].filter(Boolean).join(', ') || '-' }}
          </span>
        </div>

        <UranusIconAction
            :title="t('remove')"
            :icon="Trash2"
            icon-size="18"
            :on-click="() => removeVenue(item.uuid)"
        />
      </div>
    </div>

    <p v-else class="venue-uuid-list__empty">
      {{ t('venue_selection_empty') }}
    </p>

    <UranusVenueMapSelectModal
        :show="showModal"
        :title="t('select_venue')"
        @select="addVenue"
        @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trash2 } from 'lucide-vue-next'
import { apiFetch } from '@/api.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusVenueMapSelectModal from '@/component/venue/UranusVenueMapSelectModal.vue'
import type { UranusVenueMapSelection } from '@/component/venue/UranusVenueMapPicker.vue'

type VenueListItem = {
  uuid: string
  name: string
  city: string
  country: string
}

const props = defineProps<{
  modelValue: string[]
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const { t, locale } = useI18n({ useScope: 'global' })
const showModal = ref(false)
const venueDetails = ref<Record<string, VenueListItem>>({})

const venueItems = computed(() =>
    props.modelValue.map(uuid => venueDetails.value[uuid] ?? {
      uuid,
      name: '',
      city: '',
      country: '',
    })
)

watch(
    () => props.modelValue,
    uuids => {
      for (const uuid of uuids) {
        if (!venueDetails.value[uuid]) {
          void loadVenue(uuid)
        }
      }
    },
    { immediate: true }
)

async function loadVenue(uuid: string) {
  try {
    const response = await apiFetch<any>(`/api/venue/${uuid}?lang=${locale.value || 'en'}`)
    venueDetails.value = {
      ...venueDetails.value,
      [uuid]: {
        uuid,
        name: String(response.data?.name ?? ''),
        city: String(response.data?.city ?? ''),
        country: String(response.data?.country ?? ''),
      },
    }
  } catch (error) {
    console.error('[UranusVenueUuidList] Failed to load venue:', error)
    venueDetails.value = {
      ...venueDetails.value,
      [uuid]: {
        uuid,
        name: '',
        city: '',
        country: '',
      },
    }
  }
}

function addVenue(venue: UranusVenueMapSelection) {
  venueDetails.value = {
    ...venueDetails.value,
    [venue.uuid]: {
      uuid: venue.uuid,
      name: venue.name,
      city: venue.city,
      country: venue.country,
    },
  }

  if (props.modelValue.includes(venue.uuid)) return
  emit('update:modelValue', [...props.modelValue, venue.uuid])
}

function removeVenue(uuid: string) {
  emit('update:modelValue', props.modelValue.filter(item => item !== uuid))
}
</script>

<style scoped lang="scss">
.venue-uuid-list {
  display: grid;
  gap: 0.75rem;
}

.venue-uuid-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.venue-uuid-list__label {
  font-weight: 600;
}

.venue-uuid-list__items {
  display: grid;
  gap: 0.5rem;
}

.venue-uuid-list__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--uranus-card-border-color);
  border-radius: var(--uranus-tiny-border-radius);
}

.venue-uuid-list__main {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.venue-uuid-list__name {
  font-weight: 600;
}

.venue-uuid-list__meta {
  color: var(--uranus-color-4);
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}

.venue-uuid-list__empty {
  margin: 0;
  color: var(--uranus-color-4);
}
</style>
