<!--
  src/view/admin/org/UranusOrgEditView.vue
-->

<template>
    <div v-if="orgStore.loading">Loading…</div>
    <div v-else-if="orgStore.error">{{ orgStore.error }}</div>

    <template v-else-if="orgStore.isLoaded">
      <h1>{{ t('org_editor') }}</h1>
      <p>{{ orgStore.draft?.name }}</p>

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
import UranusAdminOrgBaseTab from '@/component/org/editor/UranusAdminOrgBaseTab.vue'
import UranusAdminOrgMapTab from '@/component/org/editor/UranusAdminOrgMapTab.vue'
import UranusAdminOrgLogoTab from '@/component/org/editor/UranusAdminOrgLogoTab.vue'
import { useOrgStore } from '@/store/orgStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusModal from '@/component/uranus/UranusModal.vue'

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const orgStore = useOrgStore()
const orgUuid = computed(() => { return route.params.orgUuid as string})
const showUnsavedChangesModal = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)
const allowRouteLeave = ref(false)

type TabKey = 'base' | 'map' | 'logo'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'map', label: 'Map' },
  { key: 'logo', label: 'Logo' },
] as const
const tabDirtyState = ref<Record<TabKey, boolean>>(createCleanDirtyState())
const hasDirtyTabs = computed(() =>
    Object.values(tabDirtyState.value).some(Boolean)
)

function createCleanDirtyState(): Record<TabKey, boolean> {
  return {
    base: false,
    map: false,
    logo: false,
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
    case 'base': return UranusAdminOrgBaseTab
    case 'map': return UranusAdminOrgMapTab
    case 'logo': return UranusAdminOrgLogoTab
    default: return UranusAdminOrgBaseTab
  }
})

onMounted(async () => {
  if (!orgUuid.value) {
    orgStore.resetToEmpty()
    // orgStore.error = 'Invalid organizationId'
    return
  }

  orgStore.loading = true
  try {
    const apiPath = `/api/admin/org/${orgUuid.value}`
    const apiResponse = await apiFetch<any>(apiPath)
    orgStore.loadFromApi(apiResponse.data)
    tabDirtyState.value = createCleanDirtyState()
  } catch (e) {
    orgStore.error = 'Failed to load organization'
  } finally {
    orgStore.loading = false
  }
})

onUnmounted(() => {
  try {
    orgStore.clear()
  } catch (err) {
    console.error("Unmount error in UranusOrgEditView:", err)
  }
})
</script>

<style scoped>
.organization-editor {
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
