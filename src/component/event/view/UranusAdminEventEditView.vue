<!--
  src/component/event/view/UranusAdminEventEditView.vue
-->

<template>
  <div class="event-editor">
    <div class="event-editor-status-header">
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <UranusButton size="small" variant="tertiary" :onclick="goBack">
          <template #icon><StepBack /></template>{{ t('finish_edit') }}
        </UranusButton>
        <UranusButton size="small" variant="tertiary" @click="showReleaseModal = true">
          <template #icon><Rocket /></template>{{ t('event_release_settings') }}
        </UranusButton>
      </div>

      <UranusDashboardHero :title="t('edit_event')"/>
      <div v-if="adminEventStore.loading">Loading…</div>
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
      @save="updateReleaseFields"
      @close="showReleaseModal = false"
  />

</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { getPreviousRoute } from '@/router'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import { type AdminEventDTO } from '@/api/dto/adminEvent.dto.ts'
import UranusAdminEventBaseTab from '@/component/event/editor/UranusAdminEventBaseTab.vue'
import UranusAdminEventDatesTab from '@/component/event/editor/UranusAdminEventDatesTab.vue'
import UranusAdminEventTagsTab from '@/component/event/editor/UranusAdminEventTagsTab.vue'
import UranusAdminEventLinksTabs from '@/component/event/editor/UranusAdminEventLinksTabs.vue'
import UranusAdminEventParticipationTab from '@/component/event/editor/UranusAdminEventParticipationTab.vue'
import UranusAdminEventVenueTab from '@/component/event/editor/UranusAdminEventVenueTab.vue'
import UranusAdminEventTicketTab from '@/component/event/editor/UranusAdminEventTicketTab.vue'
import UranusEventReleaseModal from '@/component/event/ui/UranusEventReleaseModal.vue'
import UranusAdminEventVisitorInfo from '@/component/event/editor/UranusAdminEventVisitorInfo.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import { StepBack, Rocket } from 'lucide-vue-next'

const showReleaseModal = ref(false)

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const adminEventStore = useAdminEventStore()


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

const eventUuid = computed(() => { return route.params.uuid })

type TabKey = 'settings' | 'base' | 'dates' | 'venue' | 'tags' | 'links' | 'participation' | 'ticket' | 'visitor'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Was' },
  { key: 'venue', label: 'Wo' },
  { key: 'dates', label: 'Wann' },
  { key: 'tags', label: 'Tags' },
  { key: 'links', label: 'Links' },
  { key: 'participation', label: 'Teilnahme' },
  { key: 'ticket', label: 'Ticket' },
  { key: 'visitor', label: 'Infos' }
] as const

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'dates': return UranusAdminEventDatesTab
    case 'venue': return UranusAdminEventVenueTab
    case 'tags': return UranusAdminEventTagsTab
    case 'links': return UranusAdminEventLinksTabs
    case 'participation': return UranusAdminEventParticipationTab
    case 'ticket': return UranusAdminEventTicketTab
    case 'visitor': return UranusAdminEventVisitorInfo
    case 'base':
    default:
      return UranusAdminEventBaseTab
  }
})

onMounted(async () => {
  if (!eventUuid.value) {
    adminEventStore.error = 'Invalid eventId'
    return
  }

  adminEventStore.loading = true
  try {
    const apiPath = `/api/admin/event/${eventUuid.value}?lang=${locale.value}`
    const apiResponse = await apiFetch<AdminEventDTO>(apiPath)
    adminEventStore.loadFromApi(apiResponse.data)
  } catch (e) {
    console.log(e)
    adminEventStore.error = 'Failed to load event'
    console.log(e)
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

async function updateReleaseFields(payload: {
  releaseStatus: string | null
  releaseDate: string | null
}) {
  if (!draftEvent.value || !adminEventStore.original) return

  // update local draft
  draftEvent.value.releaseStatus = payload.releaseStatus
  draftEvent.value.releaseDate = payload.releaseDate

  const body: Record<string, any> = {}

  if (payload.releaseStatus !== adminEventStore.original.releaseStatus) {
    body.release_status = payload.releaseStatus
  }

  if (payload.releaseDate !== adminEventStore.original.releaseDate) {
    body.release_date = payload.releaseDate
  }

  if (Object.keys(body).length === 0) return

  try {
    await apiFetch(`/api/admin/event/${eventUuid.value}/fields`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })

    if (body.release_status !== undefined) {
      adminEventStore.original.releaseStatus = payload.releaseStatus
    }
    if (body.release_date !== undefined) {
      adminEventStore.original.releaseDate = payload.releaseDate
    }
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