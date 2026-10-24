<!--
  src/component/event/view/UranusAdminEventCardsView.vue
-->

<template>
  <div class="uranus-max-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('events')"
        :subtitle="t('events_hero_subtitle')" />

    <UranusFeedback v-if="error" type="error">{{ error }}</UranusFeedback>
    <p v-if="isLoading" role="status">{{ t('event_table_loading') }}</p>

    <!-- Errors -->
    <UranusFeedback v-if="deleteError" type="error" :delaySeconds="1">
      {{ deleteError }}
    </UranusFeedback>
    <UranusFeedback v-if="socialPermissionError" type="error">{{ t(socialPermissionError) }}</UranusFeedback>

    <UranusOrgRequiredNotification v-if="!appStore.orgUuid" :org-uuid="appStore.orgUuid" />

    <template v-else>
      <UranusAdminEventTable
          v-if="orgUuid"
          :key="orgUuid"
          :events="adminListEvents"
          :loading="isLoading"
          :grouped="displayMode === 'grouped'"
          :can-post-social-orgs="socialEditableOrgs"
          @deleted="onEventDeleted"
      >
        <template #actions>
          <UranusButton v-if="canAddEvent" :to="`/admin/org/${orgUuid}/event/create`">
          {{ t('add_new_event') }}
          </UranusButton>

          <UranusSegmentedSelect
            v-model="displayMode"
            :options="displayModeOptions"
            size="small"
        />
        </template>
      </UranusAdminEventTable>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { listSocialEditableOrgUuids, socialErrorKey } from '@/api/social'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/appStore.ts'
import UranusAdminEventTable from '@/component/event/table/UranusAdminEventTable.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import { useUranusAdminListEvents } from '@/composable/useUranusAdminListEvents.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusOrgTitle from "@/component/layout/UranusOrgTitle.vue";
import UranusSegmentedSelect from '@/component/ui/UranusSegmentedSelect.vue'
import UranusOrgRequiredNotification from '@/component/org/UranusOrgRequiredNotification.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()

const { adminListEvents, metadata, error, loading: isLoading, fetchAdminListEvents } = useUranusAdminListEvents();

const deleteError = ref('')
const socialEditableOrgs = ref<string[]>([])
const socialPermissionError = ref('')
const orgUuid = computed(() => appStore.orgUuid)

const canAddEvent = computed(() => !!metadata.value.can_add_event);
type EventListDisplayMode = 'all' | 'grouped'
const displayMode = ref<EventListDisplayMode>('grouped')
const displayModeOptions = computed(() => [
  { label: t('show_grouped'), value: 'grouped' },
  { label: t('show_single'), value: 'all' },
])
const onEventDeleted = async (_event: {
  eventUuid: string
  dateUuid: string | null
  deleteSeries: boolean
}) => {
  try {
    await fetchAdminListEvents(orgUuid.value, { includePast: true })
  } catch (err) {
    console.error("Failed to refetch events after delete:", err)
    deleteError.value = t('failed_to_refresh_events')
  } finally {
    // Optionally, reset loading state
    // isLoading.value = false
  }
}

watch(orgUuid, async value => {
  await fetchAdminListEvents(value, { includePast: true })
}, { immediate: true })

onMounted(async () => {
  try { socialEditableOrgs.value = await listSocialEditableOrgUuids() }
  catch (error) { socialPermissionError.value = socialErrorKey(error) }
})
</script>
