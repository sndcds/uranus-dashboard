<!--
  src/view/admin/space/UranusSpaceEditView.vue

  Uranus Space Editor

  2026-02-13, Roald

  TODO:
  - Loading Indicator
  - Error Message
-->

<template>
  <div v-if="spaceStore.loading">Loading…</div>
  <div v-else-if="spaceStore.error">{{ spaceStore.error }}</div>

  <template v-else-if="spaceStore.isLoaded">
    <h1 class="uranus-admin-page-title">Space Editor</h1>
    <p>{{ spaceStore.draft?.name }}</p>

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
import { apiFetch } from '@/api.ts'
import SpaceBaseTab from '@/component/space/editor/UranusSpaceBaseTab.vue'
import SpaceAccessibilityTab from '@/component/space/editor/UranusSpaceAccessibilityTab.vue'
import { useUranusSpaceStore } from '@/store/uranusSpaceStore.ts'
import type { SpaceDto } from '@/api/dto/space.dto.ts'

const route = useRoute()
const spaceStore = useUranusSpaceStore()
const spaceUuid = computed(() => { return route.params.spaceUuid as string })
const venueUuid = computed(() => route.params.venueUuid as string)

type TabKey = 'base' | 'accessibility'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'accessibility', label: 'Accessibility' },
] as const

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
    return
  }

  // Edit Mode
  spaceStore.loading = true
  try {
    const apiPath = `/api/admin/space/${spaceUuid.value}`
    const response = await apiFetch<{ data: SpaceDto }>(apiPath)
    spaceStore.loadFromApi(response.response.data)
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