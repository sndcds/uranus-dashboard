<!--
  src/component/venue/UranusAdminVenueSelectModal.vue
-->

<template>
  <UranusModal
      :show="show"
      :title="t('select_venue')"
      @close="$emit('close')"
      :maxWidth="modalMaxWidth"
  >
    <template v-if="viewMode === 'success'">
      <div class="venue-request-success">
        {{ t('venue_request_success_followup', { venueName: requestedVenueName }) }}
      </div>
    </template>

    <template v-else-if="viewMode === 'list'">
      <!-- Container for autoscroll -->
      <div class="venue-space-list" ref="containerRef">
        <div
            v-for="venue in venueSpaceInfos"
            :key="venue.venueUuid"
            class="venue-group"
        >
          <div
              class="venue-item"
              :class="{ selected: isSelected(venue.venueUuid, null) }"
              @click="select(venue.venueUuid, null)"
          >
            {{ venue.venueName }} ({{ venue.city }})
          </div>

          <div
              v-for="space in venue.spaces"
              :key="space.spaceUuid ?? 0"
              class="space-item"
              :class="{ selected: isSelected(venue.venueUuid, space.spaceUuid) }"
              @click="select(venue.venueUuid, space.spaceUuid)"
          >
            {{ space.spaceName }}
          </div>
        </div>
      </div>

      <div class="venue-select-actions">
        <UranusButton variant="secondary" @click="showMap">
          {{ t('venue_search_on_map') }}
        </UranusButton>
      </div>
    </template>

    <template v-else>
      <UranusAdminVenueRequestMap @venue-requested="showRequestSuccess" />

      <div class="venue-select-actions">
        <UranusButton variant="secondary" @click="showList">
          {{ t('venue_back_to_list') }}
        </UranusButton>
      </div>
    </template>

    <template #actions>
      <UranusButton variant="tertiary" @click="$emit('close')">
        {{ t('cancel') }}
      </UranusButton>
    </template>
  </UranusModal>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusAdminVenueRequestMap from '@/component/venue/UranusAdminVenueRequestMap.vue'
import { type BasicVenueSpacesInfo } from '@/domain/venue/basicVenueInfo.model.ts'

const { t } = useI18n()

const props = defineProps<{
  show: boolean
  venueSpaceInfos: BasicVenueSpacesInfo[]
  modelValue: { venueUuid: string | null; spaceUuid: string | null }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { venueUuid: string | null; spaceUuid: string | null }): void
  (e: 'close'): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const viewMode = ref<'list' | 'map' | 'success'>('list')
const requestedVenueName = ref('')
const modalMaxWidth = computed(() => viewMode.value === 'map' ? '960px' : '600px')


// Select a venue/space
function select(venueUuid: string, spaceUuid: string | null) {
  emit('update:modelValue', { venueUuid, spaceUuid })
  emit('close')
}

// Check if a venue/space is selected
function isSelected(venueUuid: string, spaceUuid: string | null) {
  return props.modelValue?.venueUuid === venueUuid && props.modelValue?.spaceUuid === spaceUuid
}

function showMap() {
  viewMode.value = 'map'
}

function showList() {
  viewMode.value = 'list'
}

function showRequestSuccess(venueName: string) {
  requestedVenueName.value = venueName
  viewMode.value = 'success'
}

// Auto-scroll selected item when modal opens
watch(() => props.show, async (val) => {
  if (!val) return
  viewMode.value = 'list'
  await nextTick()
  const selectedEl = containerRef.value?.querySelector('.selected') as HTMLElement | null
  selectedEl?.scrollIntoView({ block: 'center', behavior: 'smooth' })
})
</script>

<style scoped lang="scss">
.venue-space-list {
  height: 400px;
  overflow-y: auto;
  border: 1px solid var(--uranus-card-border-color);
}

.venue-group {
  display: flex;
  flex-direction: column;
  gap: 0;

  .venue-item {
    font-weight: 600;
    padding: 0.4rem 0.6rem;
    cursor: pointer;
    background: var(--uranus-bg);

    &:hover {
      background: var(--uranus-select-hover);
    }
  }

  .space-item {
    padding: 0.4rem 2rem;
    cursor: pointer;
    background: var(--uranus-bg);

    &:hover {
      background: var(--uranus-select-hover);
    }
  }

  .selected {
    background: var(--uranus-select-bg) !important;
    color: var(--uranus-select-color);
  }
}

.venue-select-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.75rem;
}

.venue-request-success {
  padding: 1.25rem;
  border-radius: var(--uranus-tiny-border-radius);
  background: rgba(var(--uranus-feedback-success-rgb), 0.08);
  color: rgb(var(--uranus-feedback-success-rgb));
  font-weight: 500;
  line-height: 1.5;
}
</style>
