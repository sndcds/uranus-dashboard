<template>
  <div class="event-editor">
    <div v-if="store.loading">Loading…</div>
    <div v-else-if="store.error">{{ store.error }}</div>

    <template v-else-if="store.isLoaded">
      <!-- header -->
      <header class="editor-header">
        <h1>{{ store.draft?.title }}</h1>
        {{ eventId }}
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

      <!-- tab content -->
      <section class="tab-content">
        <component :is="currentTabComponent" />
      </section>
    </template>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'

import { type UranusAdminEventJSON } from '@/composable/useAdminEvent.ts'

// tab components
import { useI18n } from "vue-i18n";
import { apiFetch } from "@/api.ts";
import AdminEventSettingsTab from '@/component/event/event-editor/AdminEventSettingsTab.vue'
import AdminEventBaseTab from '@/component/event/event-editor/AdminEventBaseTab.vue'
import AdminEventDatesTab from '@/component/event/event-editor/AdminEventDatesTab.vue'
import UranusMeta1Tab from "@/component/event/event-editor/UranusMeta1Tab.vue";
import AdminEventParticipationTab from "@/component/event/event-editor/AdminEventParticipationTab.vue";
import UranusEventVenueTab from "@/component/event/event-editor/UranusEventVenueTab.vue";
import AdminEventPriceTab from "@/component/event/event-editor/AdminEventPriceTab.vue";

// api
// import { fetchAdminEvent, updateAdminEvent } from '@/api/adminEvents' TODO: !!!

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const store = useUranusAdminEventStore()

const eventId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
})

type TabKey = 'settings' | 'base' | 'dates' | 'venue' |'meta1' | 'participation' | 'price'
const activeTab = ref<TabKey>('base')

const tabs = [
  { key: 'base', label: 'Base' },
  { key: 'venue', label: 'Venue' },
  { key: 'dates', label: 'Dates' },
  { key: 'meta1', label: 'Meta1' },
  { key: 'participation', label: 'Participation' },
  { key: 'price', label: 'Price' },
  { key: 'settings', label: 'Settings' }
] as const

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'settings':
      return AdminEventSettingsTab
    case 'dates':
      return AdminEventDatesTab
    case 'venue':
      return UranusEventVenueTab
    case 'meta1':
      return UranusMeta1Tab
    case 'participation':
      return AdminEventParticipationTab
    case 'price':
      return AdminEventPriceTab
    case 'base':
    default:
      return AdminEventBaseTab
  }
})

onMounted(async () => {
  if (!eventId.value) {
    store.error = 'Invalid eventId'
    return
  }

  store.loading = true
  try {
    const apiPath = `/api/admin/event/${eventId.value}?lang=${locale.value}`
    const response = await apiFetch<{ data: UranusAdminEventJSON }>(apiPath)
    store.loadFromApi(response.data.data)
  } catch (e) {
    store.error = 'Failed to load event'
  } finally {
    store.loading = false
  }
})

onUnmounted(() => {
  // Important when switching between events
  store.clear()
})

async function save() {
  if (!store.draft || !store.isDirty) return

  store.saving = true
  try {
    // await updateAdminEvent(store.draft) TODO: !!!!
    store.commitDraft()
  } finally {
    store.saving = false
  }
}
</script>


<style scoped>
.event-editor {
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
  padding: 1rem 0;
}
</style>