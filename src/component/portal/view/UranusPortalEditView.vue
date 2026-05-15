<template>
  <div v-if="portalStore.loading">Loading...</div>
  <div v-else-if="portalStore.error">{{ portalStore.error }}</div>

  <template v-else-if="portalStore.isLoaded">
    <h1 class="uranus-admin-page-title">{{ t('edit_portal') }}</h1>
    <p>{{ portalStore.draft?.name }}</p>

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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusAdminPortalBaseTab from '@/component/portal/editor/UranusAdminPortalBaseTab.vue'
import UranusAdminPortalPrefilterTab from '@/component/portal/editor/UranusAdminPortalPrefilterTab.vue'
import UranusAdminPortalStyleTab from '@/component/portal/editor/UranusAdminPortalStyleTab.vue'
import UranusAdminPortalCssTab from '@/component/portal/editor/UranusAdminPortalCssTab.vue'
import UranusAdminPortalGeometryTab from '@/component/portal/editor/UranusAdminPortalGeometryTab.vue'
import UranusAdminPortalImagesTab from '@/component/portal/editor/UranusAdminPortalImagesTab.vue'
import { useUranusPortalStore } from '@/store/portalStore.ts'
import type { PortalDTO } from '@/domain/portal/portal.model.ts'
import UranusUnsavedChangesModal from '@/component/ui/modal/UranusUnsavedChangesModal.vue'
import { useSaveShortcut } from '@/composable/useSaveShortcut.ts'

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const portalStore = useUranusPortalStore()
const portalUuid = computed(() => route.params.portalUuid as string)

type TabKey = 'base' | 'prefilter' | 'style' | 'css' | 'geometry' | 'images'
type PortalEditorTabExpose = {
  commitTab?: () => Promise<void> | void
}

const activeTab = ref<TabKey>('base')
const tabs = [
  { key: 'base', labelKey: 'portal_tab_base' },
  { key: 'prefilter', labelKey: 'portal_tab_filter' },
  { key: 'style', labelKey: 'portal_tab_style' },
  { key: 'css', labelKey: 'portal_tab_css' },
  { key: 'geometry', labelKey: 'portal_tab_geometry' },
  { key: 'images', labelKey: 'portal_tab_images' },
] as const
const tabDirtyState = ref<Record<TabKey, boolean>>(createCleanDirtyState())
const activeTabComponentRef = ref<PortalEditorTabExpose | null>(null)
const showUnsavedChangesModal = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)
const allowRouteLeave = ref(false)

const hasDirtyTabs = computed(() => Object.values(tabDirtyState.value).some(Boolean))
const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'base': return UranusAdminPortalBaseTab
    case 'prefilter': return UranusAdminPortalPrefilterTab
    case 'style': return UranusAdminPortalStyleTab
    case 'css': return UranusAdminPortalCssTab
    case 'geometry': return UranusAdminPortalGeometryTab
    case 'images': return UranusAdminPortalImagesTab
    default: return UranusAdminPortalBaseTab
  }
})

function createCleanDirtyState(): Record<TabKey, boolean> {
  return {
    base: false,
    prefilter: false,
    style: false,
    css: false,
    geometry: false,
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
  if (portalStore.saving || !isTabDirty(activeTab.value)) return
  await activeTabComponentRef.value?.commitTab?.()
}

useSaveShortcut(saveActiveTab, {
  enabled: () => portalStore.isLoaded,
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
