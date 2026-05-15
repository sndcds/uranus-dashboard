<!--
  src/view/admin/space/UranusSpaceEditView.vue

  Uranus Space Editor

  2026-02-13, Roald

  TODO:
  - Loading Indicator
  - Error Message
  - i18n
-->

<template>
  <div v-if="spaceStore.loading">Loading…</div>
  <div v-else-if="spaceStore.error">{{ spaceStore.error }}</div>

  <template v-else-if="spaceStore.isLoaded">
    <h1 class="uranus-admin-page-title">{{ t('edit_space') }}</h1>
    <p>{{ spaceStore.draft?.name }}</p>

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
import SpaceBaseTab from '@/component/space/editor/UranusSpaceBaseTab.vue'
import SpaceAccessibilityTab from '@/component/space/editor/UranusSpaceAccessibilityTab.vue'
import { useUranusSpaceStore } from '@/store/spaceStore.ts'
import type { SpaceDTO } from '@/api/dto/space.dto.ts'
import UranusUnsavedChangesModal from '@/component/ui/modal/UranusUnsavedChangesModal.vue'
import { useSaveShortcut } from '@/composable/useSaveShortcut.ts'

type SpaceEditorTabExpose = {
  commitTab?: () => Promise<void> | void
}

const { t } = useI18n({ useScope: 'global' })

const route = useRoute()
const router = useRouter()
const spaceStore = useUranusSpaceStore()
const spaceUuid = computed(() => { return route.params.spaceUuid as string })
const venueUuid = computed(() => route.params.venueUuid as string)
const showUnsavedChangesModal = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)
const allowRouteLeave = ref(false)

type TabKey = 'base' | 'accessibility'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'accessibility', label: 'Accessibility' },
] as const
const tabDirtyState = ref<Record<TabKey, boolean>>(createCleanDirtyState())
const activeTabComponentRef = ref<SpaceEditorTabExpose | null>(null)
const hasDirtyTabs = computed(() =>
    Object.values(tabDirtyState.value).some(Boolean)
)

function createCleanDirtyState(): Record<TabKey, boolean> {
  return {
    base: false,
    accessibility: false,
  }
}

function isTabDirty(tabKey: TabKey) {
  return tabDirtyState.value[tabKey]
}

function setActiveTabDirty(isDirty: boolean) {
  tabDirtyState.value[activeTab.value] = isDirty
}

async function saveActiveTab() {
  if (spaceStore.saving || !isTabDirty(activeTab.value)) return
  await activeTabComponentRef.value?.commitTab?.()
}

useSaveShortcut(saveActiveTab, {
  enabled: () => spaceStore.isLoaded,
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
    case 'base': return SpaceBaseTab
    case 'accessibility': return SpaceAccessibilityTab
    default: return SpaceBaseTab
  }
})

onMounted(async () => {
  // Create Mode
  if (!spaceUuid.value) {
    if (!venueUuid.value) {
      spaceStore.resetToEmpty(null as any)
      spaceStore.error = 'Missing venueUuid for new space'
      return
    }

    spaceStore.resetToEmpty(venueUuid.value)
    tabDirtyState.value = createCleanDirtyState()
    return
  }

  // Edit Mode
  spaceStore.loading = true
  try {
    const apiPath = `/api/admin/space/${spaceUuid.value}`
    const apiResponse = await apiFetch<SpaceDTO>(apiPath)
    spaceStore.loadFromApi(apiResponse.data)
    tabDirtyState.value = createCleanDirtyState()
  } catch (e) {
    spaceStore.error = 'Failed to load space'
  } finally {
    spaceStore.loading = false
  }
})

onUnmounted(() => {
  try {
    spaceStore.clear()
  } catch (err) {
    console.error('Unmount error in UranusSpaceEditView:', err)
  }
})
</script>
