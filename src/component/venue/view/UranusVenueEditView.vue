<!--
  src/view/admin/venue/UranusVenueEditView.vue

  TODO:
  - Load Indicator
  - Error Message
  - i18n
-->

<template>
  <div v-if="venueStore.loading">Loading…</div>
  <div v-else-if="venueStore.error">{{ venueStore.error }}</div>

  <template v-else-if="venueStore.isLoaded">
    <h1 class="uranus-admin-page-title">{{ t('edit_venue') }}</h1>
    <p>{{ venueStore.draft?.name }}</p>

    <nav class="uranus-tabs">
      <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="{ active: tab.key === activeTab, dirty: isTabDirty(tab.key) }"
          @click="activeTab = tab.key"
      >
        <span>{{ tab.label }}</span>
        <span
            v-if="isTabDirty(tab.key)"
            class="uranus-tab-dirty-indicator"
            :title="t('unsaved_changes')"
            :aria-label="t('unsaved_changes')"
        ></span>
      </button>
    </nav>

    <section class="uranus-tab-content">
      <component
          ref="activeTabComponentRef"
          :is="currentTabComponent"
          @dirty-change="setActiveTabDirty"
      />
    </section>
  </template>

  <UranusUnsavedChangesModal
      :show="showUnsavedChangesModal"
      @close="closeUnsavedChangesModal"
      @confirm="discardChangesAndLeave"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusAdminVenueBaseTab from '@/component/venue/editor/UranusAdminVenueBaseTab.vue'
import UranusAdminVenueMapTab from '@/component/venue/editor/UranusAdminVenueMapTab.vue'
import UranusAdminVenueLogoTab from '@/component/venue/editor/UranusAdminVenueLogoTab.vue'
import UranusAdminVenueImageTab from '@/component/venue/editor/UranusAdminVenueImageTab.vue'
import { useUranusVenueStore } from '@/store/venueStore.ts'
import UranusUnsavedChangesModal from "@/component/ui/modal/UranusUnsavedChangesModal.vue";
import { useSaveShortcut } from '@/composable/useSaveShortcut.ts'

type VenueEditorTabExpose = {
  commitTab?: () => Promise<void> | void
}

const { t } = useI18n({ useScope: 'global' })

const route = useRoute()
const router = useRouter()
const venueStore = useUranusVenueStore()
const venueUuid = computed(() => { return route.params.venueUuid as string })
const showUnsavedChangesModal = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)
const allowRouteLeave = ref(false)

type TabKey = 'base' | 'map' | 'logos' | 'images'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'map', label: 'Map' },
  { key: 'logos', label: 'Logo' },
  { key: 'images', label: 'Image' },
] as const
const tabDirtyState = ref<Record<TabKey, boolean>>(createCleanDirtyState())
const activeTabComponentRef = ref<VenueEditorTabExpose | null>(null)
const hasDirtyTabs = computed(() =>
    Object.values(tabDirtyState.value).some(Boolean)
)

function createCleanDirtyState(): Record<TabKey, boolean> {
  return {
    base: false,
    map: false,
    logos: false,
    images: false,
  }
}

function isTabDirty(tabKey: TabKey) {
  return tabDirtyState.value[tabKey]
}

function setActiveTabDirty(isDirty: boolean) {
  tabDirtyState.value[activeTab.value] = isDirty
}

async function saveActiveTab() {
  if (venueStore.saving || !isTabDirty(activeTab.value)) return
  await activeTabComponentRef.value?.commitTab?.()
}

useSaveShortcut(saveActiveTab, {
  enabled: () => venueStore.isLoaded,
})

function closeUnsavedChangesModal() {
  showUnsavedChangesModal.value = false
  pendingRoute.value = null
}

async function discardChangesAndLeave() {
  const routeToContinue = pendingRoute.value
  showUnsavedChangesModal.value = false
  pendingRoute.value = null
  allowRouteLeave.value = true

  if (routeToContinue) {
    await router.push(routeToContinue)
  }
}

onBeforeRouteLeave((to) => {
  if (allowRouteLeave.value || !hasDirtyTabs.value) {
    return true
  }

  pendingRoute.value = to
  showUnsavedChangesModal.value = true
  return false
})

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'base': return UranusAdminVenueBaseTab
    case 'map': return UranusAdminVenueMapTab
    case 'logos': return UranusAdminVenueLogoTab
    case 'images': return UranusAdminVenueImageTab
    default: return UranusAdminVenueBaseTab
  }
})

onMounted(async () => {
  if (!venueUuid.value) {
    venueStore.resetToEmpty?.() // optional chaining in case method doesn't exist
    venueStore.error = 'Invalid venueUuid'
    return
  }

  venueStore.loading = true
  try {
    const apiPath = `/api/admin/venue/${venueUuid.value}`
    const apiResponse = await apiFetch<any>(apiPath)
    const venueData = apiResponse.data
    if (venueData) {
      venueStore.loadFromApi?.(venueData)
      tabDirtyState.value = createCleanDirtyState()
    } else {
      venueStore.error = 'No data returned from API'
    }
  } catch (e) {
    venueStore.error = 'Failed to load venue'
  } finally {
    venueStore.loading = false
  }
})

onUnmounted(() => {
  try {
    venueStore.clear()
  } catch (err) {
    console.error("Unmount error in UranusVenueEditView:", err)
  }
})
</script>
