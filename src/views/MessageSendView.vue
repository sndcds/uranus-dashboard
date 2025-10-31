<template>
  <div class="message-page">
    <header>
      <h1>{{ t('user_messages_send') }}</h1>
    </header>

    <div class="dashboard-inbox">
      <OrganizerSearchPanel
        ref="searchPanelRef"
        :selected-organizer-id="selectedOrganizerId"
        @select="selectOrganizer"
        @state-change="handleSearchStateChange"
      />

      <section class="uranus-card">
        <OrganizerMessageComposer
          ref="composerRef"
          :selected-organizer="selectedOrganizer"
          :selected-organizer-location="selectedOrganizerLocation"
          @sent="handleMessageSent"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import OrganizerMessageComposer from '@/components/dashboard/OrganizerMessageComposer.vue'
import OrganizerSearchPanel from '@/components/dashboard/OrganizerSearchPanel.vue'

interface Organizer {
  id: string | number;
  name: string;
  email?: string;
  city?: string | null;
  countryCode?: string | null;
}

const { t } = useI18n()

const storedSearchTerm = ref('')
const storedOrganizers = ref<Organizer[]>([])
const storedHasSearched = ref(false)

const formatLocation = (organizer: Organizer | null | undefined): string | null => {
  if (!organizer) {
    return null
  }

  const parts: string[] = []

  if (organizer.city) {
    parts.push(organizer.city)
  }

  if (organizer.countryCode) {
    parts.push(organizer.countryCode)
  }

  if (parts.length === 0) {
    return null
  }

  return parts.join(', ')
}

const selectedOrganizer = ref<Organizer | null>(null)
const selectedOrganizerLocation = computed(() => formatLocation(selectedOrganizer.value))
const composerRef = ref<InstanceType<typeof OrganizerMessageComposer> | null>(null)
const searchPanelRef = ref<InstanceType<typeof OrganizerSearchPanel> | null>(null)

const clearComposer = () => {
  selectedOrganizer.value = null
  composerRef.value?.reset()
}

interface InboxPersistedState {
  searchTerm: string;
  organizers: Organizer[];
  selectedOrganizerId: Organizer['id'] | null;
  hasSearched: boolean;
}

const STORAGE_KEY = 'uranus-dashboard-inbox'

const selectedOrganizerId = computed(() => (selectedOrganizer.value ? selectedOrganizer.value.id : null))

const readPersistedState = (): InboxPersistedState | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<InboxPersistedState>
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    const organizers = Array.isArray(parsed.organizers) ? parsed.organizers.filter(Boolean) as Organizer[] : []

    return {
      searchTerm: typeof parsed.searchTerm === 'string' ? parsed.searchTerm : '',
      organizers,
      selectedOrganizerId: parsed.selectedOrganizerId ?? null,
      hasSearched: Boolean(parsed.hasSearched),
    }
  } catch {
    return null
  }
}

const persistState = () => {
  if (typeof window === 'undefined') {
    return
  }

  const state: InboxPersistedState = {
    searchTerm: storedSearchTerm.value,
    organizers: storedOrganizers.value.map((organizer) => ({ ...organizer })),
    selectedOrganizerId: selectedOrganizer.value ? selectedOrganizer.value.id : null,
    hasSearched: storedHasSearched.value,
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Swallow storage errors silently (e.g., quota exceeded, private mode)
  }
}

const restoreState = () => {
  const saved = readPersistedState()
  if (!saved) {
    return
  }

  storedSearchTerm.value = saved.searchTerm ?? ''
  storedOrganizers.value = (saved.organizers ?? []).map((organizer) => ({ ...organizer }))
  storedHasSearched.value = Boolean(saved.hasSearched) || storedOrganizers.value.length > 0 || storedSearchTerm.value.trim().length > 0

  nextTick(() => {
    if (searchPanelRef.value) {
      searchPanelRef.value.setSearchTerm(storedSearchTerm.value)
      searchPanelRef.value.restoreOrganizers(storedOrganizers.value)
      searchPanelRef.value.setHasSearched(storedHasSearched.value)
    }

    if (saved.selectedOrganizerId != null) {
      const match = storedOrganizers.value.find((item) => item.id === saved.selectedOrganizerId)
      if (match) {
        selectedOrganizer.value = { ...match }
      }
    }

    persistState()
  })
}

onMounted(() => {
  restoreState()
})

const selectOrganizer = (organizer: Organizer) => {
  clearComposer()
  selectedOrganizer.value = { ...organizer }
}

const handleMessageSent = () => {
  persistState()
}

const handleSearchStateChange = (payload: { searchTerm: string; organizers: Organizer[]; hasSearched: boolean }) => {
  storedSearchTerm.value = payload.searchTerm
  storedOrganizers.value = payload.organizers.map((organizer) => ({ ...organizer }))
  storedHasSearched.value =
    payload.hasSearched || storedOrganizers.value.length > 0 || storedSearchTerm.value.trim().length > 0

  if (
    selectedOrganizer.value &&
    !storedOrganizers.value.some((item) => item.id === selectedOrganizer.value?.id)
  ) {
    clearComposer()
  }

  persistState()
}
</script>

<style scoped lang="scss">
.dashboard-inbox {
  display: grid;
  width: 100%;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  grid-template-columns: minmax(420px, 460px) minmax(0, 1fr);
  margin-top: clamp(2rem, 4vw, 3rem);
}

@media (max-width: 960px) {
  .dashboard-inbox {
    grid-template-columns: 1fr;
  }
}

.inbox-content {
  background: var(--card-bg);
  border-radius: clamp(1rem, 2vw, 1.5rem);
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.inbox-content {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

</style>
