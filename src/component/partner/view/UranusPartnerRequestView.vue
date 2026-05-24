<!--
  src/component/partner/view/UranusPartnerRequestView.vue
-->

<template xmlns="http://www.w3.org/1999/html">
  <div class="uranus-main-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('partner_request_title')"
        :subtitle="t('partner_request_intro')"
    />

    <UranusCard>
      <UranusForm>
        <h2>{{ t('search_partner_organization') }}</h2>
        <p>{{ t('search_partner_organization_tip') }}</p>
        <UranusOrgTypeahead ref="orgTypeahead" v-model:selectedOrg="chosenOrg" />
      </UranusForm>
    </UranusCard>

    <UranusFeedback v-if="!!successMessage" type="success">
      {{ successMessage }}
    </UranusFeedback>

    <UranusFeedback v-if="!!errorMessage" type="error">
      {{ errorMessage }}
    </UranusFeedback>

    <UranusCard v-if="chosenOrg">
      <UranusForm>
        <UranusFormRow>
          <div class="uranus-rows">
            <span>{{ t('request_to') }}</span>
            <h3>{{ chosenOrg.name }}</h3>
            <span>{{ chosenOrg.city }} / {{ chosenOrg.country }}</span>
          </div>
        </UranusFormRow>

        <UranusFormRow>
          <UranusTextarea
              id="message"
              v-model="message"
              :label="t('message_to_partner')"
              height="200px"
              resize="vertical"
          />
        </UranusFormRow>

        <UranusFormActions>
          <UranusButton @click="onSendRequest">
            {{ t('send_partner_request') }}
          </UranusButton>
        </UranusFormActions>
      </UranusForm>

    </UranusCard>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import type { PartnerDTO } from '@/api/dto/partnerDTO.ts'
import { mapPartnerListItem, type PartnerListItem } from '@/domain/partner/partner.model.ts'
import UranusCard from '@/component/ui/UranusCard.vue'
import type { OrgSelectInfo } from '@/domain/org/orgSelectInfo.model.ts'
import UranusOrgTypeahead from '@/component/org/UranusOrgTypeahead.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusTextarea from '@/component/ui/UranusTextarea.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusOrgTitle from "@/component/layout/UranusOrgTitle.vue";

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()

const orgTypeahead = ref<InstanceType<typeof UranusOrgTypeahead> | null>(null)
const chosenOrg = ref<OrgSelectInfo | null>(null)
const partnerListItems = ref<PartnerListItem[]>([])
const message = ref<string>('')

const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
let redirectTimeout: ReturnType<typeof window.setTimeout> | null = null

async function onSendRequest() {
  if (!chosenOrg.value) return

  if (chosenOrg.value.uuid == appStore.orgUuid) {
    errorMessage.value = t('partner_cant_choose_self_as_partner')
    chosenOrg.value = null
    orgTypeahead.value?.reset()
    return
  }

  successMessage.value = null
  errorMessage.value = null
  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/request`
    await apiFetch(apiPath, {
      method: 'POST',
      body: JSON.stringify({
        to_org_uuid: chosenOrg.value.uuid,
        message: message.value,
      }),
    })

    message.value = ''
    chosenOrg.value = null
    successMessage.value = t('partner_request_success')
    redirectTimeout = window.setTimeout(() => {
      router.push({ name: 'admin-partners' })
    }, 5000)
  } catch (err: any) {
    if (err.error?.includes('(#1)')) {
      errorMessage.value = t('partnership_already_exists')
    } else if (err.error?.includes('(#2)')) {
      errorMessage.value = t('partner_request_already_exists')
    } else if (err.error?.includes('(#3)')) {
      errorMessage.value = t('partner_organization_not_found')
    } else {
      console.error(err.error)
      errorMessage.value = t('unexpected_error')
    }
  } finally {
    orgTypeahead.value?.reset()
  }
}

onMounted(async () => {
  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/grants`
    const apiResponse = await apiFetch<any>(apiPath)

    const data = apiResponse.data.partners as PartnerDTO[]
    partnerListItems.value = (data || []).map(dto => mapPartnerListItem(dto))
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      errorMessage.value = e.data?.error || 'Failed to load partner list'
    } else {
      errorMessage.value = 'Unknown error'
    }
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (redirectTimeout) {
    window.clearTimeout(redirectTimeout)
  }
})
</script>

<style scoped lang="scss">
.partner-card {
  border-top: 1px solid var(--uranus-dashboard-border-color);
  padding-top: 1.4rem;
}

.partner-name {
  font-size: 1.4rem;
  font-weight: 500;
}

.partner-permissions {
  display: flex;
  justify-content: end;
}

.partner-permissions > .perm {
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
