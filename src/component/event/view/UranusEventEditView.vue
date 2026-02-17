<!--
  src/view/admin/UranusEditEventView.vue

  Uranus Event Editor

  2026-02-05, Roald
-->

<template>
  <div class="event-editor">
    <div v-if="adminEventStore.loading">Loading…</div>
    <div v-else-if="adminEventStore.error">{{ adminEventStore.error }}</div>

    <template v-else-if="adminEventStore.isLoaded">
      <header class="editor-header">
        <h1>{{ adminEventStore.draft?.title }}</h1>
        {{ eventId }}
      </header>

      <button @click="showReleaseModal = true">
        Edit Release Status / Date
      </button>

      <p>
        Current: Status {{ draftEvent.releaseStatus }}, Date {{ draftEvent.releaseDate }}
      </p>

      <UranusEventReleaseModal
          :show="showReleaseModal"
          :releaseStatus="draftEvent.releaseStatus"
          :releaseDate="draftEvent.releaseDate"
          @update:releaseStatus="val => updateReleaseField('releaseStatus', val)"
          @update:releaseDate="val => updateReleaseField('releaseDate', val)"
          @close="showReleaseModal = false"
      />

      <!-- tabs -->
      <nav class="tabs">
        <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="{ active: tab.key === activeTab }"
            @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <section class="tab-content">
        <component :is="currentTabComponent" />
      </section>
    </template>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from "vue-i18n";
import { apiFetch } from "@/api.ts";

import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { type UranusAdminEventDTO } from '@/api/dto/UranusAdminEventDTO.ts'

import AdminEventBaseTab from '@/component/event/editor/AdminEventBaseTab.vue'
import AdminEventDatesTab from '@/component/event/editor/AdminEventDatesTab.vue'
import UranusMeta1Tab from "@/component/event/editor/UranusMeta1Tab.vue";
import AdminEventParticipationTab from "@/component/event/editor/AdminEventParticipationTab.vue";
import UranusEventVenueTab from "@/component/event/editor/UranusEventVenueTab.vue";
import AdminEventPriceTab from "@/component/event/editor/AdminEventPriceTab.vue";
import UranusEventReleaseModal from '@/component/event/ui/UranusEventReleaseModal.vue'

const showReleaseModal = ref(false)

const { locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const adminEventStore = useUranusAdminEventStore()

// Add this after your store import
const draftEvent = computed(() => adminEventStore.draft ?? {
  id: null,
  releaseStatus: null,
  releaseDate: null,
})

const eventId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
})

type TabKey = 'settings' | 'base' | 'dates' | 'venue' |'meta1' | 'participation' | 'price'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Was' },
  { key: 'venue', label: 'Wo' },
  { key: 'dates', label: 'Wann' },
  { key: 'meta1', label: '1' },
  { key: 'participation', label: '2' },
  { key: 'price', label: '3' }
] as const

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'dates': return AdminEventDatesTab
    case 'venue': return UranusEventVenueTab
    case 'meta1': return UranusMeta1Tab
    case 'participation': return AdminEventParticipationTab
    case 'price': return AdminEventPriceTab
    case 'base':
    default:
      return AdminEventBaseTab
  }
})

onMounted(async () => {
  if (!eventId.value) {
    adminEventStore.error = 'Invalid eventId'
    return
  }

  adminEventStore.loading = true
  try {
    const apiPath = `/api/admin/event/${eventId.value}?lang=${locale.value}`
    const response = await apiFetch<{ data: UranusAdminEventDTO }>(apiPath)
    adminEventStore.loadFromApi(response.data.data)
  } catch (e) {
    adminEventStore.error = 'Failed to load event'
  } finally {
    adminEventStore.loading = false
  }
})

onUnmounted(() => {
  try {
    adminEventStore.clear()
  } catch (err) {
    console.error("Unmount error in UranusEventEditView:", err)
  }
})

async function updateReleaseField(field: 'releaseStatus' | 'releaseDate', value: any) {
  if (!draftEvent.value || !adminEventStore.original) return

  // Update local draft
  draftEvent.value[field] = value

  // Build payload: only include changed fields
  const payload: Record<string, any> = {}
  if (draftEvent.value.releaseStatus !== adminEventStore.original.releaseStatus) {
    payload.release_status = draftEvent.value.releaseStatus
  }
  if (draftEvent.value.releaseDate !== adminEventStore.original.releaseDate) {
    payload.release_date = draftEvent.value.releaseDate
  }

  // Nothing changed
  if (Object.keys(payload).length === 0) return

  try {
    await apiFetch(`/api/admin/event/${draftEvent.value.id}/fields`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    // Commit changes locally
    if (payload.release_status !== undefined) adminEventStore.original.releaseStatus = draftEvent.value.releaseStatus
    if (payload.release_date !== undefined) adminEventStore.original.releaseDate = draftEvent.value.releaseDate
  } catch (err) {
    console.error("Failed to update release fields", err)
    adminEventStore.error = 'Failed to save release fields'
  }
}
</script>


<style scoped>
.event-editor {
  width: 100%;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #333;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;

}

.tabs button.active {
  border-bottom: 4px solid #000;
  font-weight: bold;
}

.tab-content {
  padding: 1rem 0;
}
</style>