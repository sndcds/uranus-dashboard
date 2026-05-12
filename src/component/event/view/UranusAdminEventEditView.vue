<!--
  src/component/event/view/UranusAdminEventEditView.vue
-->

<template>
  <div class="event-editor">
    <div class="event-editor-status-header">
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <UranusButton size="small" variant="tertiary" @click="goBack">
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
              :class="{ active: tab.key === activeTab, dirty: isTabDirty(tab.key) }"
              @click="activeTab = tab.key"
          >
            <span>{{ t(tab.labelKey) }}</span>
            <span
                v-if="isTabDirty(tab.key)"
                class="tab-dirty-indicator"
                :aria-label="unsavedChangesLabel"
                :title="unsavedChangesLabel"
            ></span>
          </button>
        </nav>

      </template>
    </div>

    <template v-if="adminEventStore.isLoaded && adminEventStore.draft">
      <section class="tab-content">
        <component
            :is="currentTabComponent"
            @dirty-change="setActiveTabDirty"
        />
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

  <UranusModal
      :show="showUnsavedChangesModal"
      title="Ungespeicherte Änderungen"
      max-width="520px"
      @close="closeUnsavedChangesModal"
  >
    <p class="unsaved-changes-text">
      Es gibt ungespeicherte Änderungen. Möchtest du die Bearbeitung verwerfen oder zur Bearbeitung zurückkehren?
    </p>

    <template #actions>
      <UranusButton variant="tertiary" @click="closeUnsavedChangesModal">
        Zurück zur Bearbeitung
      </UranusButton>
      <UranusButton variant="danger" @click="discardChangesAndGoBack">
        Bearbeitung verwerfen
      </UranusButton>
    </template>
  </UranusModal>

</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import { type AdminEventDTO } from '@/api/dto/adminEvent.dto.ts'
import UranusAdminEventBaseTab from '@/component/event/editor/UranusAdminEventBaseTab.vue'
import UranusAdminEventDatesTab from '@/component/event/editor/UranusAdminEventDatesTab.vue'
import UranusAdminEventTagsTab from '@/component/event/editor/UranusAdminEventTagsTab.vue'
import UranusAdminEventLinksTabs from '@/component/event/editor/UranusAdminEventLinksTabs.vue'
import UranusAdminEventParticipateTab from '@/component/event/editor/UranusAdminEventParticipateTab.vue'
import UranusAdminEventVenueTab from '@/component/event/editor/UranusAdminEventVenueTab.vue'
import UranusAdminEventRegisterTab from '@/component/event/editor/UranusAdminEventRegisterTab.vue'
import UranusAdminEventTicketTab from '@/component/event/editor/UranusAdminEventTicketTab.vue'
import UranusEventReleaseModal from '@/component/event/ui/UranusEventReleaseModal.vue'
import UranusAdminEventVisitorInfo from '@/component/event/editor/UranusAdminEventVisitorInfo.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusModal from '@/component/uranus/UranusModal.vue'
import { StepBack, Rocket } from 'lucide-vue-next'

const showReleaseModal = ref(false)
const showUnsavedChangesModal = ref(false)

const { t, te, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const adminEventStore = useAdminEventStore()


function goBack() {
  if (hasDirtyTabs.value) {
    showUnsavedChangesModal.value = true
    return
  }

  void navigateBack()
}

function closeUnsavedChangesModal() {
  showUnsavedChangesModal.value = false
}

function discardChangesAndGoBack() {
  showUnsavedChangesModal.value = false
  void navigateBack()
}

async function navigateBack() {
  await router.push({ name: 'admin-org-events' })
}

// Add this after your store import
const draftEvent = computed(() => adminEventStore.draft ?? {
  id: null,
  releaseStatus: null,
  releaseDate: null,
})

const eventUuid = computed(() => { return route.params.uuid })
const unsavedChangesLabel = computed(() =>
    te('unsaved_changes') ? t('unsaved_changes') : 'Es gibt ungespeicherte Änderungen.'
)

type TabKey = 'base' | 'dates' | 'venue' | 'tags' | 'links' | 'participate' | 'register' | 'ticket' | 'visitor'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', labelKey: 'event_tab_base' },
  { key: 'venue', labelKey: 'event_tab_venue' },
  { key: 'dates', labelKey: 'event_tab_dates' },
  { key: 'tags', labelKey: 'event_tab_tags' },
  { key: 'links', labelKey: 'event_tab_links' },
  { key: 'participate', labelKey: 'event_tab_participate' },
  { key: 'register', labelKey: 'event_tab_register' },
  { key: 'ticket', labelKey: 'event_tab_ticket' },
  { key: 'visitor', labelKey: 'event_tab_visitor' },
] as const

const tabDirtyState = ref<Record<TabKey, boolean>>(createCleanDirtyState())

const hasDirtyTabs = computed(() =>
    Object.values(tabDirtyState.value).some(Boolean)
)

function createCleanDirtyState(): Record<TabKey, boolean> {
  return {
    base: false,
    venue: false,
    dates: false,
    tags: false,
    links: false,
    participate: false,
    register: false,
    ticket: false,
    visitor: false,
  }
}

function isTabDirty(tabKey: TabKey) {
  return tabDirtyState.value[tabKey]
}

function setActiveTabDirty(isDirty: boolean) {
  tabDirtyState.value[activeTab.value] = isDirty
}

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'dates': return UranusAdminEventDatesTab
    case 'venue': return UranusAdminEventVenueTab
    case 'tags': return UranusAdminEventTagsTab
    case 'links': return UranusAdminEventLinksTabs
    case 'participate': return UranusAdminEventParticipateTab
    case 'register': return UranusAdminEventRegisterTab
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
    tabDirtyState.value = createCleanDirtyState()
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
  border-bottom: 1px solid var(--uranus-color);
}

.tabs button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;

}

.tabs button.active {
  border-bottom: 3px solid var(--uranus-color);
  font-weight: bold;
}

.tabs button.dirty {
  color: var(--uranus-link-color);
}

.tab-dirty-indicator {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--uranus-link-color);
}

.tab-content {
  padding: 1rem;
}

.unsaved-changes-text {
  margin: 0;
  line-height: 1.5;
}
</style>
