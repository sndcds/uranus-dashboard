<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent
        :title="t('user_messages_send')"
        :subtitle="t('dummy')"
    />
    <div class="dashboard-inbox">
      <OrganizationSearchPanel
        ref="searchPanelRef"
        :selected-organization-id="selectedOrganizationId"
        @select="selectOrganization"
        @state-change="handleSearchStateChange"
      />

      <section class="uranus-card">
        <OrganizationMessageComposer
          ref="composerRef"
          :selected-organization="selectedOrganization"
          :selected-organization-location="selectedOrganizationLocation"
          @sent="handleMessageSent"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import OrganizationMessageComposer from '@/components/dashboard/OrganizationMessageComposer.vue'
import OrganizationSearchPanel from '@/components/dashboard/OrganizationSearchPanel.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue";

interface Organization {
  id: string | number;
  name: string;
  email?: string;
  city?: string | null;
  countryCode?: string | null;
}

const { t } = useI18n()

const storedSearchTerm = ref('')
const storedOrganizations = ref<Organization[]>([])
const storedHasSearched = ref(false)

const formatLocation = (organization: Organization | null | undefined): string | null => {
  if (!organization) {
    return null
  }

  const parts: string[] = []

  if (organization.city) {
    parts.push(organization.city)
  }

  if (organization.countryCode) {
    parts.push(organization.countryCode)
  }

  if (parts.length === 0) {
    return null
  }

  return parts.join(', ')
}

const selectedOrganization = ref<Organization | null>(null)
const selectedOrganizationLocation = computed(() => formatLocation(selectedOrganization.value))
const composerRef = ref<InstanceType<typeof OrganizationMessageComposer> | null>(null)
const searchPanelRef = ref<InstanceType<typeof OrganizationSearchPanel> | null>(null)

const clearComposer = () => {
  selectedOrganization.value = null
  composerRef.value?.reset()
}

interface InboxPersistedState {
  searchTerm: string;
  organizations: Organization[];
  selectedOrganizationId: Organization['id'] | null;
  hasSearched: boolean;
}

const STORAGE_KEY = 'uranus-dashboard-inbox'

const selectedOrganizationId = computed(() => (selectedOrganization.value ? selectedOrganization.value.id : null))

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

    const organizations = Array.isArray(parsed.organizations) ? parsed.organizations.filter(Boolean) as Organization[] : []

    return {
      searchTerm: typeof parsed.searchTerm === 'string' ? parsed.searchTerm : '',
      organizations,
      selectedOrganizationId: parsed.selectedOrganizationId ?? null,
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
    organizations: storedOrganizations.value.map((organization) => ({ ...organization })),
    selectedOrganizationId: selectedOrganization.value ? selectedOrganization.value.id : null,
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
  storedOrganizations.value = (saved.organizations ?? []).map((organization) => ({ ...organization }))
  storedHasSearched.value = Boolean(saved.hasSearched) || storedOrganizations.value.length > 0 || storedSearchTerm.value.trim().length > 0

  nextTick(() => {
    if (searchPanelRef.value) {
      searchPanelRef.value.setSearchTerm(storedSearchTerm.value)
      searchPanelRef.value.restoreOrganizations(storedOrganizations.value)
      searchPanelRef.value.setHasSearched(storedHasSearched.value)
    }

    if (saved.selectedOrganizationId != null) {
      const match = storedOrganizations.value.find((item) => item.id === saved.selectedOrganizationId)
      if (match) {
        selectedOrganization.value = { ...match }
      }
    }

    persistState()
  })
}

onMounted(() => {
  restoreState()
})

const selectOrganization = (organization: Organization) => {
  clearComposer()
  selectedOrganization.value = { ...organization }
}

const handleMessageSent = () => {
  persistState()
}

const handleSearchStateChange = (payload: { searchTerm: string; organizations: Organization[]; hasSearched: boolean }) => {
  storedSearchTerm.value = payload.searchTerm
  storedOrganizations.value = payload.organizations.map((organization) => ({ ...organization }))
  storedHasSearched.value =
    payload.hasSearched || storedOrganizations.value.length > 0 || storedSearchTerm.value.trim().length > 0

  if (
    selectedOrganization.value &&
    !storedOrganizations.value.some((item) => item.id === selectedOrganization.value?.id)
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

</style>
