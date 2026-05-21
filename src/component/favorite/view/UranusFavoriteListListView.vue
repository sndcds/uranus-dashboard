<template>
  <div class="uranus-main-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('favorite_lists')"
        :subtitle="t('favorite_lists_description')"
    />

    <UranusNotification
        v-if="!appStore.orgUuid"
        type="info"
        :action-label="t('nav_orgs')"
        action-to="/admin/orgs"
    >
      <template #title>{{ t('notification') }}</template>
      {{ t('favorite_lists_no_active_org') }}
    </UranusNotification>

    <template v-else>
      <div>
        <UranusButton :to="`/admin/org/${appStore.orgUuid}/favorite-list/create`">
          {{ t('favorite_list_create') }}
        </UranusButton>
      </div>

      <UranusFeedback :show="isLoading" type="warning">
        {{ t('loading') }}
      </UranusFeedback>

      <UranusFeedback :show="!!error" type="error">
        {{ error }}
      </UranusFeedback>

      <UranusNotification
          v-if="!isLoading && favoriteLists.length === 0"
          type="info"
      >
        <template #title>{{ t('notification') }}</template>
        {{ t('favorite_lists_empty') }}
      </UranusNotification>

      <div class="favorite-list-grid">
        <UranusFavoriteListCard
            v-for="list in favoriteLists"
            :key="list.uuid"
            :list="list"
            @deleted="handleDeleted"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import {
  mapFavoriteList,
  type FavoriteList,
} from '@/domain/favorite/favoriteList.model.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusFavoriteListCard from '@/component/favorite/card/UranusFavoriteListCard.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusOrgTitle from '@/component/layout/UranusOrgTitle.vue'

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()
const favoriteLists = ref<FavoriteList[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

async function loadFavoriteLists(orgUuid: string | null) {
  favoriteLists.value = []
  if (!orgUuid) return

  isLoading.value = true
  error.value = null

  try {
    const apiPath = `/api/admin/org/${orgUuid}/favorite-lists`
    const apiResponse = await apiFetch<any>(apiPath)
    const rawLists = extractListPayload(apiResponse.data)
    favoriteLists.value = rawLists
        .map(mapFavoriteList)
        .filter((list: FavoriteList | null): list is FavoriteList => list !== null)
  } catch {
    error.value = t('favorite_lists_load_error')
  } finally {
    isLoading.value = false
  }
}

function extractListPayload(data: any): any[] {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.favorite_lists)) return data.favorite_lists
  if (Array.isArray(data?.favoriteLists)) return data.favoriteLists
  if (Array.isArray(data?.lists)) return data.lists
  return []
}

function handleDeleted(listUuid: string) {
  favoriteLists.value = favoriteLists.value.filter(list => list.uuid !== listUuid)
}

watch(
    () => appStore.orgUuid,
    (orgUuid) => void loadFavoriteLists(orgUuid)
)

onMounted(() => {
  void loadFavoriteLists(appStore.orgUuid)
})
</script>

<style scoped lang="scss">
.favorite-list-grid {
  display: flex;
  flex-direction: column;
  gap: var(--uranus-grid-gap);
  max-width: var(--uranus-dashboard-content-width);
}
</style>
