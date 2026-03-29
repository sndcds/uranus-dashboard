<!--
  src/view/admin/organization/UranusOrganizationEditView.vue

  Uranus Organization Editor
  2026-02-08, Roald
-->

<template>
    <div v-if="orgStore.loading">Loading…</div>
    <div v-else-if="orgStore.error">{{ orgStore.error }}</div>

    <template v-else-if="orgStore.isLoaded">
        <h1>{{ t('organization_editor') }}</h1>
        <p>Organization: {{ orgStore.draft?.name }}</p>

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

import OrganizationBaseTab from '@/component/organization/editor/UranusOrganizationBaseTab.vue'
import OrganizationMapTab from '@/component/organization/editor/UranusOrganizationMapTab.vue'
import OrganizationLogoTab from '@/component/organization/editor/UranusOrganizationLogoTab.vue'
import { useUranusOrganizationStore } from '@/store/uranusOrganizationStore.ts'

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const orgStore = useUranusOrganizationStore()

const orgUuid = computed(() => { return route.params.orgUuid })

type TabKey = 'base' | 'map' | 'logo'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'map', label: 'Map' },
  { key: 'logo', label: 'Logo' },
] as const

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'base': return OrganizationBaseTab
    case 'map': return OrganizationMapTab
    case 'logo': return OrganizationLogoTab
    default: return OrganizationBaseTab
  }
})

onMounted(async () => {
  if (!orgUuid.value) {
    orgStore.resetToEmpty()
    // orgStore.error = 'Invalid organizationId'
    return
  }
  console.log(orgUuid.value)

  orgStore.loading = true
  try {
    const apiPath = `/api/admin/organization/${orgUuid.value}`
    const response = await apiFetch<any>(apiPath)
    orgStore.loadFromApi(response.response.data)
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
    console.error("Unmount error in UranusOrganizationEditView:", err)
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
  border-bottom: 1px solid #333;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;

}

.tabs button.active {
  border-bottom: 4px solid #000;
  font-weight: bold;
}

.tab-content {
  width: 100%;
  max-width: 1024px;
  padding: 1rem 0;
}
</style>