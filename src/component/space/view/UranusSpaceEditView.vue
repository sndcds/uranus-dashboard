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

    <nav class="tabs">
      <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="{ active: tab.key === activeTab, dirty: isTabDirty(tab.key) }"
          @click="activeTab = tab.key"
      >
        <span>{{ tab.label }}</span>
        <span
            v-if="isTabDirty(tab.key)"
            class="tab-dirty-indicator"
            title="Ungespeicherte Änderungen"
            aria-label="Ungespeicherte Änderungen"
        ></span>
      </button>
    </nav>

    <section class="tab-content">
      <component
          :is="currentTabComponent"
          @dirty-change="setActiveTabDirty"
      />
    </section>
  </template>

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
      <UranusButton variant="danger" @click="discardChangesAndLeave">
        Bearbeitung verwerfen
      </UranusButton>
    </template>
  </UranusModal>
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
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusModal from '@/component/uranus/UranusModal.vue'

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

<style scoped>
.space-editor {
  width: 100%;
}

.tabs {
  display: flex;
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
  border-bottom: 4px solid var(--uranus-color);
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
  width: 100%;
  max-width: 1024px;
  padding: 1rem 0;
}

.unsaved-changes-text {
  margin: 0;
  line-height: 1.5;
}
</style>
