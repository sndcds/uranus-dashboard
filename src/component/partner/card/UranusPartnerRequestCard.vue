<!--
  src/component/partner/card/UranusPartnerRequestCard.vue
-->

<template>
  <UranusCard v-if="filteredItems.length > 0">
    <h3>
      {{ direction === 'incoming'
        ? t('partner_incoming_requests_title')
        : t('partner_outgoing_requests_title') }}
    </h3>

    <div v-for="item in filteredItems" :key="item.orgUuid">
      <div class="partner-grid partner-card">
        <div class="partner-name">
          {{ item.orgName }}
        </div>

        <div class="partner-meta">
          <div class="status status--pending">
            {{ t(item.status) }}
          </div>

          <div class="date">
            {{ formatDate(item.createdAt) }}
          </div>
        </div>

        <div v-if="item.message" class="partner-message">
          {{ item.message }}
        </div>

        <div v-if="direction === 'incoming'" class="partner-actions">
          <UranusButton size="medium" @click="onReject(item)">{{ t('reject') }}</UranusButton>
          <UranusButton size="medium" @click="onAccept(item)">{{ t('accept') }}</UranusButton>
        </div>

      </div>
    </div>
  </UranusCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import type { PartnerRequestItem } from '@/domain/partner/partner.model.ts'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusButton from '@/component/ui/UranusButton.vue'

const { t } = useI18n()
const appStore = useAppStore()

const props = defineProps<{
  items: PartnerRequestItem[]
  direction: 'incoming' | 'outgoing'
}>()

const filteredItems = computed(() => {
  return props.items.filter(
      item =>
          item.direction === props.direction &&
          item.status === 'pending'
  )
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString()
}

async function onAccept(item: PartnerRequestItem) {
  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/request/${item.orgUuid}/accept`
    await apiFetch(apiPath, {
      method: 'POST',
    })

    item.status = 'accepted'
  } catch (e) {
    console.error('Failed to accept request', e)
  }
}

async function onReject(item: PartnerRequestItem) {
  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/request/${item.orgUuid}/reject`
    await apiFetch(apiPath, {
      method: 'POST',
    })

    item.status = 'rejected'
  } catch (e) {
    console.error('Failed to reject request', e)
  }
}
</script>

<style scoped lang="scss">
.partner-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.partner-card {
  border-top: 1px solid var(--uranus-dashboard-border-color);
  border-left: 4px solid var(--uranus-pending-color);
  padding-top: 1.4rem;
  padding-left: 1rem;
}

.partner-name {
  font-size: 1.4rem;
  font-weight: 500;
}

.partner-meta {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  font-size: 0.9rem;
}

.status--pending {
  color: var(--uranus-pending-color);
  font-weight: 700;
}

.partner-message {
  grid-column: 1 / -1;
  margin-top: 0.5rem;
  font-style: italic;
  color: var(--uranus-color-4);
}

.partner-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
