<!--
  src/view/admin/UranusEditEventView.vue

  Uranus Event Editor

  2026-02-05, Roald
-->

<template>
  <div class="event-editor">
    <div class="event-editor-status-header">
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <UranusButton size="small" variant="tertiary" :onclick="goBack">
          <template #icon><StepBack /></template>{{ t('finish_edit') }}
        </UranusButton>
        <UranusButton size="small" variant="tertiary" @click="showReleaseModal = true">
          <template #icon><Rocket /></template>{{ t('edit_event_release_status') }}
        </UranusButton>
      </div>

      <UranusDashboardHero :title="t('edit_event')"/>

      <div v-if="adminEventStore.loading">Loading…</div>
      <div v-else-if="adminEventStore.error">{{ adminEventStore.error }}</div>
      <template v-else-if="adminEventStore.isLoaded && adminEventStore.draft">
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

      </template>
    </div>

    <template v-if="adminEventStore.isLoaded && adminEventStore.draft">
      <section class="tab-content">
        <component :is="currentTabComponent" />
      </section>
    </template>
  </div>

  <UranusEventReleaseModal
      :show="showReleaseModal"
      :releaseStatus="draftEvent.releaseStatus"
      :releaseDate="draftEvent.releaseDate"
      @update:releaseStatus="val => updateReleaseField('releaseStatus', val)"
      @update:releaseDate="val => updateReleaseField('releaseDate', val)"
      @close="showReleaseModal = false"
  />

</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { getPreviousRoute } from '@/router'

import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { type UranusAdminEventDTO } from '@/api/dto/UranusAdminEventDTO.ts'

import AdminEventBaseTab from '@/component/event/editor/AdminEventBaseTab.vue'
import AdminEventDatesTab from '@/component/event/editor/AdminEventDatesTab.vue'
import AdminEventTagsTab from '@/component/event/editor/AdminEventTagsTab.vue'
import UranusEventLinksTab from '@/component/event/editor/UranusEventLinksTabs.vue'
import AdminEventParticipationTab from '@/component/event/editor/AdminEventParticipationTab.vue'
import AdminEventVenueTab from '@/component/event/editor/AdminEventVenueTab.vue'
import AdminEventPriceTab from '@/component/event/editor/AdminEventPriceTab.vue'
import UranusEventReleaseModal from '@/component/event/ui/UranusEventReleaseModal.vue'
import AdminEventVisitorInfo from '@/component/event/editor/AdminEventVisitorInfo.vue'
import UranusButton from '@/component/ui/UranusButton.vue'

import { StepBack, Rocket } from 'lucide-vue-next'
import UranusDashboardHero from "@/component/dashboard/UranusDashboardHero.vue";

const showReleaseModal = ref(false)

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const adminEventStore = useUranusAdminEventStore()


function goBack() {
  const prev = getPreviousRoute()
  if (prev?.fullPath) {
    router.push(prev.fullPath)
  } else {
    router.push({ name: 'admin-dashboard' }) // fallback
  }
}

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

type TabKey = 'settings' | 'base' | 'dates' | 'venue' | 'tags' | 'links' | 'participation' | 'price' | 'visitor'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Was' },
  { key: 'venue', label: 'Wo' },
  { key: 'dates', label: 'Wann' },
  { key: 'tags', label: 'Tags' },
  { key: 'links', label: 'Links' },
  { key: 'participation', label: 'Teilnahme' },
  { key: 'price', label: 'Preis' },
  { key: 'visitor', label: 'Infos' }
] as const

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'dates': return AdminEventDatesTab
    case 'venue': return AdminEventVenueTab
    case 'tags': return AdminEventTagsTab
    case 'links': return UranusEventLinksTab
    case 'participation': return AdminEventParticipationTab
    case 'price': return AdminEventPriceTab
    case 'visitor': return AdminEventVisitorInfo
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
    console.log(e)
  } finally {
    adminEventStore.loading = false
  }

  console.log("/// original: ", adminEventStore?.original?.visitorInfoFlags)
  console.log("/// draft: ", adminEventStore?.draft?.visitorInfoFlags)
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

.event-editor-status-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--uranus-bg);
  padding: 1rem;
  width: 100%;
  overflow: hidden;
}

.tabs {
  display: flex;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;

}

.tabs button.active {
  border-bottom: 3px solid #000;
  font-weight: bold;
}

.tab-content {
  padding: 1rem;
}
</style>