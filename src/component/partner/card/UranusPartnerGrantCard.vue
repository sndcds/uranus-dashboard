<!--
  src/component/partner/card/UranusPartnerGrantCard.vue
-->

<template>
  <UranusCard v-if="filteredItems.length > 0">
    <h3>
      {{ direction === 'incoming'
        ? t('partner_incoming_grants_title')
        : t('partner_outgoing_grants_title') }}
    </h3>

    <div v-for="item in filteredItems" :key="item.orgUuid">
      <div class="partner-grid partner-card">
        <div class="partner-name">
          {{ item.orgName }}
        </div>

        <div class="partner-grants">
          <div class="perm">
            <Check v-if="item.canChooseVenue" :size="32" />
            <span>{{ t('partner_grant_venue_label') }}</span>
          </div>

          <div class="perm">
            <Check v-if="item.canChoosePartner" :size="32" />
            <span>{{ t('partner_grant_partner_label') }}</span>
          </div>

          <div class="perm">
            <Check v-if="item.canChoosePromoter" :size="32" />
            <span>{{ t('partner_grant_promoter_label') }}</span>
          </div>

          <div class="perm">
            <Check v-if="item.canSeeInsights" :size="32" />
            <span>{{ t('partner_grant_insights_label') }}</span>
          </div>

          <div>
            <UranusIconAction
                v-if="canEditPartnerRights && direction === 'outgoing'"
                :icon="Edit"
                @click="onEditOutgoingGrants(item)"
                style="margin-right: 0.2rem;"
            />
          </div>
        </div>
      </div>
    </div>
  </UranusCard>

  <UranusPartnerGrantsModal
      v-if="selectedItem && appStore.orgUuid"
      :org-uuid="appStore.orgUuid"
      :partner="selectedItem"
      @close="selectedItem = null"
      @saved="onSaved"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Edit } from 'lucide-vue-next'
import { useAppStore } from '@/store/appStore.ts'
import type { PartnerListItem, PartnerPermissions } from '@/domain/partner/partner.model.ts'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusPartnerGrantsModal from '@/component/partner/UranusPartnerGrantsModal.vue'

const { t } = useI18n()

const selectedItem = ref<PartnerListItem | null>(null)
const appStore = useAppStore()

const props = withDefaults(defineProps<{
  items: PartnerListItem[]
  direction: 'incoming' | 'outgoing'
  canEditPartnerRights?: boolean
}>(), {
  canEditPartnerRights: false
})


const filteredItems = computed(() => {
  return props.items.filter(item => item.direction === props.direction)
})

function onEditOutgoingGrants(item: PartnerListItem) {
  selectedItem.value = item
}

function onSaved(permissions: PartnerPermissions) {
  if (selectedItem.value) Object.assign(selectedItem.value, permissions)
  selectedItem.value = null
}
</script>

<style scoped lang="scss">
.partner-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.partner-grid > * {
  display: flex;
  flex-direction: row;
}

@media (max-width: 1024px) {
  .partner-grid {
    grid-template-columns: 1fr;
  }
}

.partner-card {
  border-top: 1px solid var(--uranus-dashboard-border-color);
  padding-top: 1.4rem;
}

.partner-name {
  font-size: 1.4rem;
  font-weight: 500;
}

.partner-grants {
  display: flex;
  justify-content: end;
}

.partner-grants > .perm {
  display: flex;
  flex-direction: column;
  width: 80px;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.86rem;
  & span {
    color: var(--uranus-color-4);
  }
}
</style>