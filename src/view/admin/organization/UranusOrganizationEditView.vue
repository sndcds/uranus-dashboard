<!--
  src/view/admin/organization/UranusOrganizationEditView.vue

  Uranus Organization Editor

  2026-02-08, Roald

  TODO:
  - Loading Indicator
  - Error Message
-->

<template>
    <div v-if="orgStore.loading">Loading…</div>
    <div v-else-if="orgStore.error">{{ orgStore.error }}</div>

    <template v-else-if="orgStore.isLoaded">
      <header class="editor-header">
        <h1 class="uranus-admin-page-title">Organization Editor</h1>
        <p>Organization: {{ orgStore.draft?.name }} / #{{ orgId }}</p>
      </header>

      <!-- tabs -->
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
import { useRoute } from 'vue-router'
// import { useI18n } from "vue-i18n";
import { apiFetch } from "@/api.ts";

import OrganizationBaseTab from '@/component/organization/editor/UranusOrganizationBaseTab.vue'
import OrganizationMapTab from '@/component/organization/editor/UranusOrganizationMapTab.vue'
import OrganizationImagesTab from '@/component/organization/editor/UranusOrganizationImagesTab.vue'
import { useUranusOrganizationStore } from '@/store/uranusOrganizationStore.ts'
import type { UranusOrganizationDTO } from '@/api/dto/UranusOrganizationDTO.ts'

// const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const orgStore = useUranusOrganizationStore()

const orgId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
})

type TabKey = 'base' | 'map' | 'images'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'map', label: 'Map' },
  { key: 'images', label: 'Images' },
] as const

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'base': return OrganizationBaseTab
    case 'map': return OrganizationMapTab
    case 'images': return OrganizationImagesTab
    default: return OrganizationBaseTab
  }
})

onMounted(async () => {
  if (!orgId.value) {
    orgStore.resetToEmpty()
    // orgStore.error = 'Invalid organizationId'
    return
  }

  orgStore.loading = true
  try {
    const apiPath = `/api/admin/organization/${orgId.value}`
    const response = await apiFetch<{ data: UranusOrganizationDTO }>(apiPath)
    orgStore.loadFromApi(response.data.data)
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