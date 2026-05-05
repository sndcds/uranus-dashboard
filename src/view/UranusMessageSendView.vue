<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('user_messages_send')"
        :subtitle="t('dummy')"
    />
    <div class="dashboard-inbox">
      <UranusOrgSearchPanel
        ref="searchPanelRef"
        :selected-org-id="selectedOrgId"
        @select="selectOrg"
        @state-change="handleSearchStateChange"
      />

      <section class="uranus-card">
        <UranusOrgMessageComposer
          ref="composerRef"
          :selected-org="selectedOrg"
          :selected-org-location="selectedOrgLocation"
          @sent="handleMessageSent"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import UranusOrgMessageComposer from '@/component/dashboard/UranusOrgMessageComposer.vue'
import UranusOrgSearchPanel from '@/component/dashboard/UranusOrgSearchPanel.vue'
import UranusDashboardHero from "@/component/dashboard/UranusDashboardHero.vue";

interface Org {
  id: string | number;
  name: string;
  email?: string;
  city?: string | null;
  countryCode?: string | null;
}

const { t } = useI18n()

const storedSearchTerm = ref('')
const storedOrgs = ref<Org[]>([])
const storedHasSearched = ref(false)

const formatLocation = (org: Org | null | undefined): string | null => {
  if (!org) {
    return null
  }

  const parts: string[] = []

  if (org.city) {
    parts.push(org.city)
  }

  if (org.countryCode) {
    parts.push(org.countryCode)
  }

  if (parts.length === 0) {
    return null
  }

  return parts.join(', ')
}

const selectedOrg = ref<Org | null>(null)
const selectedOrgLocation = computed(() => formatLocation(selectedOrg.value))
const composerRef = ref<InstanceType<typeof UranusOrgMessageComposer> | null>(null)
const searchPanelRef = ref<InstanceType<typeof UranusOrgSearchPanel> | null>(null)

const clearComposer = () => {
  selectedOrg.value = null
  composerRef.value?.reset()
}

interface InboxPersistedState {
  searchTerm: string;
  orgs: Org[];
  selectedOrgId: Org['id'] | null;
  hasSearched: boolean;
}

const STORAGE_KEY = 'uranus-dashboard-inbox'

const selectedOrgId = computed(() => (selectedOrg.value ? selectedOrg.value.id : null))

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

    const orgs = Array.isArray(parsed.orgs) ? parsed.orgs.filter(Boolean) as Org[] : []

    return {
      searchTerm: typeof parsed.searchTerm === 'string' ? parsed.searchTerm : '',
      orgs,
      selectedOrgId: parsed.selectedOrgId ?? null,
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
    orgs: storedOrgs.value.map((org) => ({ ...org })),
    selectedOrgId: selectedOrg.value ? selectedOrg.value.id : null,
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
  storedOrgs.value = (saved.orgs ?? []).map((org) => ({ ...org }))
  storedHasSearched.value = Boolean(saved.hasSearched) || storedOrgs.value.length > 0 || storedSearchTerm.value.trim().length > 0

  nextTick(() => {
    if (searchPanelRef.value) {
      searchPanelRef.value.setSearchTerm(storedSearchTerm.value)
      searchPanelRef.value.restoreOrgs(storedOrgs.value)
      searchPanelRef.value.setHasSearched(storedHasSearched.value)
    }

    if (saved.selectedOrgId != null) {
      const match = storedOrgs.value.find((item) => item.id === saved.selectedOrgId)
      if (match) {
        selectedOrg.value = { ...match }
      }
    }

    persistState()
  })
}

onMounted(() => {
  restoreState()
})

const selectOrg = (org: Org) => {
  clearComposer()
  selectedOrg.value = { ...org }
}

const handleMessageSent = () => {
  persistState()
}

const handleSearchStateChange = (payload: { searchTerm: string; orgs: Org[]; hasSearched: boolean }) => {
  storedSearchTerm.value = payload.searchTerm
  storedOrgs.value = payload.orgs.map((org) => ({ ...org }))
  storedHasSearched.value =
    payload.hasSearched || storedOrgs.value.length > 0 || storedSearchTerm.value.trim().length > 0

  if (
    selectedOrg.value &&
    !storedOrgs.value.some((item) => item.id === selectedOrg.value?.id)
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
