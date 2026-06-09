<!--
  src/component/org/UranusOrgRequiredNotification.vue
-->

<template>
  <UranusNotification
      :show="!orgUuid"
      type="info"
      :action-label="t('org_notify_cant_see_content_action')"
      action-to="/admin/orgs"
  >
    <div v-html="t('org_notify_cant_see_content')" />
  </UranusNotification>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import UranusNotification from '@/component/ui/UranusNotification.vue'

defineProps<{
  orgUuid?: string | null
}>()

const { t } = useI18n()
</script>