<!--
  src/view/admin/venue/UranusVenueEditView.vue

  Uranus Venue Editor

  2026-02-10, Roald

  TODO:
  - Loading Indicator
  - Error Message
-->

<template>
  <div v-if="venueStore.loading">Loading…</div>
  <div v-else-if="venueStore.error">{{ venueStore.error }}</div>

  <template v-else-if="venueStore.isLoaded">
    <h1 class="uranus-admin-page-title">Venue Editor</h1>
    <p>{{ venueStore.draft?.name }}</p>

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
import VenueBaseTab from '@/component/venue/editor/UranusVenueBaseTab.vue'
import VenueMapTab from '@/component/venue/editor/UranusVenueMapTab.vue'
import UranusVenueLogoTab from '@/component/venue/editor/UranusVenueLogoTab.vue'
import UranusVenueImageTab from '@/component/venue/editor/UranusVenueImageTab.vue'
import { useUranusVenueStore } from '@/store/UranusVenueStore.ts'

const route = useRoute()
const venueStore = useUranusVenueStore()
const venueUuid = computed(() => { return route.params.venueUuid as string })

type TabKey = 'base' | 'map' | 'logos' | 'images'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'map', label: 'Map' },
  { key: 'logos', label: 'Logo' },
  { key: 'images', label: 'Image' },
] as const

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'base': return VenueBaseTab
    case 'map': return VenueMapTab
    case 'logos': return UranusVenueLogoTab
    case 'images': return UranusVenueImageTab
    default: return VenueBaseTab
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
    const response = await apiFetch<any>(apiPath)
    const venueData = response.response?.data
    console.log(JSON.stringify(venueData, null, 2))
    if (venueData) {
      venueStore.loadFromApi?.(venueData)
    } else {
      venueStore.error = 'No data returned from API'
    }
  } catch (e) {
    console.error(e)
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


<style scoped>

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