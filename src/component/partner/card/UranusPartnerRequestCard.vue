<!--
  src/component/partner/card/UranusPartnerRequestCard.vue
-->

<template>
  <UranusCard v-if="filteredItems.length > 0">
    <h3>
      {{ title ?? (direction === 'incoming'
        ? t('partner_incoming_requests_title')
        : t('partner_outgoing_requests_title')) }}
    </h3>

    <UranusFeedback v-if="errorKey" type="error">{{ t(errorKey) }}</UranusFeedback>

    <ul v-if="compact" class="partner-request-list">
      <li v-for="item in filteredItems" :key="item.orgUuid" class="partner-request-list__item">
        <div class="partner-request-list__details">
          <span>
            {{ t(direction === 'incoming' ? 'partner_request_received_on' : 'partner_request_sent_on') }}
            <time :datetime="item.createdAt">{{ formatDate(item.createdAt, true) }}</time>
          </span>
          <span>
            {{ t(direction === 'incoming' ? 'partner_request_from' : 'partner_request_to') }}
            <strong>{{ item.orgName }}</strong>
          </span>
          <span>{{ formatPendingDays(item.createdAt) }}</span>
        </div>
        <div v-if="canAnswerPartnerRequests && direction === 'incoming'" class="partner-actions">
          <UranusButton variant="secondary" :disabled="isBusy" @click="onReject(item)">
            {{ t('partner_reject_request') }}
          </UranusButton>
          <UranusButton :disabled="isBusy" @click="onAccept(item)">
            {{ t(canEditPartnerRights ? 'partner_accept_and_grant' : 'accept') }}
          </UranusButton>
        </div>
      </li>
    </ul>

    <div v-for="item in compact ? [] : filteredItems" :key="item.orgUuid">
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

        <div v-if="canAnswerPartnerRequests && direction === 'incoming'" class="partner-actions">
          <UranusButton size="medium" :disabled="isBusy" @click="onReject(item)">{{ t('reject') }}</UranusButton>
          <UranusButton size="medium" :disabled="isBusy" @click="onAccept(item)">
            {{ t(canEditPartnerRights ? 'partner_accept_and_grant' : 'accept') }}
          </UranusButton>
        </div>

      </div>
    </div>
  </UranusCard>

  <UranusPartnerGrantsModal
      v-if="selectedItem && appStore.orgUuid"
      :org-uuid="appStore.orgUuid"
      :partner="selectedItem"
      :accept-request="true"
      :can-edit-grants="canEditPartnerRights"
      @close="onModalClose"
      @saved="onAccepted"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import type { PartnerRequestItem } from '@/domain/partner/partner.model.ts'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusPartnerGrantsModal from '@/component/partner/UranusPartnerGrantsModal.vue'

const { t, locale } = useI18n()
const appStore = useAppStore()

const props = withDefaults(defineProps<{
  items: PartnerRequestItem[]
  direction: 'incoming' | 'outgoing'
  canAnswerPartnerRequests?: boolean
  canEditPartnerRights?: boolean
  compact?: boolean
  title?: string
}>(), {
  canAnswerPartnerRequests: false,
  canEditPartnerRights: false,
  compact: false,
})

const emit = defineEmits<{
  'request-updated': []
}>()

const selectedItem = ref<PartnerRequestItem | null>(null)
const isRejecting = ref(false)
const errorKey = ref<string | null>(null)
const isBusy = computed(() => isRejecting.value || selectedItem.value !== null)

const filteredItems = computed(() => {
  return props.items.filter(
      item =>
          item.direction === props.direction &&
          item.status === 'pending'
  )
})

function formatDate(dateStr: string, dateOnly = false): string {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return dateOnly
      ? date.toLocaleDateString(locale.value)
      : date.toLocaleString(locale.value)
}

function formatPendingDays(dateStr: string): string {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  const days = Math.max(0, Math.round((
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ) / 86_400_000))
  return t('partner_request_days_pending', days)
}

function onAccept(item: PartnerRequestItem) {
  if (!props.canAnswerPartnerRequests || item.direction !== 'incoming' || isBusy.value) return
  errorKey.value = null
  selectedItem.value = item
}

function onAccepted() {
  if (selectedItem.value) {
    selectedItem.value.status = 'accepted'
    selectedItem.value = null
    emit('request-updated')
  }
}

function onModalClose(requestAccepted: boolean) {
  if (requestAccepted) onAccepted()
  else selectedItem.value = null
}

async function onReject(item: PartnerRequestItem) {
  if (!appStore.orgUuid || !props.canAnswerPartnerRequests || item.direction !== 'incoming' || isBusy.value) return
  isRejecting.value = true
  errorKey.value = null
  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/request/${item.orgUuid}/reject`
    await apiFetch(apiPath, {
      method: 'POST',
    })

    item.status = 'rejected'
    emit('request-updated')
  } catch {
    errorKey.value = 'partner_request_reject_error'
  } finally {
    isRejecting.value = false
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
  flex-wrap: wrap;
}

.partner-request-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.partner-request-list__item {
  border-top: 1px solid var(--uranus-dashboard-border-color);
  padding: 1rem 0;
}

.partner-request-list__details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin-bottom: 0.75rem;
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .partner-request-list__details {
    flex-direction: column;
  }
}
</style>
