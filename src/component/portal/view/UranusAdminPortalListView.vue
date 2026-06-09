<template>
  <div class="uranus-main-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('portals')"
        :subtitle="t('portals_list_hero_description')"
    />

    <UranusOrgRequiredNotification v-if="!appStore.orgUuid" :org-uuid="appStore.orgUuid" />

    <template v-else>
      <div v-if="!isLoading" class="uranus-main-layout">
        <div v-if="portalList?.canAddPortal">
          <UranusButton :to="`/admin/org/${appStore.orgUuid}/portal/create`">
            {{ t('portal_add') }}
          </UranusButton>
        </div>

        <UranusFeedback v-if="!!error" type="error">
          <h3>{{ t('error_notification') }}</h3>
          <p>{{ error }}</p>
        </UranusFeedback>

        <div v-if="portalList" class="uranus-vertical-flex">
          <UranusAdminPortalCard
              v-for="item in portalList.portals"
              :key="item.portalUuid"
              :portal-list-item="item"
              :org-uuid="appStore.orgUuid"
              @deleted="handlePortalDeleted"
          />

          <UranusFeedback v-if="portalList.portals.length === 0" type="notice">
            {{ t('portals_empty') }}
          </UranusFeedback>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import { mapPortalList, type PortalListModel } from '@/domain/portal/portalList.model.ts'
import UranusAdminPortalCard from '@/component/portal/card/UranusAdminPortalCard.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusOrgTitle from '@/component/layout/UranusOrgTitle.vue'
import UranusOrgRequiredNotification from '@/component/org/UranusOrgRequiredNotification.vue'

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()

const isLoading = ref(true)
const portalList = ref<PortalListModel | null>(null)
const error = ref<string | null>(null)

async function loadPortals(orgUuid: string | null) {
  isLoading.value = true

  if (!orgUuid) {
    portalList.value = null
    isLoading.value = false
    return
  }

  try {
    const apiResponse = await apiFetch(`/api/admin/org/${orgUuid}/portals`)
    const mappedPortalList = mapPortalList(apiResponse.data as any)
    mappedPortalList.canAddPortal = apiResponse.metadata?.can_add_portal ?? mappedPortalList.canAddPortal
    portalList.value = mappedPortalList
    error.value = null
  } catch (err) {
    console.error('Failed to load organization portals:', err)
    error.value = t('failed_to_load_portals')
  } finally {
    isLoading.value = false
  }
}

async function handlePortalDeleted() {
  await loadPortals(appStore.orgUuid)
}

onMounted(() => {
  void loadPortals(appStore.orgUuid)
})
</script>
