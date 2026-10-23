<template>
  <UranusModal
      :show="true"
      :title="acceptRequest ? t('partner_accept_request') : t('partner_edit_grants')"
      :close-on-escape="!isSaving"
      @close="onClose"
  >
    <UranusFeedback v-if="errorKey" type="error">
      {{ t(errorKey) }}
    </UranusFeedback>

    <UranusForm @submit="onSave">
      <h2>{{ partner.orgName }}</h2>

      <fieldset v-if="canEditGrants" :disabled="isSaving" class="partner-grants-fields">
        <UranusCheckbox
            :id="`${id}-venue`"
            v-model="permissions.canChooseVenue"
            :label="t('partner_can_choose_venue')"
        />
        <UranusCheckbox
            :id="`${id}-partner`"
            v-model="permissions.canChoosePartner"
            :label="t('partner_can_choose_partner')"
        />
        <UranusCheckbox
            :id="`${id}-promoter`"
            v-model="permissions.canChoosePromoter"
            :label="t('partner_can_choose_promoter')"
        />
        <UranusCheckbox
            :id="`${id}-insights`"
            v-model="permissions.canSeeInsights"
            :label="t('partner_can_see_insights')"
        />
      </fieldset>

      <UranusFormActions>
        <UranusButton :disabled="isSaving" @click="onClose">{{ t('cancel') }}</UranusButton>
        <UranusButton type="submit" :loading="isSaving" :loading-text="t('saving')">
          {{ acceptRequest && !requestAccepted
              ? t(canEditGrants ? 'partner_accept_and_grant' : 'accept')
              : t('save') }}
        </UranusButton>
      </UranusFormActions>
    </UranusForm>
  </UranusModal>
</template>

<script setup lang="ts">
import { reactive, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import type { PartnerListItem, PartnerPermissions } from '@/domain/partner/partner.model.ts'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'

const props = withDefaults(defineProps<{
  orgUuid: string
  partner: Pick<PartnerListItem, 'orgUuid' | 'orgName'> & Partial<PartnerPermissions>
  acceptRequest?: boolean
  canEditGrants?: boolean
}>(), {
  acceptRequest: false,
  canEditGrants: true,
})

const emit = defineEmits<{
  saved: [permissions: PartnerPermissions]
  close: [requestAccepted: boolean]
}>()

const { t } = useI18n()
const id = useId()
const permissions = reactive<PartnerPermissions>({
  canChooseVenue: props.partner.canChooseVenue ?? false,
  canChoosePartner: props.partner.canChoosePartner ?? false,
  canChoosePromoter: props.partner.canChoosePromoter ?? false,
  canSeeInsights: props.partner.canSeeInsights ?? false,
})
const isSaving = ref(false)
const requestAccepted = ref(false)
const errorKey = ref<string | null>(null)

function onClose() {
  if (!isSaving.value) emit('close', requestAccepted.value)
}

async function onSave() {
  if (isSaving.value) return
  isSaving.value = true
  errorKey.value = null

  try {
    if (props.acceptRequest && !requestAccepted.value) {
      await apiFetch(`/api/admin/org/${props.orgUuid}/partner/request/${props.partner.orgUuid}/accept`, {
        method: 'POST',
      })
      requestAccepted.value = true
    }

    if (props.canEditGrants) {
      await apiFetch(`/api/admin/org/${props.orgUuid}/partner/${props.partner.orgUuid}/grants`, {
        method: 'POST',
        body: JSON.stringify({
          can_choose_venue: permissions.canChooseVenue,
          can_choose_partner: permissions.canChoosePartner,
          can_choose_promoter: permissions.canChoosePromoter,
          can_see_insights: permissions.canSeeInsights,
        }),
      })
    }

    emit('saved', { ...permissions })
  } catch {
    errorKey.value = requestAccepted.value
        ? 'partner_request_grants_save_error'
        : props.acceptRequest ? 'partner_request_accept_error' : 'partner_grants_save_error'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped lang="scss">
.partner-grants-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;

  :deep(.label-text) {
    white-space: normal;
  }
}
</style>
