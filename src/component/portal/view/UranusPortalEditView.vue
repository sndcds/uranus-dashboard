<template>
  <div v-if="portalStore.loading">Loading...</div>
  <div v-else-if="portalStore.error">{{ portalStore.error }}</div>

  <template v-else-if="portalStore.isLoaded">
    <h1 class="uranus-admin-page-title">{{ t('edit_portal') }}</h1>
    <p>{{ portalStore.draft?.name }}</p>

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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusAdminPortalBaseTab from '@/component/portal/editor/UranusAdminPortalBaseTab.vue'
import UranusAdminPortalPrefilterTab from '@/component/portal/editor/UranusAdminPortalPrefilterTab.vue'
import UranusAdminPortalStyleTab from '@/component/portal/editor/UranusAdminPortalStyleTab.vue'
import UranusAdminPortalGeometryTab from '@/component/portal/editor/UranusAdminPortalGeometryTab.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusModal from '@/component/uranus/UranusModal.vue'
import { useUranusPortalStore } from '@/store/portalStore.ts'
import type { PortalDTO } from '@/domain/portal/portal.model.ts'

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const portalStore = useUranusPortalStore()
const portalUuid = computed(() => route.params.portalUuid as string)

type TabKey = 'base' | 'prefilter' | 'style' | 'geometry'
const activeTab = ref<TabKey>('base')
const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'prefilter', label: 'Filter' },
  { key: 'style', label: 'Style' },
  { key: 'geometry', label: 'Geometry' },
] as const
const tabDirtyState = ref<Record<TabKey, boolean>>(createCleanDirtyState())
const showUnsavedChangesModal = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)
const allowRouteLeave = ref(false)

const hasDirtyTabs = computed(() => Object.values(tabDirtyState.value).some(Boolean))
const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'base': return UranusAdminPortalBaseTab
    case 'prefilter': return UranusAdminPortalPrefilterTab
    case 'style': return UranusAdminPortalStyleTab
    case 'geometry': return UranusAdminPortalGeometryTab
    default: return UranusAdminPortalBaseTab
  }
})

function createCleanDirtyState(): Record<TabKey, boolean> {
  return {
    base: false,
    prefilter: false,
    style: false,
    geometry: false,
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
  if (allowRouteLeave.value || !hasDirtyTabs.value) return true

  pendingRoute.value = to
  showUnsavedChangesModal.value = true
  return false
})

onMounted(async () => {
  if (!portalUuid.value) {
    portalStore.resetToEmpty()
    portalStore.error = 'Invalid portalUuid'
    return
  }

  portalStore.loading = true

  try {
    const apiResponse = await apiFetch<PortalDTO>(`/api/admin/portal/${portalUuid.value}`)
    if (apiResponse.data) {
      portalStore.loadFromApi(apiResponse.data)
      tabDirtyState.value = createCleanDirtyState()
    } else {
      portalStore.error = 'No data returned from API'
    }
  } catch (err) {
    portalStore.error = t('failed_to_load_portal')
    console.error(err)
  } finally {
    portalStore.loading = false
  }
})

onUnmounted(() => {
  portalStore.clear()
})
</script>

<style scoped>
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
