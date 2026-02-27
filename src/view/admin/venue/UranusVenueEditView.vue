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
    <header class="editor-header">
      <h1 class="uranus-admin-page-title">Venue Editor</h1>
      <p>Venue: {{ venueStore.draft?.name }} / #{{ venueId }}</p>
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

import VenueBaseTab from '@/component/venue/editor/UranusVenueBaseTab.vue'
import VenueMapTab from '@/component/venue/editor/UranusVenueMapTab.vue'
import UranusVenueLogoTab from '@/component/venue/editor/UranusVenueLogoTab.vue'
import UranusVenueImageTab from '@/component/venue/editor/UranusVenueImageTab.vue'
import { useUranusVenueStore } from '@/store/UranusVenueStore.ts'
import type { UranusVenueDTO } from '@/api/dto/UranusVenueDTO.ts'

// const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const venueStore = useUranusVenueStore()

const venueId = computed(() => {
  const id = Number(route.params.venueId)
  return Number.isFinite(id) ? id : null
})

type TabKey = 'base' | 'map' | 'logos' | 'images'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'map', label: 'Map' },
  { key: 'logos', label: 'Logos' },
  { key: 'images', label: 'Images' },
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
  if (!venueId.value) {
    venueStore.resetToEmpty?.() // optional chaining in case method doesn't exist
    venueStore.error = 'Invalid venueId'
    return
  }

  venueStore.loading = true
  try {
    const apiPath = `/api/admin/venue/${venueId.value}`
    const response = await apiFetch<{ data: UranusVenueDTO }>(apiPath)
    const venueData = response.data?.data ?? response.data
    if (venueData) {
      venueStore.loadFromApi?.(venueData) // optional chaining
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