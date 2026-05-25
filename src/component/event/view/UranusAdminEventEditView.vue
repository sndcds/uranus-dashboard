<!--
  src/component/event/view/UranusAdminEventEditView.vue
-->

<template>
  <div class="event-editor">
    <div class="event-editor-status-header">
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center;">

        <UranusButton size="small" variant="tertiary" @click="goBack">
          <template #icon><StepBack /></template>{{ t('finish_edit') }}
        </UranusButton>

        <UranusButton
            v-if="canReleaseEvent"
            size="small"
            variant="tertiary"
            @click="showReleaseModal = true"
        >
          <template #icon><Rocket /></template>{{ t('event_release_settings') }}
        </UranusButton>

        <UranusEventReleaseChip :releaseStatus="releaseStatus ?? ''" />
      </div>

      <UranusDashboardHero :title="t('edit_event')"/>

      <div v-if="adminEventStore.loading">Loading…</div>
      <template v-else-if="adminEventStore.isLoaded && adminEventStore.draft">
        <nav class="uranus-tabs">
          <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="{ active: tab.key === activeTab, dirty: isTabDirty(tab.key) }"
              @click="activeTab = tab.key"
          >
            <span>{{ t(tab.labelKey) }}</span>
            <span
                v-if="isTabDirty(tab.key)"
                class="uranus-tab-dirty-indicator"
                :aria-label="unsavedChangesLabel"
                :title="unsavedChangesLabel"
            ></span>
          </button>
        </nav>
      </template>
    </div>

    <template v-if="adminEventStore.isLoaded && adminEventStore.draft">
      <section class="uranus-tab-content">
        <component
            ref="activeTabComponentRef"
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

  <UranusUnsavedChangesModal
      :show="showUnsavedChangesModal"
      @close="closeUnsavedChangesModal"
      @confirm="discardChangesAndGoBack"
  />
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
import { StepBack, Rocket } from 'lucide-vue-next'
import UranusUnsavedChangesModal from '@/component/ui/modal/UranusUnsavedChangesModal.vue'
import { useSaveShortcut } from '@/composable/useSaveShortcut.ts'
import UranusEventReleaseChip from "@/component/event/ui/UranusEventReleaseChip.vue";

type EventEditorTabExpose = {
  commitTab?: () => Promise<void> | void
}

const showReleaseModal = ref(false)
const showUnsavedChangesModal = ref(false)

const { t, locale } = useI18n({ useScope: 'global' })
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
    t('unsaved_changes')
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
const activeTabComponentRef = ref<EventEditorTabExpose | null>(null)

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


const canReleaseEvent = computed(() => {
  return adminEventStore.original?.canRelease
})

const releaseStatus = computed(() => {
  return adminEventStore.original?.releaseStatus ?? null
})

function isTabDirty(tabKey: TabKey) {
  return tabDirtyState.value[tabKey]
}

function setActiveTabDirty(isDirty: boolean) {
  tabDirtyState.value[activeTab.value] = isDirty
}

async function saveActiveTab() {
  if (adminEventStore.saving || !isTabDirty(activeTab.value)) return
  await activeTabComponentRef.value?.commitTab?.()
}

useSaveShortcut(saveActiveTab, {
  enabled: () => adminEventStore.isLoaded,
})

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
  padding: 0 32px 32px 32px;
  width: 100%;
}

.event-editor-status-header {
  padding-top: 32px;
  position: sticky;
  top: 0px;
  z-index: 10;
  background: var(--uranus-bg);
}

</style>
