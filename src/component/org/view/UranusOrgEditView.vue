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
            :class="{ active: tab.key === activeTab }"
            @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <section class="tab-content">
        <component :is="currentTabComponent" />
      </section>
    </template>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusAdminOrgBaseTab from '@/component/org/editor/UranusAdminOrgBaseTab.vue'
import UranusAdminOrgMapTab from '@/component/org/editor/UranusAdminOrgMapTab.vue'
import UranusAdminOrgLogoTab from '@/component/org/editor/UranusAdminOrgLogoTab.vue'
import { useOrgStore } from '@/store/orgStore.ts'

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const orgStore = useOrgStore()
const orgUuid = computed(() => { return route.params.orgUuid as string})

type TabKey = 'base' | 'map' | 'logo'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'map', label: 'Map' },
  { key: 'logo', label: 'Logo' },
] as const

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

.tab-content {
  width: 100%;
  max-width: 1024px;
  padding: 1rem 0;
}
</style>