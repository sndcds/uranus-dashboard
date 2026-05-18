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

  <UranusModal
      :show="showModal"
      :title="t('partner_edit_grants')"
      @close="showModal = false"
  >
    <UranusForm>
      <h2 v-if="selectedItem">
        {{ selectedItem.orgName }}
      </h2>

      <UranusCheckbox
          id="can_choose_venue"
          v-model="modalCanChooseVenue"
          :label="t('partner_can_choose_venue')"
      />
      <UranusCheckbox
          id="can_choose_partner"
          v-model="modalCanChoosePartner"
          :label="t('partner_can_choose_partner')"
      />
      <UranusCheckbox
          id="can_choose_promoter"
          v-model="modalCanChoosePromoter"
          :label="t('partner_can_choose_promoter')"
      />
      <UranusCheckbox
          id="can_see_insights"
          v-model="modalCanSeeInsights"
          :label="t('partner_can_see_insights')"
      />

    </UranusForm>

    <UranusFormActions>
      <UranusButton @click="onCancel">{{ t('cancel') }}</UranusButton>
      <UranusButton @click="onSave">{{ t('save') }}</UranusButton>
    </UranusFormActions>

  </UranusModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { Check, Edit } from 'lucide-vue-next'
import { useAppStore } from '@/store/appStore.ts'
import type { PartnerListItem } from '@/domain/partner/partner.model.ts'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'

const { t } = useI18n()

const showModal = ref(false)
const selectedItem = ref<PartnerListItem | null>(null)
const appStore = useAppStore()

const modalCanChooseVenue = ref<boolean>(false)
const modalCanChoosePartner = ref<boolean>(false)
const modalCanChoosePromoter = ref<boolean>(false)
const modalCanSeeInsights = ref<boolean>(false)

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
  modalCanChooseVenue.value = !!item.canChooseVenue
  modalCanChoosePartner.value = !!item.canChoosePartner
  modalCanChoosePromoter.value = !!item.canChoosePromoter
  modalCanSeeInsights.value = !!item.canSeeInsights
  showModal.value = true
}

function onCancel() {
  showModal.value = false
}

async function onSave() {
  if (!selectedItem.value) return

  const payload = {
    can_choose_venue: modalCanChooseVenue.value,
    can_choose_partner: modalCanChoosePartner.value,
    can_choose_promoter: modalCanChoosePromoter.value,
    can_see_insights: modalCanSeeInsights.value,
  }

  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/${selectedItem.value.orgUuid}/grants`
    await apiFetch(apiPath, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    selectedItem.value.canChooseVenue = modalCanChooseVenue.value
    selectedItem.value.canChoosePartner = modalCanChoosePartner.value
    selectedItem.value.canChoosePromoter = modalCanChoosePromoter.value
    selectedItem.value.canSeeInsights = modalCanSeeInsights.value

    showModal.value = false
  } catch (e) {
    console.error(e)
    // optional: rollback UI if needed
    // (only needed if consistency is critical)
  }
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